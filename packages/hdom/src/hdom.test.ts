import { describe, expect, it } from "vitest";
import { HolonSchema } from "@holo/contracts";
import type { ProductManifest } from "@holo/contracts";
import {
  appendHolonEvent,
  calculateProgress,
  createHolon,
  getNextChamber,
  restoreHDOM,
  serializeHDOM,
  updateHolonState,
} from "./index";

function sampleManifest(): ProductManifest {
  const chamber = (
    key: ProductManifest["chambers"][number]["key"],
    title: string,
    next: ProductManifest["chambers"][number]["next"]
  ): ProductManifest["chambers"][number] => ({
    key,
    title,
    agentKey: key === "living-invitation" ? "coach" : "rezzie",
    memoryReadScopes: ["profile"],
    memoryWriteScopes: ["event"],
    next,
    prompts: { intro: title, questions: [] },
  });

  return {
    productKey: "soulseed",
    name: "SoulSeed Compass",
    version: "1.0.0",
    rootHolon: createHolon({ id: "root", type: "product", title: "SoulSeed Compass" }),
    agents: {
      rezzie: { role: "conductor", systemPrompt: "guide", output: "agent", readScopes: ["profile"] },
      coach: { role: "synthesis", systemPrompt: "synth", output: "synthesis", readScopes: ["profile"] },
    },
    chambers: [
      chamber("threshold", "Threshold", "identity-seed"),
      chamber("identity-seed", "Identity Seed", "present-state"),
      chamber("present-state", "Present State", "living-invitation"),
      chamber("living-invitation", "Living Invitation", null),
    ],
  };
}

describe("createHolon", () => {
  it("creates a valid holon with empty defaults", () => {
    const holon = createHolon({ id: "c1", type: "chamber", title: "Threshold" });
    expect(HolonSchema.safeParse(holon).success).toBe(true);
    expect(holon).toEqual({
      id: "c1",
      type: "chamber",
      title: "Threshold",
      identity: {},
      state: {},
      history: [],
      trajectory: {},
      relationships: [],
      children: [],
    });
  });

  it("keeps provided fields and nested children", () => {
    const child = createHolon({ id: "child", type: "chamber", title: "Child" });
    const parent = createHolon({
      id: "parent",
      type: "product",
      title: "Parent",
      state: { coherence: 0.1 },
      children: [child],
    });
    expect(parent.state).toEqual({ coherence: 0.1 });
    expect(parent.children).toHaveLength(1);
    expect(parent.children[0]?.id).toBe("child");
  });
});

describe("updateHolonState", () => {
  it("patches state without mutating the original", () => {
    const original = createHolon({ id: "c1", type: "chamber", title: "T", state: { a: 1 } });
    const updated = updateHolonState(original, { b: 2 });

    expect(updated.state).toEqual({ a: 1, b: 2 });
    // original untouched
    expect(original.state).toEqual({ a: 1 });
    expect(updated).not.toBe(original);
    expect(updated.state).not.toBe(original.state);
  });

  it("overwrites overlapping keys in the patch", () => {
    const original = createHolon({ id: "c1", type: "chamber", title: "T", state: { a: 1 } });
    const updated = updateHolonState(original, { a: 99 });
    expect(updated.state).toEqual({ a: 99 });
    expect(original.state).toEqual({ a: 1 });
  });
});

describe("appendHolonEvent", () => {
  it("appends to history without mutating the original", () => {
    const original = createHolon({ id: "c1", type: "chamber", title: "T" });
    const updated = appendHolonEvent(original, { at: "2026-06-03T00:00:00.000Z", event: "entered" });

    expect(updated.history).toHaveLength(1);
    expect(updated.history[0]?.event).toBe("entered");
    expect(original.history).toHaveLength(0);
    expect(updated.history).not.toBe(original.history);
  });
});

describe("getNextChamber", () => {
  const manifest = sampleManifest();

  it("returns the correct next chamber", () => {
    expect(getNextChamber(manifest, "threshold")).toBe("identity-seed");
    expect(getNextChamber(manifest, "present-state")).toBe("living-invitation");
  });

  it("returns null at the terminal chamber", () => {
    expect(getNextChamber(manifest, "living-invitation")).toBeNull();
  });

  it("returns null for a chamber not in the manifest", () => {
    expect(getNextChamber(manifest, "memory-root")).toBeNull();
  });
});

describe("calculateProgress", () => {
  const manifest = sampleManifest();

  it("is 1/N at the first chamber and 1 at the terminal chamber", () => {
    expect(calculateProgress(manifest, "threshold")).toBeCloseTo(0.25);
    expect(calculateProgress(manifest, "living-invitation")).toBe(1);
  });

  it("is 0 for an unknown chamber", () => {
    expect(calculateProgress(manifest, "trajectory-branch")).toBe(0);
  });
});

describe("serializeHDOM / restoreHDOM", () => {
  it("round-trips a holon tree identically", () => {
    const root = createHolon({
      id: "root",
      type: "product",
      title: "SoulSeed Compass",
      state: { coherence: 0.42 },
      history: [{ at: "2026-06-03T00:00:00.000Z", event: "created" }],
      trajectory: { current: "threshold", next: "identity-seed", branches: ["a", "b"] },
      relationships: [{ type: "child-of", targetId: "none" }],
      children: [
        createHolon({ id: "c1", type: "chamber", title: "Threshold", state: { visited: true } }),
      ],
    });

    const json = serializeHDOM(root);
    expect(typeof json).toBe("string");

    const restored = restoreHDOM(json);
    expect(restored).toEqual(root);
  });

  it("throws when restoring invalid JSON structure", () => {
    expect(() => restoreHDOM(JSON.stringify({ id: "x" }))).toThrow();
  });
});
