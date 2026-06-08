import type { HdomNode } from "../types/hdom";

export function HdomNodeView({ node }: { node: HdomNode }) {
  return (
    <article className="hdom-node">
      <div className="hdom-node__kind">{node.kind}</div>
      <h3>{node.title}</h3>
      <p>{node.summary}</p>
      <div className="hdom-node__trajectory">
        <strong>From:</strong> {node.trajectory.from}<br />
        <strong>Through:</strong> {node.trajectory.through.join(" → ")}<br />
        <strong>Toward:</strong> {node.trajectory.toward}
      </div>
    </article>
  );
}
