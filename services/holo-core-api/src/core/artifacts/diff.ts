import type { SnapshotField, SoulSeedSnapshot, SoulSeedSnapshotDiff } from "@holo/contracts";

// Pure, deterministic Snapshot diff — NO LLM. Running it twice on the same two
// Snapshots yields the same result (reproducibility rule). Every oneLineDelta is
// built from the texts themselves, never generated.

const FIELDS: SnapshotField[] = [
  "identitySignal",
  "presentState",
  "returningPattern",
  "emergingTrajectory",
  "firstInvitation",
];

/** Collapse runs of whitespace + trim, so cosmetic spacing isn't a "change". */
const normalize = (value: string): string => value.trim().replace(/\s+/g, " ");

/** Clip to ~60 chars with an ellipsis, for the one-line delta. */
const clip = (value: string, max = 60): string => {
  const n = normalize(value);
  return n.length > max ? `${n.slice(0, max - 1)}…` : n;
};

export interface DiffMeta {
  /** The user's verbatim return-mode answer. */
  whatChangedLine?: string;
  priorSnapshotAt?: string;
  currentSnapshotAt?: string;
}

/**
 * Diff two Snapshots field by field. A field is `unchanged` when its trimmed,
 * whitespace-normalized text matches; otherwise prior + current are returned
 * with a deterministic one-line delta.
 */
export function diffSnapshots(
  prev: SoulSeedSnapshot,
  next: SoulSeedSnapshot,
  meta: DiffMeta = {}
): SoulSeedSnapshotDiff {
  const perField = FIELDS.map((field) => {
    const prior = prev[field] ?? "";
    const current = next[field] ?? "";
    if (normalize(prior) === normalize(current)) {
      return { field, unchanged: true, prior, current };
    }
    return {
      field,
      unchanged: false,
      prior,
      current,
      oneLineDelta: `From "${clip(prior)}" → "${clip(current)}"`,
    };
  });

  return {
    perField,
    whatChangedLine: meta.whatChangedLine ?? "",
    priorSnapshotAt: meta.priorSnapshotAt ?? "",
    currentSnapshotAt: meta.currentSnapshotAt ?? "",
  };
}
