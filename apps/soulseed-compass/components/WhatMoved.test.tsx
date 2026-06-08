import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ReturnView, SoulSeedSnapshot, SnapshotField } from "@holo/contracts";
import { WhatMoved } from "./WhatMoved";

const FIELDS: SnapshotField[] = [
  "identitySignal",
  "presentState",
  "returningPattern",
  "emergingTrajectory",
  "firstInvitation",
];

const snap = (): SoulSeedSnapshot => ({
  identitySignal: "a",
  presentState: "b",
  returningPattern: "c",
  emergingTrajectory: "d",
  firstInvitation: "e",
  hurl: "hurl://soulseed/living-invitation/state-1/coherence-050",
  deeperTrajectoryTeaser: null,
});

/** Build a ReturnView whose first `changedCount` fields differ. */
function makeView(changedCount: number, whatChangedLine: string): ReturnView {
  const perField = FIELDS.map((field, i) => {
    const changed = i < changedCount;
    return changed
      ? { field, unchanged: false, prior: `prior-${field}`, current: `current-${field}`, oneLineDelta: `From "p" → "c"` }
      : { field, unchanged: true, prior: `same-${field}`, current: `same-${field}` };
  });
  return {
    previousSnapshot: snap(),
    currentSnapshot: snap(),
    diff: { perField, whatChangedLine, priorSnapshotAt: "2026-01-01T00:00:00.000Z", currentSnapshotAt: "2026-06-01T00:00:00.000Z" },
  };
}

const countOccurrences = (haystack: string, needle: string): number =>
  haystack.split(needle).length - 1;

describe("WhatMoved", () => {
  it("0 changed → empty state, no struck rows", () => {
    const html = renderToStaticMarkup(<WhatMoved view={makeView(0, "")} />);
    expect(html).toContain("What moved since last time");
    expect(html).toContain("holding the same ground");
    expect(countOccurrences(html, "line-through")).toBe(0);
  });

  it("2 changed → 2 rows + the whatChangedLine quote", () => {
    const html = renderToStaticMarkup(<WhatMoved view={makeView(2, "I finally quit.")} />);
    expect(html).toContain("I finally quit.");
    expect(countOccurrences(html, "line-through")).toBe(2);
    expect(html).toContain("current-identitySignal");
    expect(html).toContain("current-presentState");
    expect(html).not.toContain("holding the same ground");
  });

  it("5 changed → 5 rows", () => {
    const html = renderToStaticMarkup(<WhatMoved view={makeView(5, "Everything shifted.")} />);
    expect(countOccurrences(html, "line-through")).toBe(5);
    expect(html).toContain("Everything shifted.");
  });
});
