import { HURL_PATTERN, SoulSeedSnapshotV2Schema } from "@holo/contracts";
import type { MemoryRecord, SnapshotRow, SoulSeedSnapshotV2 } from "@holo/contracts";
import { CoreError } from "../../errors";
import type { CoreRepo } from "../../repo";
import { SOULSEED_AGENT_DOCTRINE } from "../agents/soulseed-agent-instructions";
import { mintAndPersistHurl } from "../hurl";
import { getContext } from "../memory";

// SoulSeed Snapshot v2 synthesis (S86). DETERMINISTIC: every row traces
// directly to cohering memories — no fabrication risk. The ONE allowed LLM
// call composes angelHandoffSummary (handoff prose for downstream agents),
// and even that is instructed to use only the structured input; on any
// failure it degrades to a deterministic template.

const SOURCE_PRODUCT = "soulseed";
const ANTHROPIC_MODEL = process.env.ANTHROPIC_MODEL ?? "claude-sonnet-4-5-20250929";
const CHAMBER_KEYS = [
  "threshold",
  "identity-seed",
  "present-state",
  "memory-root",
  "trajectory-branch",
  "living-invitation",
] as const;
const MATTERS_MOST_MIN_CHARS = 60; // quality bar for the optional 6th row

export interface ComposeSnapshotV2Input {
  userId: string;
  sessionId: string;
}

export interface ComposeSnapshotV2Options {
  mode?: "mock" | "live";
}

function resolveMode(override?: "mock" | "live"): "mock" | "live" {
  if (override) return override;
  return process.env.AGENT_MODE === "live" && process.env.ANTHROPIC_API_KEY ? "live" : "mock";
}

// --- small deterministic text helpers --------------------------------------

const trimDot = (v: string): string => v.trim().replace(/[.\s]+$/, "");
const lowerFirst = (v: string): string => (v ? v[0]!.toLowerCase() + v.slice(1) : v);
const capitalize = (v: string): string => (v ? v[0]!.toUpperCase() + v.slice(1) : v);

/** First clause of a vector (split on em-dash/slash/colon), capped at `maxWords`. */
function firstClause(vector: string, maxWords: number): string {
  const clause = vector.split(/[—:/]| - /)[0] ?? vector;
  return trimDot(clause.trim().split(/\s+/).slice(0, maxWords).join(" "));
}

/** Branch slug from the identitySeed vector: first 2 substantial words. */
export function slugifyBranch(vector: string): string {
  const words = vector
    .toLowerCase()
    .replace(/[^a-z\s-]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 4);
  if (words.length === 0) return "first-cohering";
  return words.slice(0, 2).join("-");
}

// --- memory reads -----------------------------------------------------------

interface CoheringMemories {
  recognitionLine: string;
  supportingLine: string;
  supportStyle: string[];
  avoid: string[];
  nextStep: string;
  vectors: Record<string, string>; // chamberKey slug → latest vector content
}

function stateByKey(state: MemoryRecord[], key: string): MemoryRecord | undefined {
  return state.find((m) => m.contentJson?.["key"] === key);
}

function signalsOf(mem: MemoryRecord | undefined): string[] | null {
  const fromJson = mem?.contentJson?.["signals"];
  if (Array.isArray(fromJson)) return fromJson.filter((s): s is string => typeof s === "string");
  if (!mem) return null;
  try {
    const parsed = JSON.parse(mem.content) as unknown;
    return Array.isArray(parsed) ? parsed.filter((s): s is string => typeof s === "string") : null;
  } catch {
    return null;
  }
}

async function readCoheringMemories(repo: CoreRepo, userId: string): Promise<CoheringMemories> {
  const ctx = await getContext(repo, {
    userId,
    productKey: SOURCE_PRODUCT,
    scopes: ["state", "narrative"],
  });

  const recognition = stateByKey(ctx.state, "cohering.recognition");
  const supportStyleMem = stateByKey(ctx.state, "cohering.support_style");
  const avoidMem = stateByKey(ctx.state, "cohering.avoid");
  const nextStepMem = stateByKey(ctx.state, "cohering.next_step");

  // latest vector per chamber: list is ordered importance desc, createdAt desc,
  // so the FIRST occurrence per chamberKey is the most recent run's vector.
  const vectors: Record<string, string> = {};
  for (const mem of ctx.narrative) {
    const key = mem.contentJson?.["chamberKey"];
    if (typeof key === "string" && !(key in vectors)) vectors[key] = mem.content;
  }

  const supportStyle = signalsOf(supportStyleMem);
  const avoid = signalsOf(avoidMem);
  const missing =
    !recognition ||
    !supportStyle ||
    avoid === null ||
    !nextStepMem ||
    CHAMBER_KEYS.some((k) => !(k in vectors));
  if (missing) {
    throw new CoreError("cohering_signal_missing", 409, "cohering memories incomplete for user");
  }

  return {
    recognitionLine: recognition.content,
    supportingLine:
      typeof recognition.contentJson?.["supportingLine"] === "string"
        ? (recognition.contentJson["supportingLine"] as string)
        : recognition.content,
    supportStyle,
    avoid,
    nextStep: nextStepMem.content,
    vectors,
  };
}

// --- deterministic row derivation -------------------------------------------

function deriveRows(mem: CoheringMemories): Omit<SoulSeedSnapshotV2, "angelHandoffSummary" | "hurlSeedData"> {
  const identitySeed = mem.vectors["identity-seed"]!;
  const presentState = mem.vectors["present-state"]!;
  const memoryRoot = mem.vectors["memory-root"]!;
  const livingInvitation = mem.vectors["living-invitation"]!;

  const identityPattern: SnapshotRow = {
    title: capitalize(firstClause(identitySeed, 4)),
    description: `${trimDot(identitySeed)}. You bring ${lowerFirst(trimDot(presentState))}.`,
  };

  const currentNeed: SnapshotRow = {
    title: capitalize(firstClause(presentState, 5)),
    description: mem.supportingLine,
  };

  const styles = mem.supportStyle.slice(0, 3).map(capitalize);
  const styleDescParts: string[] = [];
  if (styles[0]) styleDescParts.push(`Honor: ${lowerFirst(styles[0])}.`);
  if (styles[1]) styleDescParts.push(`Challenge: ${lowerFirst(styles[1])}.`);
  if (styles[2]) styleDescParts.push(`Provide: ${lowerFirst(styles[2])}.`);
  const supportStyle: SnapshotRow = {
    title: `${styles.join(" · ")}.`,
    description: styleDescParts.join(" "),
  };

  const avoid = mem.avoid.map(capitalize);
  const avoidDescParts: string[] = [];
  if (avoid[0]) avoidDescParts.push(`No ${lowerFirst(avoid[0])} without clear application.`);
  if (avoid[1]) avoidDescParts.push(`No ${lowerFirst(avoid[1])} in place of real recognition.`);
  const whatAIShouldAvoid: SnapshotRow =
    avoid.length > 0
      ? { title: `${avoid.join(". ")}.`, description: avoidDescParts.join(" ") }
      : { title: "Nothing flagged yet.", description: "No avoid signals captured in this first pass." };

  const whatMattersMost: SnapshotRow | undefined =
    memoryRoot.length >= MATTERS_MOST_MIN_CHARS
      ? { title: capitalize(firstClause(memoryRoot, 7)), description: trimDot(memoryRoot) + "." }
      : undefined;

  const nextCoherentStep: SnapshotRow = {
    title: mem.nextStep,
    description: `Then ${lowerFirst(trimDot(livingInvitation))}.`,
  };

  return {
    identityPattern,
    currentNeed,
    supportStyle,
    whatAIShouldAvoid,
    ...(whatMattersMost ? { whatMattersMost } : {}),
    nextCoherentStep,
  };
}

// --- angelHandoffSummary (the ONE LLM-composed field) ------------------------

type Rows = ReturnType<typeof deriveRows>;

function mockHandoff(rows: Rows): string {
  return `This user arrives as ${rows.identityPattern.title}. They currently need ${lowerFirst(trimDot(rows.currentNeed.title))}. Support them with ${trimDot(rows.supportStyle.title)}; avoid ${lowerFirst(trimDot(rows.whatAIShouldAvoid.title))}. Their next coherent step is ${lowerFirst(trimDot(rows.nextCoherentStep.title))}.`;
}

async function liveHandoff(rows: Rows, recognitionLine: string): Promise<string | null> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) return null;
  const system = `${SOULSEED_AGENT_DOCTRINE}

---

You write the ANG3L handoff summary for a SoulSeed. One paragraph (3-4 sentences). Honor the doctrine above. The paragraph tells a future AI exactly how to meet this user. Use plain declarative language. No fabrication beyond the structured input given. Return ONLY the paragraph — no preamble, no JSON, no markdown.`;
  try {
    const res = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: { "content-type": "application/json", "x-api-key": apiKey, "anthropic-version": "2023-06-01" },
      body: JSON.stringify({
        model: ANTHROPIC_MODEL,
        max_tokens: 400,
        system,
        messages: [{ role: "user", content: JSON.stringify({ recognitionLine, ...rows }) }],
      }),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { content?: { text?: string }[] };
    const text = (data.content ?? []).map((b) => b.text ?? "").join("").trim();
    return text.length > 0 ? text : null;
  } catch {
    return null;
  }
}

// --- hurlSeedData: structured VIEW of the existing HURL (no grammar change) --

function deriveHurlSeedData(hurlPath: string, identitySeedVector: string): SoulSeedSnapshotV2["hurlSeedData"] {
  const match = HURL_PATTERN.exec(hurlPath);
  if (!match) {
    throw new CoreError("invalid_hurl", 500, `minted HURL did not parse: ${hurlPath}`);
  }
  const [, , chamber, stage, coherence] = match;
  return {
    realm: "soulseed",
    chamber: chamber!,
    stage: Number(stage),
    branch: slugifyBranch(identitySeedVector),
    coherence: Number(coherence),
  };
}

/**
 * Compose the SoulSeed Snapshot v2 from cohering memories. Throws
 * cohering_signal_missing (409) when prerequisites are absent. Deterministic
 * except angelHandoffSummary (one LLM call, mock/fallback template otherwise).
 */
export async function composeSnapshotV2(
  repo: CoreRepo,
  input: ComposeSnapshotV2Input,
  options: ComposeSnapshotV2Options = {}
): Promise<SoulSeedSnapshotV2> {
  const mem = await readCoheringMemories(repo, input.userId); // throws if incomplete
  const rows = deriveRows(mem);

  const mode = resolveMode(options.mode);
  let handoff: string;
  if (mode === "live") {
    handoff = (await liveHandoff(rows, mem.recognitionLine)) ?? mockHandoff(rows);
  } else {
    handoff = mockHandoff(rows);
  }

  const hurlPath = await mintAndPersistHurl(repo, input.sessionId);
  const hurlSeedData = deriveHurlSeedData(hurlPath, mem.vectors["identity-seed"]!);

  return SoulSeedSnapshotV2Schema.parse({
    ...rows,
    angelHandoffSummary: handoff,
    hurlSeedData,
  });
}
