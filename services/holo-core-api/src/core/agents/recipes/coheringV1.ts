import { CoheringOutputSchema } from "@holo/contracts";
import type { ChamberVectors, CoheringInput, CoheringOutput } from "@holo/contracts";
import type { CoreRepo } from "../../../repo";
import { upsertMemory } from "../../memory";

// cohering-v1 (S84). A SINGLE LLM call reads the user's one freeform answer and
// returns a recognition line (REZZIE voice) + 6 chamber vectors. The chambers
// are hidden interpretive lenses. Reproducibility holds: the recognition line
// shown to the user derives from this output, never invented in the UI.

const SOURCE_PRODUCT = "soulseed";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
const TRANSIENT = new Set([408, 429, 500, 502, 503, 529]);

/** Maps the camelCase vector keys → the canonical chamber slugs (memory tag). */
const VECTOR_TO_CHAMBER: Record<keyof ChamberVectors, string> = {
  threshold: "threshold",
  identitySeed: "identity-seed",
  presentState: "present-state",
  memoryRoot: "memory-root",
  trajectoryBranch: "trajectory-branch",
  livingInvitation: "living-invitation",
};

const SYSTEM_PROMPT = `You are REZZIE, the Sensei Wonderdog of SoulSeed Compass, meeting a person through a single freeform answer. Your job is recognition, not validation.

Voice rules (non-negotiable):
- Recognition-first: name what you see in them. Never praise, never flatter.
- Banned: "great", "amazing", "totally valid", "thank you for sharing", "I'm sorry to hear that", "welcome back".
- Plain, warm, declarative. You meet them; you do not perform.

Read their answer (and any correction) and produce:
1. recognitionLine — 1–2 sentences that meet them where they actually are.
2. supportingLine — 1 sentence on why meeting them this way matters.
3. chamberVectors — six short interpretive strings, one per hidden lens:
   threshold (how they arrive), identitySeed (who they are at core),
   presentState (what's alive now), memoryRoot (what keeps returning),
   trajectoryBranch (where they're heading), livingInvitation (the next coherent step).
   Each is a terse phrase, e.g. "Builder / systems thinker / meaning-driven".
4. confidence — 0..1, how strongly the answer supports this reading.

Return a SINGLE valid JSON object and NOTHING else — no markdown, no prose outside the JSON:
{
  "recognitionLine": string,
  "supportingLine": string,
  "chamberVectors": {
    "threshold": string, "identitySeed": string, "presentState": string,
    "memoryRoot": string, "trajectoryBranch": string, "livingInvitation": string
  },
  "confidence": number
}`;

export interface RunCoheringOptions {
  /** Override the resolved mode (tests). */
  mode?: "mock" | "live";
}

function resolveMode(override?: "mock" | "live"): "mock" | "live" {
  if (override) return override;
  return process.env.AGENT_MODE === "live" && process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}

/** Pull the JSON object out of a model reply (strip ``` fences / surrounding prose). */
function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end > start ? body.slice(start, end + 1) : body;
}

const clip = (value: string, max = 90): string => {
  const v = value.trim().replace(/\s+/g, " ");
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
};

/** Deterministic, schema-valid output for mock mode (no network, no model). */
function mockCohering(input: CoheringInput): CoheringOutput {
  const a = clip(input.answer, 70);
  const adjusting = Boolean(input.correctionOf);
  return {
    recognitionLine: adjusting
      ? `Adjusting — I hear you differently now: you're someone shaped by "${a}".`
      : `You arrive as someone meeting this plainly: "${a}". You want to be met where you actually are.`,
    supportingLine: "Meeting you on your own terms keeps the work honest and your momentum intact.",
    chamberVectors: {
      threshold: `How they arrive — direct, from: "${a}"`,
      identitySeed: `Core signal — self-defined through their own words`,
      presentState: `What's alive now — "${a}"`,
      memoryRoot: `What keeps returning — the thread in their answer`,
      trajectoryBranch: `Heading toward — what they named as mattering`,
      livingInvitation: `Next coherent step — name one priority and define enough`,
    },
    confidence: 0.6,
  };
}

/** Live call: Anthropic Messages API. Retries transient errors a couple times. */
async function liveCohering(input: CoheringInput): Promise<CoheringOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const userContent = JSON.stringify({ answer: input.answer, correction: input.correctionOf ?? null });

  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-api-key": apiKey,
          "anthropic-version": "2023-06-01",
        },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 1200,
          system: SYSTEM_PROMPT,
          messages: [{ role: "user", content: userContent }],
        }),
      });
    } catch {
      if (attempt < 2) continue;
      return null;
    }
    if (!res.ok) {
      if (TRANSIENT.has(res.status) && attempt < 2) continue;
      return null;
    }
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = (data.content ?? []).map((b) => b.text ?? "").join("");
    const parsed = CoheringOutputSchema.safeParse(JSON.parse(extractJson(text)) as unknown);
    if (parsed.success) return parsed.data;
    // fall through to a second attempt; null after that
  }
  return null;
}

/** Safe fallback if the live model never returns a valid shape. */
function fallbackCohering(input: CoheringInput): CoheringOutput {
  return { ...mockCohering(input), confidence: 0.4 };
}

/**
 * Run cohering-v1: one model call → recognition line + 6 chamber vectors.
 * Persists 6 narrative-scope memories (chamberKey tagged, importance 0.75),
 * one state-scope recognition memory (key cohering.recognition, 0.85), and an
 * agent_runs row carrying correctionOf. Never throws on bad model output.
 */
export async function runCoheringV1(
  repo: CoreRepo,
  input: CoheringInput,
  options: RunCoheringOptions = {}
): Promise<CoheringOutput> {
  const mode = resolveMode(options.mode);

  let output: CoheringOutput;
  let model: string;
  if (mode === "live") {
    const live = await liveCohering(input);
    output = live ?? fallbackCohering(input);
    model = live ? `anthropic:${ANTHROPIC_MODEL}` : `anthropic:${ANTHROPIC_MODEL}+fallback`;
  } else {
    output = mockCohering(input);
    model = "mock";
  }

  // 6 narrative-scope chamber vectors — fresh rows each run (no dedup key), so a
  // correction pass adds 6 more rather than overwriting.
  for (const vectorKey of Object.keys(output.chamberVectors) as (keyof ChamberVectors)[]) {
    await upsertMemory(repo, {
      userId: input.userId,
      sessionId: input.sessionId,
      sourceProduct: SOURCE_PRODUCT,
      scope: "narrative",
      content: output.chamberVectors[vectorKey],
      contentJson: { chamberKey: VECTOR_TO_CHAMBER[vectorKey] },
      importance: 0.75,
    });
  }

  // one state-scope recognition memory — deduped (key), updated on a re-run.
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: output.recognitionLine,
    contentJson: { key: "cohering.recognition", supportingLine: output.supportingLine },
    importance: 0.85,
  });

  await repo.insertAgentRun({
    userId: input.userId,
    sessionId: input.sessionId,
    productKey: SOURCE_PRODUCT,
    chamberKey: "threshold",
    agentKey: "cohering",
    input: { answer: input.answer, correctionOf: input.correctionOf ?? null },
    output,
    model,
  });

  return output;
}
