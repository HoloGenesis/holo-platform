import type { ScrollyMove } from "../types/moves";

export function MoveCard({ move }: { move: ScrollyMove }) {
  return (
    <article className="move-card">
      <div className="move-card__prefix">{move.category}</div>
      <h3>{move.name}</h3>
      <p>{move.definition}</p>
      <footer>{move.narrativeUse}</footer>
    </article>
  );
}
