import { describe, expect, it } from "vitest";
import { emptyMemory, isReturning, memoryReducer } from "./returnMemory";

describe("memoryReducer", () => {
  const t0 = "2026-01-01T00:00:00.000Z";

  it("increments visits on ARRIVE", () => {
    const s = memoryReducer(emptyMemory(t0), { type: "ARRIVE", at: t0 });
    expect(s.visits).toBe(1);
    expect(s.lastVisitAt).toBe(t0);
  });

  it("tracks the last active node", () => {
    const s = memoryReducer(emptyMemory(t0), { type: "SET_ACTIVE_NODE", nodeId: "hdom" });
    expect(s.lastActiveNode).toBe("hdom");
  });

  it("records reflections against the active node", () => {
    let s = emptyMemory(t0);
    s = memoryReducer(s, { type: "SET_ACTIVE_NODE", nodeId: "soulseed-compass" });
    s = memoryReducer(s, { type: "REFLECT", at: t0, text: "more spacious" });
    expect(s.lastReflection).toBe("more spacious");
    expect(s.reflections[0]).toMatchObject({ node: "soulseed-compass", text: "more spacious" });
  });

  it("is returning only after more than one visit", () => {
    let s = memoryReducer(emptyMemory(t0), { type: "ARRIVE", at: t0 });
    expect(isReturning(s)).toBe(false);
    s = memoryReducer(s, { type: "ARRIVE", at: t0 });
    expect(isReturning(s)).toBe(true);
  });

  it("does not mutate the input state", () => {
    const s0 = emptyMemory(t0);
    memoryReducer(s0, { type: "ARRIVE", at: t0 });
    expect(s0.visits).toBe(0);
  });
});
