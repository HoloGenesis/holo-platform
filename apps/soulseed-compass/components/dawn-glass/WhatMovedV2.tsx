import type { SnapshotRow, SoulSeedSnapshotV2 } from "@holo/contracts";
import { DawnGlass } from "./DawnGlass";

// Return-visit delta panel (S89) — V2 shape of S61's WhatMoved. Renders only
// the rows that MOVED (prior struck-through → current in honey), with the
// user's verbatim "what changed?" answer quoted at the top. Pure render:
// every line traces to stored Snapshots or the user's own words.

const ROWS: { key: keyof SoulSeedSnapshotV2; label: string }[] = [
  { key: "identityPattern", label: "Identity Pattern" },
  { key: "currentNeed", label: "Current Need" },
  { key: "supportStyle", label: "Support Style" },
  { key: "whatAIShouldAvoid", label: "What AI Should Avoid" },
  { key: "whatMattersMost", label: "What Matters Most" },
  { key: "nextCoherentStep", label: "Next Coherent Step" },
];

const asRow = (value: unknown): SnapshotRow | null =>
  value && typeof value === "object" && "title" in value && "description" in value
    ? (value as SnapshotRow)
    : null;

const unchanged = (a: SnapshotRow | null, b: SnapshotRow | null): boolean =>
  (a?.title.trim() ?? "") === (b?.title.trim() ?? "") &&
  (a?.description.trim() ?? "") === (b?.description.trim() ?? "");

interface WhatMovedV2Props {
  prior: SoulSeedSnapshotV2;
  current: SoulSeedSnapshotV2;
  /** The user's verbatim "what changed?" answer. */
  whatChangedLine?: string;
}

export function WhatMovedV2({ prior, current, whatChangedLine }: WhatMovedV2Props) {
  const moved = ROWS.map(({ key, label }) => {
    const before = asRow(prior[key]);
    const after = asRow(current[key]);
    if (!before && !after) return null;
    if (unchanged(before, after)) return null;
    return { key, label, before, after };
  }).filter((r): r is NonNullable<typeof r> => r !== null);

  return (
    <DawnGlass className="border-soulseed-honey/30 p-6 md:p-8">
      <p className="text-sm uppercase tracking-widest text-soulseed-honey">
        What moved since last time.
      </p>

      {whatChangedLine && (
        <blockquote className="mt-4 border-l-2 border-soulseed-honey/40 pl-4 text-base italic text-soulseed-dawn/80">
          &ldquo;{whatChangedLine}&rdquo;
        </blockquote>
      )}

      {moved.length === 0 ? (
        <p className="mt-4 text-soulseed-dawn/70">
          You&apos;re holding the same ground. That counts as data.
        </p>
      ) : (
        <div className="mt-5 space-y-4">
          {moved.map(({ key, label, before, after }) => {
            // when the title held but the description moved, show the part
            // that actually changed — never an identical-looking strike pair
            const titleMoved = (before?.title.trim() ?? "") !== (after?.title.trim() ?? "");
            const prevText = titleMoved ? before?.title : before?.description;
            const currText = titleMoved ? after?.title : after?.description;
            return (
              <div key={key}>
                <p className="text-xs uppercase tracking-[0.2em] text-soulseed-honey/70">{label}</p>
                {prevText && (
                  <p className="mt-1 text-sm text-soulseed-dawn/40 line-through">{prevText}</p>
                )}
                {currText && <p className="mt-0.5 text-lg text-soulseed-honey">{currText}</p>}
              </div>
            );
          })}
        </div>
      )}
    </DawnGlass>
  );
}
