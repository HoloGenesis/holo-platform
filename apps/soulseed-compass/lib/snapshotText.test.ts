import { describe, expect, it } from "vitest";
import type { SoulSeedSnapshot } from "@holo/contracts";
import { snapshotToText } from "./snapshotText";

const snapshot: SoulSeedSnapshot = {
  identitySignal: "Left a job that was quietly killing her.",
  presentState: "Terror and aliveness, trading places.",
  returningPattern: "Waiting for permission she doesn't need.",
  emergingTrajectory: "Less proving, more building.",
  firstInvitation: "Ship one unpolished thing this week.",
  hurl: "hurl://soulseed/living-invitation/state-1/coherence-050",
  deeperTrajectoryTeaser: null,
};

describe("snapshotToText", () => {
  it("produces the exact deterministic plain-text format", () => {
    const expected = [
      "SoulSeed Snapshot",
      "",
      "Identity signal: Left a job that was quietly killing her.",
      "",
      "Present state: Terror and aliveness, trading places.",
      "",
      "Returning pattern: Waiting for permission she doesn't need.",
      "",
      "Emerging trajectory: Less proving, more building.",
      "",
      "First invitation: Ship one unpolished thing this week.",
      "",
      "hurl://soulseed/living-invitation/state-1/coherence-050",
      "From SoulSeed Compass — soulseed-compass.app",
    ].join("\n");
    expect(snapshotToText(snapshot)).toBe(expected);
  });

  it("is deterministic (same input → identical output)", () => {
    expect(snapshotToText(snapshot)).toBe(snapshotToText({ ...snapshot }));
  });

  it("includes all five fields, the HURL, and the attribution; no email/PII", () => {
    const text = snapshotToText(snapshot);
    expect(text).toContain("Identity signal:");
    expect(text).toContain("First invitation:");
    expect(text).toContain(snapshot.hurl);
    expect(text).toContain("soulseed-compass.app");
    expect(text).not.toMatch(/@/); // no email leaked
  });
});
