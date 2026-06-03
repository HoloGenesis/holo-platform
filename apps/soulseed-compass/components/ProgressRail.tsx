import type { ChamberKey } from "@holo/contracts";

interface ProgressRailProps {
  chambers: { key: ChamberKey; title: string }[];
  currentKey: ChamberKey;
  progress: number;
}

/** A six-segment gold rail showing how far through the scroll the user is. */
export function ProgressRail({ chambers, currentKey, progress }: ProgressRailProps) {
  const currentIndex = chambers.findIndex((c) => c.key === currentKey);
  const pct = Math.round(progress * 100);

  return (
    <nav aria-label="Chamber progress" className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs uppercase tracking-[0.25em] text-neutral-500">
        <span>
          Chamber {currentIndex + 1} of {chambers.length}
        </span>
        <span className="gold-text">{pct}%</span>
      </div>

      <ol className="flex items-stretch gap-1.5">
        {chambers.map((chamber, index) => {
          const state =
            index < currentIndex ? "done" : index === currentIndex ? "active" : "upcoming";
          return (
            <li key={chamber.key} className="flex-1">
              <div
                title={chamber.title}
                className={[
                  "h-1.5 w-full rounded-full transition-all duration-700",
                  state === "done" && "bg-gold/55",
                  state === "active" && "bg-gold shadow-gold",
                  state === "upcoming" && "bg-white/8",
                ]
                  .filter(Boolean)
                  .join(" ")}
              />
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
