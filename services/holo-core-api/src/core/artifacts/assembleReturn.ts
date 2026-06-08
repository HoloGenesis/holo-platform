import { SoulSeedSnapshotSchema } from "@holo/contracts";
import type { ReturnView, SoulSeedSnapshot } from "@holo/contracts";
import type { CoreRepo } from "../../repo";
import { diffSnapshots } from "./diff";

const ARTIFACT_TYPE = "soulseed-snapshot";
const RETURN_DELTA_KEY = "return-delta";

/** Strip the mock/return opener prefix so whatChangedLine is the user's words. */
const stripReturnPrefix = (value: string): string =>
  value.replace(/^Since last time:\s*/i, "").trim();

export interface AssembleReturnInput {
  userId: string;
  sessionId: string;
  /** The freshly-assembled (current) Snapshot. */
  snapshot: SoulSeedSnapshot;
}

/**
 * Build the return view: the prior Snapshot, the current Snapshot, and the
 * deterministic diff between them, tagged with the user's verbatim "what
 * changed" answer. Returns null when there is no prior Snapshot (first visit).
 *
 * MUST be called BEFORE the current artifact is upserted — on a return the
 * session is reused, so its existing artifact row IS the prior Snapshot until
 * it's overwritten.
 */
export async function assembleReturnView(
  repo: CoreRepo,
  input: AssembleReturnInput
): Promise<ReturnView | null> {
  // (1) most recent stored Snapshot artifact = the prior Snapshot
  const priors = await repo.priorArtifacts(input.userId, 5);
  const priorRow = priors.find((a) => a.artifactType === ARTIFACT_TYPE);
  if (!priorRow) return null;

  const parsed = SoulSeedSnapshotSchema.safeParse(priorRow.contentJson);
  if (!parsed.success) return null;
  const previousSnapshot = parsed.data;

  // (2) the verbatim return-mode answer — the return-delta narrative memory
  // (tagged contentJson.key="return-delta"; deduped to one row, updated each
  // return). Fall back to the most recent high-importance narrative from this
  // session if an older skin didn't tag it.
  const narratives = await repo.listMemories(input.userId, ["narrative"], 50);
  const tagged = narratives.find((m) => m.contentJson?.["key"] === RETURN_DELTA_KEY);
  const fallback = narratives
    .filter((m) => m.importance >= 0.85 && m.sessionId === input.sessionId)
    .sort((a, b) => (b.createdAt ?? "").localeCompare(a.createdAt ?? ""))[0];
  const delta = tagged ?? fallback;
  const whatChangedLine = delta ? stripReturnPrefix(delta.content) : "";

  // (3) deterministic diff (no LLM)
  const diff = diffSnapshots(previousSnapshot, input.snapshot, {
    whatChangedLine,
    priorSnapshotAt: priorRow.createdAt ?? "",
    currentSnapshotAt: new Date().toISOString(),
  });

  return { previousSnapshot, currentSnapshot: input.snapshot, diff };
}
