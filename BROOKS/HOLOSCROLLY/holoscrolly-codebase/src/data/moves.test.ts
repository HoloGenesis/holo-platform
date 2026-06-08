import { describe, expect, it } from "vitest";
import { getMove, scrollyMoves } from "./moves";

describe("move lookup", () => {
  it("finds a move by id", () => {
    expect(getMove("HOLO_RETURN_EVENT")?.code).toBe("RETURN_EVENT");
  });

  it("returns undefined for unknown ids", () => {
    expect(getMove("NOPE")).toBeUndefined();
  });

  it("every move declares a reduced-motion fallback", () => {
    for (const move of scrollyMoves) {
      expect(move.parameters.reducedMotionFallback).toBeTruthy();
    }
  });
});
