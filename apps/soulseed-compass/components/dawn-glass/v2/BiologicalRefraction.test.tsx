import { renderToStaticMarkup } from "react-dom/server";
import { afterEach, describe, expect, it, vi } from "vitest";
import { BiologicalRefraction } from "./BiologicalRefraction";

// Render-contract tests (node env, static markup). The imperative
// setAttribute("scale") path needs a live DOM ref — it's verified at /dawn2
// via the "Filter scale: N" dev label + the visible wobble change.

afterEach(() => {
  vi.unstubAllGlobals();
});

const stubMotion = (reduce: boolean) => {
  vi.stubGlobal("window", {
    matchMedia: (q: string) => ({ matches: reduce && q.includes("prefers-reduced-motion") }),
  });
};

describe("BiologicalRefraction (render contract)", () => {
  it("renders a zero-size svg with the filter id (default biologicalRefraction)", () => {
    const html = renderToStaticMarkup(<BiologicalRefraction />);
    expect(html).toContain("<svg");
    expect(html).toContain('aria-hidden="true"');
    expect(html).toContain('id="biologicalRefraction"');
    expect(html).toContain("width:0");
    expect(html).toContain("height:0");
    // edge extension so refraction isn't clipped at the bounds
    expect(html).toContain('x="-10%"');
    expect(html).toContain('width="120%"');
  });

  it("honors an id override", () => {
    const html = renderToStaticMarkup(<BiologicalRefraction id="customRefraction" />);
    expect(html).toContain('id="customRefraction"');
  });

  it("feTurbulence carries the reference parameters verbatim", () => {
    const html = renderToStaticMarkup(<BiologicalRefraction />);
    expect(html).toContain('type="fractalNoise"');
    expect(html).toContain('baseFrequency="0.015"');
    expect(html).toContain('numOctaves="2"');
    expect(html).toContain('seed="5"');
    expect(html).toContain('result="noise"');
  });

  it("feDisplacementMap initial scale follows the state prop (8 / 15 / 2)", () => {
    expect(renderToStaticMarkup(<BiologicalRefraction state="THINKING" />)).toContain('scale="8"');
    expect(renderToStaticMarkup(<BiologicalRefraction state="COHERING" />)).toContain('scale="15"');
    expect(renderToStaticMarkup(<BiologicalRefraction state="LOCKED" />)).toContain('scale="2"');
    // channel selectors per the reference
    const html = renderToStaticMarkup(<BiologicalRefraction />);
    expect(html).toContain('xChannelSelector="R"');
    expect(html).toContain('yChannelSelector="G"');
  });

  it("renders the <animate> breath under default motion preferences", () => {
    stubMotion(false);
    const html = renderToStaticMarkup(<BiologicalRefraction />);
    expect(html).toContain("<animate");
    expect(html).toContain('values="0.015;0.018;0.015"');
    expect(html).toContain('dur="10s"');
  });

  it("drops the <animate> child under prefers-reduced-motion: reduce", () => {
    stubMotion(true);
    const html = renderToStaticMarkup(<BiologicalRefraction />);
    expect(html).not.toContain("<animate");
    // the filter itself still renders (static displacement still applies)
    expect(html).toContain("feDisplacementMap");
  });
});
