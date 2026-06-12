import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { PearlCard } from "./PearlCard";

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe("PearlCard (render contract)", () => {
  it("renders children in a div by default; respects the `as` prop", () => {
    const div = renderToStaticMarkup(<PearlCard>content</PearlCard>);
    expect(div.startsWith("<div")).toBe(true);
    expect(div).toContain("content");

    const section = renderToStaticMarkup(<PearlCard as="section">content</PearlCard>);
    expect(section.startsWith("<section")).toBe(true);
  });

  it("defaults: standard size + default glow + the reference glass surface", () => {
    const html = renderToStaticMarkup(<PearlCard>x</PearlCard>);
    expect(html).toContain("padding:2.5rem 3rem"); // standard
    expect(html).toContain("max-width:48rem");
    expect(count(html, "inset")).toBe(2); // default glow = 2 inset layers
    // reference .pearl-card surface, byte-for-byte values
    expect(html).toContain("background:rgba(255, 255, 255, 0.10)");
    expect(html).toContain("backdrop-filter:blur(40px) saturate(180%) brightness(1.02)");
    expect(html).toContain("border-radius:50px");
    expect(html).toContain("border:1px solid rgba(255, 255, 255, 0.5)");
  });

  it("size variants set the expected padding + max-width", () => {
    const compact = renderToStaticMarkup(<PearlCard size="compact">x</PearlCard>);
    expect(compact).toContain("padding:1.5rem 2rem");
    expect(compact).toContain("max-width:32rem");

    const hero = renderToStaticMarkup(<PearlCard size="hero">x</PearlCard>);
    expect(hero).toContain("padding:4rem");
    expect(hero).toContain("max-width:72rem");
  });

  it("glow variants layer the right shadows (subtle=1 inset, default=2, vivid=3 + honey kiss)", () => {
    const subtle = renderToStaticMarkup(<PearlCard glow="subtle">x</PearlCard>);
    expect(count(subtle, "inset")).toBe(1);

    const vivid = renderToStaticMarkup(<PearlCard glow="vivid">x</PearlCard>);
    expect(count(vivid, "inset")).toBe(3);
    expect(vivid).toContain("rgba(255, 190, 96"); // the warm honey kiss
    expect(vivid).toContain("rgba(103, 220, 255"); // prismatic cyan edge
  });

  it("merges className + style (caller style wins) and keeps ink text readable", () => {
    const html = renderToStaticMarkup(
      <PearlCard className="grid-x" style={{ maxWidth: 999, margin: "0 auto" }}>x</PearlCard>
    );
    expect(html).toContain('class="grid-x"');
    expect(html).toContain("max-width:999px"); // caller override
    expect(html).toContain("margin:0 auto");
    expect(html).toContain("color:var(--ink)"); // readable on the bright membrane
  });

  it("always pins color: var(--ink) regardless of glow/size", () => {
    for (const html of [
      renderToStaticMarkup(<PearlCard glow="subtle" size="compact">x</PearlCard>),
      renderToStaticMarkup(<PearlCard glow="vivid" size="hero">x</PearlCard>),
    ]) {
      expect(html).toContain("color:var(--ink)");
    }
  });
});
