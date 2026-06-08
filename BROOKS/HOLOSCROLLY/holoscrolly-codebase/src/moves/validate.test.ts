import { describe, expect, it } from "vitest";
import { validateComposition } from "./validate";

describe("validateComposition", () => {
  it("accepts a declared-compatible pair", () => {
    expect(
      validateComposition(["ENGINE_INTERSECTION_SUMMONING", "PIN_STICKY_GRAPHIC_STEP"])
    ).toHaveLength(0);
  });

  it("accepts any pairing with an ALL move", () => {
    expect(
      validateComposition(["PERF_REDUCED_MOTION_MIRROR", "AUTHOR_CLOSEREAD_GLYPH"])
    ).toHaveLength(0);
  });

  it("flags an incompatible pair", () => {
    const issues = validateComposition([
      "MEDIA_SCROLL_SCRUBBED_VIDEO_MISSING",
      "AUTHOR_CLOSEREAD_GLYPH"
    ]);
    expect(issues.some((i) => i.reason === "unknown-move")).toBe(true);
  });

  it("flags two real-but-undeclared moves", () => {
    const issues = validateComposition([
      "AUTHOR_CLOSEREAD_GLYPH",
      "HOLO_RETURN_EVENT"
    ]);
    expect(issues.some((i) => i.reason === "incompatible")).toBe(true);
  });
});
