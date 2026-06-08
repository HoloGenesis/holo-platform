import { describe, expect, it } from "vitest";
import type { SoulSeedSnapshot } from "@holo/contracts";
import { diffSnapshots } from "./diff";

const base: SoulSeedSnapshot = {
  identitySignal: "Left a job that was quietly killing her.",
  presentState: "Terror and aliveness, trading places.",
  returningPattern: "Waiting for permission she doesn't need.",
  emergingTrajectory: "Less proving, more building.",
  firstInvitation: "Ship one unpolished thing this week.",
  hurl: "hurl://soulseed/living-invitation/state-1/coherence-050",
  deeperTrajectoryTeaser: null,
};

const FIELDS = [
  "identitySignal",
  "presentState",
  "returningPattern",
  "emergingTrajectory",
  "firstInvitation",
] as const;

describe("diffSnapshots", () => {
  it("all-unchanged → every field unchanged, no oneLineDelta", () => {
    const diff = diffSnapshots(base, { ...base });
    expect(diff.perField).toHaveLength(5);
    expect(diff.perField.every((f) => f.unchanged)).toBe(true);
    expect(diff.perField.every((f) => f.oneLineDelta === undefined)).toBe(true);
  });

  it("treats whitespace-only differences as unchanged", () => {
    const next = { ...base, presentState: "  Terror and aliveness,   trading places.  " };
    const diff = diffSnapshots(base, next);
    expect(diff.perField.find((f) => f.field === "presentState")?.unchanged).toBe(true);
  });

  it("one-field-changed → exactly one field changed with a deterministic delta", () => {
    const next = { ...base, firstInvitation: "Call the mentor you've been avoiding." };
    const diff = diffSnapshots(base, next);
    const changed = diff.perField.filter((f) => !f.unchanged);
    expect(changed).toHaveLength(1);
    expect(changed[0]?.field).toBe("firstInvitation");
    expect(changed[0]?.prior).toBe(base.firstInvitation);
    expect(changed[0]?.current).toBe(next.firstInvitation);
    expect(changed[0]?.oneLineDelta).toContain("From");
    expect(changed[0]?.oneLineDelta).toContain("→");
  });

  it("all-changed → all five fields changed", () => {
    const next: SoulSeedSnapshot = {
      ...base,
      identitySignal: "A builder who stopped apologizing.",
      presentState: "Steadier. The swing narrowed.",
      returningPattern: "Still checks for permission, but catches it now.",
      emergingTrajectory: "Making, not proving.",
      firstInvitation: "Publish the thing without a preamble.",
    };
    const diff = diffSnapshots(base, next);
    expect(diff.perField.filter((f) => !f.unchanged)).toHaveLength(5);
  });

  it("is deterministic and pure (same inputs → same output)", () => {
    const next = { ...base, presentState: "Different now." };
    expect(diffSnapshots(base, next)).toEqual(diffSnapshots(base, next));
  });

  it("carries meta through (whatChangedLine + timestamps)", () => {
    const diff = diffSnapshots(base, base, {
      whatChangedLine: "I finally quit.",
      priorSnapshotAt: "2026-01-01T00:00:00.000Z",
      currentSnapshotAt: "2026-06-01T00:00:00.000Z",
    });
    expect(diff.whatChangedLine).toBe("I finally quit.");
    expect(diff.priorSnapshotAt).toBe("2026-01-01T00:00:00.000Z");
    expect(FIELDS.length).toBe(diff.perField.length);
  });
});
