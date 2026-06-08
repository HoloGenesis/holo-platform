import { describe, expect, it } from "vitest";
import { holoscrollyCanon } from "../data/canon";
import { applyReturn, createReturnEvent, findHolon } from "./holonicRecursion";
import { CANONICAL_ROOT_HURL } from "../utils/hurl";

const t0 = "2026-02-01T00:00:00.000Z";
const t1 = "2026-02-01T00:05:00.000Z";

describe("findHolon", () => {
  it("locates a deeply nested holon", () => {
    const inner = findHolon(holoscrollyCanon.root, "inner-orientation");
    expect(inner?.children).toHaveLength(3);
  });

  it("returns undefined for unknown ids", () => {
    expect(findHolon(holoscrollyCanon.root, "ghost")).toBeUndefined();
  });
});

describe("createReturnEvent", () => {
  it("captures the descent and the carried step", () => {
    const inner = findHolon(holoscrollyCanon.root, "inner-orientation")!;
    const ev = createReturnEvent(CANONICAL_ROOT_HURL, inner, t0, t1, "ship v0.4", 1);
    expect(ev).toMatchObject({ childId: "inner-orientation", carried: "ship v0.4", depth: 1 });
  });
});

describe("applyReturn", () => {
  it("marks the child remembered and notes the parent without mutating input", () => {
    const parent = findHolon(holoscrollyCanon.root, "soulseed-compass")!;
    const inner = findHolon(parent, "inner-orientation")!;
    const ev = createReturnEvent(CANONICAL_ROOT_HURL, inner, t0, t1, "ship v0.4");
    const next = applyReturn(parent, ev);

    const nextChild = next.children.find((c) => c.id === "inner-orientation");
    expect(nextChild?.state).toBe("remembered");
    expect(nextChild?.memory.visits).toBe(inner.memory.visits + 1);
    expect(next.memory.notes.some((n) => n.includes("ship v0.4"))).toBe(true);

    // immutability
    expect(parent.children.find((c) => c.id === "inner-orientation")?.state).toBe(inner.state);
  });
});
