import { useScrollProgress } from "../hooks/useScrollProgress";
import { useReducedMotion } from "../hooks/useReducedMotion";

interface HoloSigilProps {
  label?: string;
  activeLabel?: string;
}

export function HoloSigil({ label = "HOLO", activeLabel }: HoloSigilProps) {
  const progress = useScrollProgress();
  const reducedMotion = useReducedMotion();
  const rotation = reducedMotion ? 0 : progress * 360;

  return (
    <div className="holo-sigil" style={{ transform: `rotate(${rotation}deg)` }}>
      <div className="holo-sigil__ring" />
      <div className="holo-sigil__core">
        <span>{activeLabel ?? label}</span>
      </div>
    </div>
  );
}
