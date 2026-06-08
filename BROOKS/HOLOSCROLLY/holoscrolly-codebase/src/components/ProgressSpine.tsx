import { useScrollProgress } from "../hooks/useScrollProgress";

export function ProgressSpine() {
  const progress = useScrollProgress();
  return (
    <div className="progress-spine" aria-hidden="true">
      <div className="progress-spine__bar" style={{ height: `${progress * 100}%` }} />
    </div>
  );
}
