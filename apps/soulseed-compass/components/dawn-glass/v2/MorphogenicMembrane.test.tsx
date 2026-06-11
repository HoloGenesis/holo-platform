import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { MorphogenicMembrane } from "./MorphogenicMembrane";

// Light-touch contract tests: the WebGL path needs a real GPU context and is
// verified visually at /dawn2 (golden-hour mood, breath-rate per state, the
// reduced-motion + fallback paths). Here we pin the render contract. The app
// test env is node + renderToStaticMarkup — effects never run, which also
// proves the markup is state-independent (state only feeds the GL uniforms).
describe("MorphogenicMembrane (render contract)", () => {
  it("renders a fixed, full-viewport, aria-hidden, pointer-transparent canvas at z-0", () => {
    const html = renderToStaticMarkup(<MorphogenicMembrane />);
    expect(html).toContain("<canvas");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain("position:fixed");
    expect(html).toContain("z-index:0");
    expect(html).toContain("pointer-events:none");
    expect(html).toContain("opacity:0.7"); // reference HTML default
  });

  it("applies the opacity prop and passes className through", () => {
    const html = renderToStaticMarkup(<MorphogenicMembrane opacity={0.4} className="membrane-x" />);
    expect(html).toContain("opacity:0.4");
    expect(html).toContain('class="membrane-x"');
  });

  it("markup is identical across HOLOGLISTEN states (state never re-mounts the canvas)", () => {
    const locked = renderToStaticMarkup(<MorphogenicMembrane state="LOCKED" />);
    const thinking = renderToStaticMarkup(<MorphogenicMembrane state="THINKING" />);
    const cohering = renderToStaticMarkup(<MorphogenicMembrane state="COHERING" />);
    expect(thinking).toBe(locked);
    expect(cohering).toBe(locked);
  });
});
