import { describe, expect, it } from "vitest";
import { ProductManifestSchema } from "@holo/contracts";
import type { ChamberKey } from "@holo/contracts";
import { getNextChamber } from "@holo/hdom";
import { soulseedCompassManifest } from "./index";

describe("soulseedCompassManifest", () => {
  it("re-validates against ProductManifestSchema", () => {
    expect(() => ProductManifestSchema.parse(soulseedCompassManifest)).not.toThrow();
  });

  it("declares the soulseed product with six chambers", () => {
    expect(soulseedCompassManifest.productKey).toBe("soulseed");
    expect(soulseedCompassManifest.chambers).toHaveLength(6);
  });

  it("walks threshold → ... → living-invitation → null via getNextChamber", () => {
    const visited: ChamberKey[] = [];
    let current: ChamberKey | null = "threshold";

    // bounded walk (guards against an accidental cycle in the manifest)
    for (let i = 0; i < 100 && current !== null; i++) {
      visited.push(current);
      current = getNextChamber(soulseedCompassManifest, current);
    }

    expect(current).toBeNull(); // terminated at the end
    expect(visited).toEqual([
      "threshold",
      "identity-seed",
      "present-state",
      "memory-root",
      "trajectory-branch",
      "living-invitation",
    ]);
    expect(getNextChamber(soulseedCompassManifest, "living-invitation")).toBeNull();
  });
});
