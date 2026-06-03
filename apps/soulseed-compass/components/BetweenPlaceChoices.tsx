"use client";

import { ARRIVAL_VECTORS, useChamberStore } from "../lib/chamberStore";

interface BetweenPlaceChoicesProps {
  /** The four Between-Place options — sourced from the manifest's chamber prompts. */
  options: string[];
}

/**
 * Tappable cards for identity-seed. Picking one sets the arrivalVector and
 * submits the turn through Core (event → agent → orchestration).
 */
export function BetweenPlaceChoices({ options }: BetweenPlaceChoicesProps) {
  const arrivalVector = useChamberStore((s) => s.arrivalVector);
  const choose = useChamberStore((s) => s.chooseArrivalVector);
  const thinking = useChamberStore((s) => s.thinking);
  const turnComplete = useChamberStore((s) => s.turnComplete);
  const locked = thinking || turnComplete;

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {options.map((option, index) => {
        const selected = arrivalVector === ARRIVAL_VECTORS[index];
        return (
          <button
            key={option}
            type="button"
            aria-pressed={selected}
            disabled={locked}
            onClick={() => void choose(index)}
            className={[
              "glass rounded-2xl p-5 text-left text-base transition-all duration-300 disabled:cursor-not-allowed",
              selected
                ? "!border-gold/60 text-neutral-50 shadow-gold ring-1 ring-gold/40"
                : "text-neutral-300 enabled:hover:!border-white/20 enabled:hover:bg-white/[0.04]",
              locked && !selected ? "opacity-40" : "",
            ].join(" ")}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
