import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { SoulSeedSnapshotV2 } from "@holo/contracts";
import { WhatMovedV2 } from "./WhatMovedV2";

const row = (title: string) => ({ title, description: `${title} — described.` });

const base: SoulSeedSnapshotV2 = {
  identityPattern: row("Becoming signal"),
  currentNeed: row("Clarity before depth"),
  supportStyle: row("Direct · Concise."),
  whatAIShouldAvoid: row("Fluff."),
  whatMattersMost: row("The job question"),
  nextCoherentStep: row("One priority"),
  angelHandoffSummary: "Meet them plainly.",
  hurlSeedData: { realm: "soulseed", chamber: "threshold", stage: 1, branch: "becoming-signal", coherence: 0 },
};

const count = (haystack: string, needle: string) => haystack.split(needle).length - 1;

describe("WhatMovedV2", () => {
  it("0 moved → the holding-ground empty state, no struck rows", () => {
    const html = renderToStaticMarkup(
      <WhatMovedV2 prior={base} current={{ ...base }} whatChangedLine="Nothing big, honestly." />
    );
    expect(html).toContain("What moved since last time.");
    expect(html).toContain("holding the same ground");
    expect(html).toContain("Nothing big, honestly.");
    expect(count(html, "line-through")).toBe(0);
  });

  it("2 moved → exactly those rows, prior struck → current honey; unchanged rows skipped", () => {
    const current: SoulSeedSnapshotV2 = {
      ...base,
      currentNeed: row("Momentum over certainty"),
      nextCoherentStep: row("Ship the sketch project"),
    };
    const html = renderToStaticMarkup(
      <WhatMovedV2 prior={base} current={current} whatChangedLine="I started a 30-day sketch project." />
    );
    expect(count(html, "line-through")).toBe(2);
    expect(html).toContain("Clarity before depth"); // prior (struck)
    expect(html).toContain("Momentum over certainty"); // current
    expect(html).toContain("Ship the sketch project");
    expect(html).not.toContain("Identity Pattern"); // unchanged → skipped
    expect(html).toContain("I started a 30-day sketch project.");
  });

  it("all 6 moved → six rows", () => {
    const current: SoulSeedSnapshotV2 = {
      ...base,
      identityPattern: row("a2"),
      currentNeed: row("b2"),
      supportStyle: row("c2"),
      whatAIShouldAvoid: row("d2"),
      whatMattersMost: row("e2"),
      nextCoherentStep: row("f2"),
    };
    const html = renderToStaticMarkup(<WhatMovedV2 prior={base} current={current} />);
    expect(count(html, "line-through")).toBe(6);
  });
});
