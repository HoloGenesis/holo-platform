import { describe, expect, it } from "vitest";
import {
  DEFAULT_HOLOGLISTEN_STATE,
  HOLOGLISTEN_CONFIG,
  type HologListenState,
} from "./hologListen";

// These constants are the spec §6 contract, consumed by both the membrane
// (shaderSpeed) and S92's BiologicalRefraction (svgRipple). Pinning them
// prevents accidental drift.
describe("HOLOGLISTEN_CONFIG (spec §6)", () => {
  it("has exactly the three states", () => {
    expect(Object.keys(HOLOGLISTEN_CONFIG).sort()).toEqual(["COHERING", "LOCKED", "THINKING"]);
  });

  it("shaderSpeed values match the spec (0.20 / 0.05 / 0.01)", () => {
    expect(HOLOGLISTEN_CONFIG.THINKING.shaderSpeed).toBe(0.2);
    expect(HOLOGLISTEN_CONFIG.COHERING.shaderSpeed).toBe(0.05);
    expect(HOLOGLISTEN_CONFIG.LOCKED.shaderSpeed).toBe(0.01);
  });

  it("svgRipple values match the spec (8 / 15 / 2)", () => {
    expect(HOLOGLISTEN_CONFIG.THINKING.svgRipple).toBe(8);
    expect(HOLOGLISTEN_CONFIG.COHERING.svgRipple).toBe(15);
    expect(HOLOGLISTEN_CONFIG.LOCKED.svgRipple).toBe(2);
  });

  it("defaults to LOCKED (at rest)", () => {
    const def: HologListenState = DEFAULT_HOLOGLISTEN_STATE;
    expect(def).toBe("LOCKED");
  });
});
