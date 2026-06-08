import type { Hurl } from "../types/hdom";
import { serializeHurl } from "../utils/hurl";

export function HurlPanel({ hurl }: { hurl: Hurl }) {
  return (
    <section className="hurl-panel">
      <div className="eyebrow">HURL • Address of Trajectory</div>
      <code>{serializeHurl(hurl)}</code>
      <p>Not where you are. Where you are moving. A living chamber in the unfolding identity path.</p>
    </section>
  );
}
