import { ProofOutputSchema } from "@holo/contracts";
import type { MemoryRecord, ProofInput, ProofOutput } from "@holo/contracts";
import { CoreError } from "../../../errors";
import type { CoreRepo } from "../../../repo";
import { getContext } from "../../memory";
import { upsertMemory } from "../../memory";

// proof-v1 (S85). Two parallel responses to the same becoming question — a bland
// generic baseline and a SoulSeed-attuned answer that cites what the user told
// us. Self-contained (mirrors cohering-v1): its own mock/live dispatch, kept
// outside the persona runAgent so the existing core tests stay safe.

const SOURCE_PRODUCT = "soulseed";
const DEMO_QUESTION = "What should I focus on next?"; // v1: stable; can later derive from cohering signal
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
const TRANSIENT = new Set([408, 429, 500, 502, 503, 529]);

const GENERIC_SYSTEM =
  "You are a helpful generic AI assistant. Respond briefly (2-3 sentences) with broadly useful guidance. Do not reference any specific user context.";

export interface RunProofOptions {
  mode?: "mock" | "live";
}

function resolveMode(override?: "mock" | "live"): "mock" | "live" {
  if (override) return override;
  return process.env.AGENT_MODE === "live" && process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}

const clip = (value: string, max = 64): string => {
  const v = value.trim().replace(/\s+/g, " ");
  return v.length > max ? `${v.slice(0, max - 1)}…` : v;
};

function extractJson(text: string): string {
  const fenced = text.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const body = (fenced?.[1] ?? text).trim();
  const start = body.indexOf("{");
  const end = body.lastIndexOf("}");
  return start !== -1 && end > start ? body.slice(start, end + 1) : body;
}

interface CoheringSignal {
  recognitionLine: string;
  vectors: string[];
  citationSource: string;
}

/** Read the cohering memories written by cohering-v1. Throws if none exist. */
async function readCoheringSignal(repo: CoreRepo, userId: string): Promise<CoheringSignal> {
  const ctx = await getContext(repo, {
    userId,
    productKey: SOURCE_PRODUCT,
    scopes: ["state", "narrative"],
  });
  const recognitionMem = ctx.state.find(
    (m: MemoryRecord) => m.contentJson?.["key"] === "cohering.recognition"
  );
  const vectorMems = ctx.narrative.filter((m: MemoryRecord) => m.contentJson?.["chamberKey"]);
  if (!recognitionMem) {
    throw new CoreError("cohering_signal_missing", 409, "no cohering.recognition memory for user");
  }
  const presentState = vectorMems.find((m) => m.contentJson?.["chamberKey"] === "present-state");
  return {
    recognitionLine: recognitionMem.content,
    vectors: vectorMems.map((m) => m.content),
    citationSource: (presentState ?? recognitionMem).content,
  };
}

/** Deterministic mock — visibly different + citation appears verbatim in attuned. */
function mockProof(signal: CoheringSignal): ProofOutput {
  const citation = clip(signal.citationSource, 60);
  return {
    demoQuestion: DEMO_QUESTION,
    genericResponse:
      "Here are some tips that might help you: set a clear goal, break it into small steps, and review your progress regularly. Consistency usually beats intensity.",
    attunedResponse: `Drawing on what you told me — ${citation} — I'd point you at one thing: name the single priority that matters most this week, then define what "enough" looks like before you start.`,
    attunedCitation: citation,
  };
}

async function anthropic(system: string, userContent: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  for (let attempt = 1; attempt <= 2; attempt++) {
    let res: Response;
    try {
      res = await fetch("https://api.anthropic.com/v1/messages", {
        method: "POST",
        headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
        body: JSON.stringify({
          model: ANTHROPIC_MODEL,
          max_tokens: 600,
          system,
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
    return (data.content ?? []).map((b) => b.text ?? "").join("");
  }
  return null;
}

/** Live: two parallel calls. Attuned returns JSON {response, citation}. */
async function liveProof(signal: CoheringSignal): Promise<ProofOutput | null> {
  const attunedSystem = `You are a SoulSeed-attuned ANG3L meeting this specific person. Voice: recognition-first, declarative, no praise filler, never "totally valid".
What you know about them:
- Recognition: ${signal.recognitionLine}
- Signals: ${signal.vectors.map((v) => `• ${v}`).join("\n")}
Respond in 2-3 sentences. BEGIN by citing one specific thing you know about them (a signal or the recognition), then offer a concrete next focus.
Return a SINGLE JSON object and nothing else: {"response": string, "citation": string}
"citation" MUST be a short phrase that appears VERBATIM inside "response".`;

  const [genericText, attunedRaw] = await Promise.all([
    anthropic(GENERIC_SYSTEM, DEMO_QUESTION),
    anthropic(attunedSystem, DEMO_QUESTION),
  ]);
  if (!genericText || !attunedRaw) return null;

  let attuned: { response?: unknown; citation?: unknown };
  try {
    attuned = JSON.parse(extractJson(attunedRaw)) as { response?: unknown; citation?: unknown };
  } catch {
    return null;
  }
  const response = typeof attuned.response === "string" ? attuned.response : "";
  let citation = typeof attuned.citation === "string" ? attuned.citation : "";
  // citation must appear verbatim in the response; if not, fall back to a known phrase
  if (!response || !citation || !response.includes(citation)) {
    citation = clip(signal.citationSource, 60);
    if (!response.includes(citation)) return null; // let caller fall back to mock
  }
  const candidate = {
    demoQuestion: DEMO_QUESTION,
    genericResponse: genericText.trim(),
    attunedResponse: response.trim(),
    attunedCitation: citation,
  };
  const parsed = ProofOutputSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

/**
 * Run proof-v1. Reads cohering memories (throws cohering_signal_missing if none),
 * produces a generic + attuned response (attuned cites the user verbatim), and
 * persists one deduped state memory keyed proof.shown (importance 0.55).
 */
export async function runProofV1(
  repo: CoreRepo,
  input: ProofInput,
  options: RunProofOptions = {}
): Promise<ProofOutput> {
  const signal = await readCoheringSignal(repo, input.userId); // throws if cohering missing
  const mode = resolveMode(options.mode);

  let output: ProofOutput;
  if (mode === "live") {
    output = (await liveProof(signal)) ?? mockProof(signal);
  } else {
    output = mockProof(signal);
  }

  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: SOURCE_PRODUCT,
    scope: "state",
    content: output.attunedResponse,
    contentJson: { key: "proof.shown", ...output },
    importance: 0.55,
  });

  return output;
}
