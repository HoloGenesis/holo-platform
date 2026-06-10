import { describe, expect, it } from "vitest";
import type { SoulSeedSnapshotV2 } from "@holo/contracts";
import { reconstructCanonicalHurl, returnUrlFromSnapshot } from "./hurl";

const row = (title: string) => ({ title, description: `${title}.` });
const snapshot: SoulSeedSnapshotV2 = {
  identityPattern: row("Becoming signal"),
  currentNeed: row("Clarity"),
  supportStyle: row("Direct"),
  whatAIShouldAvoid: row("Fluff"),
  nextCoherentStep: row("One priority"),
  angelHandoffSummary: "Meet them plainly.",
  hurlSeedData: {
    realm: "soulseed",
    chamber: "living-invitation",
    stage: 72910,
    branch: "becoming-signal",
    coherence: 40,
  },
};

describe("reconstructCanonicalHurl", () => {
  it("rebuilds the canonical 4-part form, coherence padded to 3 digits", () => {
    expect(reconstructCanonicalHurl(snapshot.hurlSeedData)).toBe(
      "hurl://soulseed/living-invitation/state-72910/coherence-040"
    );
  });

  it("pads zero coherence and handles hyphenated chambers", () => {
    expect(
      reconstructCanonicalHurl({ realm: "soulseed", chamber: "memory-root", stage: 1, coherence: 0 })
    ).toBe("hurl://soulseed/memory-root/state-1/coherence-000");
  });

  it("is deterministic", () => {
    expect(reconstructCanonicalHurl(snapshot.hurlSeedData)).toBe(
      reconstructCanonicalHurl({ ...snapshot.hurlSeedData })
    );
  });
});

describe("returnUrlFromSnapshot", () => {
  it("builds the shareable URL with the encoded canonical (S60's exact convention)", () => {
    const url = returnUrlFromSnapshot(snapshot, "http://localhost:3000");
    expect(url).toBe(
      `http://localhost:3000/?hurl=${encodeURIComponent(
        "hurl://soulseed/living-invitation/state-72910/coherence-040"
      )}`
    );
    // encoding handles the hyphenated chamber + the :// safely
    expect(url).toContain("hurl%3A%2F%2Fsoulseed%2Fliving-invitation");
  });

  it("is SSR-safe: with no window and no appUrl, yields a relative URL", () => {
    const url = returnUrlFromSnapshot(snapshot);
    expect(url.startsWith("/?hurl=")).toBe(true);
  });
});
