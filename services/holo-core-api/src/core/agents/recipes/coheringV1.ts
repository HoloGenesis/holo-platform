import { CoheringOutputSchema } from "@holo/contracts";
import type { ChamberVectors, CoheringInput, CoheringOutput } from "@holo/contracts";
import type { CoreRepo } from "../../../repo";
import { upsertMemory } from "../../memory";
import { SOULSEED_AGENT_DOCTRINE } from "../soulseed-agent-instructions";

// cohering-v1 (S84, protocol-completed S84b). A SINGLE LLM call reads the
// user's one freeform answer and returns a recognition (REZZIE voice) + 6
// chamber vectors + support/avoid signals + the next coherent step. The
// doctrine block (soulseed-agent-instructions.ts) governs every turn.
// Reproducibility holds: everything shown to the user derives from this
// output, never invented in the UI.

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

// Doctrine first (flow, lenses, guardrails), then the turn-specific contract.
const SYSTEM_PROMPT = `${SOULSEED_AGENT_DOCTRINE}

---

You are REZZIE, the Sensei Wonderdog of SoulSeed Compass, meeting a person through a single freeform answer. Your job is recognition, not validation. Honor every line in the doctrine above.

Voice: recognition-first — name what you see in them. Plain, warm, declarative. You meet them; you do not perform.

Read their answer (and any augmentation or correction) and produce:
1. recognitionLine — 1–2 sentences that meet them where they actually are.
2. supportingLine — 1 sentence on why meeting them this way matters.
3. chamberVectors — six short interpretive strings, one per hidden chamber lens, each honoring that lens's semantic intent as defined in the doctrine above (threshold = why arriving now; identitySeed = what identity or becoming signal is present; presentState = what is active, unresolved, or seeking clarity; memoryRoot = what repeated pattern or prior frustration appears; trajectoryBranch = what direction or next possibility is implied; livingInvitation = what the next coherent invitation should be). Each is a terse phrase, e.g. "Builder / systems thinker / meaning-driven".
4. confidence — 0..1, how strongly the answer supports this reading.
5. supportStyleSignals — 1–8 short tags for how this person wants to be supported (e.g. "warm", "direct", "evidence-based", "creative", "concise").
6. avoidSignals — 0–8 short tags for what AI should avoid with them (e.g. "fluff", "false positivity", "generic advice", "over-poetic").
7. nextCoherentStep — ONE concrete sentence, e.g. "Choose one priority and define what enough looks like."

Return a SINGLE valid JSON object and NOTHING else — no markdown, no prose outside the JSON:
{
  "recognitionLine": string,
  "supportingLine": string,
  "chamberVectors": {
    "threshold": string, "identitySeed": string, "presentState": string,
    "memoryRoot": string, "trajectoryBranch": string, "livingInvitation": string
  },
  "confidence": number,
  "supportStyleSignals": string[],
  "avoidSignals": string[],
  "nextCoherentStep": string
}`;

export interface RunCoheringOptions {
  /** Override the resolved mode (tests). */
  mode?: "mock" | "live";
}

function resolveMode(override?: "mock" | "live"): "mock" | "live" {
  if (override) return override;
  return process.env.AGENT_MODE === "live" && process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}

/**
 * Path-aware user content. Path (b) augment ≠ path (c) regenerate — the prompt
 * differentiates them explicitly per the doctrine.
 */
function buildUserContent(input: CoheringInput): string {
  if (input.addedContext) {
    return `The user's original answer was: ${input.answer}
They added: ${input.addedContext}
Both are valid signal. Re-recognize them with both in mind. This is an augmentation, not a replacement.`;
  }
  if (input.correctionOf) {
    return `The user's original answer was: ${input.answer}
The recognition was off. They've clarified: ${input.correctionOf}
Treat the clarification as the corrective signal. Regenerate.`;
  }
  return `The user's answer: ${input.answer}`;
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
  const added = input.addedContext ? clip(input.addedContext, 60) : null;
  const corrected = input.correctionOf ? clip(input.correctionOf, 60) : null;

  let recognitionLine: string;
  if (added) {
    // path (b): augmentation — both the original and the addition are signal
    recognitionLine = `You arrive as "${a}" — and with what you added — "${added}" — the picture sharpens, not changes.`;
  } else if (corrected) {
    // path (c): regeneration from the corrective signal
    recognitionLine = `Adjusting — I hear you differently now: you're someone shaped by "${corrected}".`;
  } else {
    recognitionLine = `You arrive as someone meeting this plainly: "${a}". You want to be met where you actually are.`;
  }

  return {
    recognitionLine,
    supportingLine: "Meeting you on your own terms keeps the work honest and your momentum intact.",
    chamberVectors: {
      threshold: `Why arriving now — "${a}"`,
      identitySeed: `Becoming signal — self-defined through their own words`,
      presentState: `Active and seeking clarity — "${corrected ?? a}"`,
      memoryRoot: `What keeps returning: "${corrected ?? a}"`,
      trajectoryBranch: `Implied direction — what they named as mattering`,
      livingInvitation: `Next coherent invitation — name one priority and define enough`,
    },
    confidence: 0.6,
    supportStyleSignals: ["direct", "evidence-based", "concise"],
    avoidSignals: ["fluff", "generic advice"],
    nextCoherentStep: "Choose one priority and define what enough looks like.",
  };
}

/** Live call: Anthropic Messages API. Retries transient errors a couple times. */
async function liveCohering(input: CoheringInput): Promise<CoheringOutput | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const userContent = buildUserContent(input);

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
          max_tokens: 1400,
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
    let parsedJson: unknown;
    try {
      parsedJson = JSON.parse(extractJson(text));
    } catch {
      continue; // malformed JSON — one more attempt
    }
    const parsed = CoheringOutputSchema.safeParse(parsedJson);
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
 * Run cohering-v1: one model call → recognition + 6 chamber vectors + support/
 * avoid signals + next coherent step. Persists 6 narrative-scope chamber
 * memories (0.75, fresh rows each run), a deduped recognition state memory
 * (0.85), three deduped S86-feed state memories (support_style / avoid /
 * next_step, 0.75), and an agent_runs row carrying correctionOf/addedContext.
 * Never throws on bad model output.
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

  // 6 narrative-scope chamber vectors — fresh rows each run (no dedup key), so
  // an augment/correction pass adds 6 more rather than overwriting.
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

  // deduped state memories (key) — updated on a re-run; the LATEST is what S86 reads.
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: output.recognitionLine,
    contentJson: { key: "cohering.recognition", supportingLine: output.supportingLine },
    importance: 0.85,
  });
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: JSON.stringify(output.supportStyleSignals),
    contentJson: { key: "cohering.support_style", signals: output.supportStyleSignals },
    importance: 0.75,
  });
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: JSON.stringify(output.avoidSignals),
    contentJson: { key: "cohering.avoid", signals: output.avoidSignals },
    importance: 0.75,
  });
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: output.nextCoherentStep,
    contentJson: { key: "cohering.next_step" },
    importance: 0.75,
  });

  await repo.insertAgentRun({
    userId: input.userId,
    sessionId: input.sessionId,
    productKey: SOURCE_PRODUCT,
    chamberKey: "threshold",
    agentKey: "cohering",
    input: {
      answer: input.answer,
      correctionOf: input.correctionOf ?? null,
      addedContext: input.addedContext ?? null,
    },
    output,
    model,
  });

  return output;
}
