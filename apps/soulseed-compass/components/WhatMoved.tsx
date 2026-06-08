import type { ReturnView } from "@holo/contracts";

// Renders only. Every line traces to the user's verbatim answer (whatChangedLine)
// or a deterministic diff between two stored Snapshots — no LLM invention here.

const FIELD_LABELS: Record<string, string> = {
  identitySignal: "Identity signal",
  presentState: "Present state",
  returningPattern: "Returning pattern",
  emergingTrajectory: "Emerging trajectory",
  firstInvitation: "First invitation",
};

interface WhatMovedProps {
  view: ReturnView;
}

/** "What moved since last time" — sits above the regenerated Snapshot on return. */
export function WhatMoved({ view }: WhatMovedProps) {
  const moved = view.diff.perField.filter((f) => !f.unchanged);

  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] gold-text">
        What moved since last time
      </div>

      {view.diff.whatChangedLine ? (
        <blockquote className="mb-4 border-l-2 border-gold/40 pl-4 text-sm italic text-neutral-300">
          “{view.diff.whatChangedLine}”
        </blockquote>
      ) : null}

      {moved.length === 0 ? (
        <p className="text-sm text-neutral-400">
          You&apos;re holding the same ground. That counts as data.
        </p>
      ) : (
        <dl className="space-y-4">
          {moved.map((f) => (
            <div key={f.field}>
              <dt className="mb-1 text-[11px] uppercase tracking-[0.2em] text-gold/70">
                {FIELD_LABELS[f.field] ?? f.field}
              </dt>
              <dd className="space-y-1 text-sm leading-relaxed">
                <p className="text-neutral-500 line-through">{f.prior}</p>
                <p className="gold-text">{f.current}</p>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
