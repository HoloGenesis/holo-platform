import type { SoulSeedSnapshot } from "@holo/contracts";
import { SnapshotShare } from "./SnapshotShare";

interface SoulSeedArtifactProps {
  snapshot: SoulSeedSnapshot | null;
  status: "idle" | "generating" | "done" | "error";
  error?: string | null;
}

const FIELDS: { label: string; key: keyof SoulSeedSnapshot }[] = [
  { label: "Identity signal", key: "identitySignal" },
  { label: "Present state", key: "presentState" },
  { label: "Returning pattern", key: "returningPattern" },
  { label: "Emerging trajectory", key: "emergingTrajectory" },
  { label: "First invitation", key: "firstInvitation" },
];

/** The SoulSeed Snapshot — derived from stored memory by Core, rendered here. */
export function SoulSeedArtifact({ snapshot, status, error }: SoulSeedArtifactProps) {
  return (
    <div className="glass rounded-2xl p-6">
      <div className="mb-5 flex items-center gap-2 text-xs uppercase tracking-[0.3em] gold-text">
        <span className="h-px w-6 bg-gold/40" />
        SoulSeed Snapshot
      </div>

      {status === "error" && <p className="text-sm text-amber-400">{error}</p>}

      <dl className="space-y-4">
        {FIELDS.map((field) => (
          <div key={field.key}>
            <dt className="mb-0.5 text-[11px] uppercase tracking-[0.2em] text-gold/70">
              {field.label}
            </dt>
            <dd className="text-sm leading-relaxed text-neutral-100">
              {snapshot ? (
                String(snapshot[field.key])
              ) : (
                <span className="text-neutral-600">
                  {status === "generating" ? "composing…" : "—"}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>

      {snapshot?.deeperTrajectoryTeaser && (
        <p className="mt-5 border-t border-white/10 pt-3 text-xs italic text-gold/70">
          {snapshot.deeperTrajectoryTeaser}
        </p>
      )}

      {snapshot && <SnapshotShare snapshot={snapshot} />}
    </div>
  );
}
