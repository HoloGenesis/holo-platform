import { describe, expect, it } from "vitest";
import { holoscrollyCanon } from "./canon";
import { activeChamberFor, hydrateCanon, resolveChamberId } from "./hydrate";
import { CANONICAL_ROOT_HURL, createHurl } from "../utils/hurl";

describe("resolveChamberId", () => {
  it("maps soulseed branches to the orientation chamber", () => {
    expect(resolveChamberId("brand-tree")).toBe("soulseed-compass");
    expect(resolveChamberId("wholeness-journey")).toBe("soulseed-compass");
  });

  it("falls back to root for unknown branches", () => {
    expect(resolveChamberId("mystery")).toBe("root-holoscrolly");
  });
});

describe("hydrateCanon", () => {
  it("stamps the route HURL onto the root", () => {
    const hurl = createHurl({ ...CANONICAL_ROOT_HURL, branch: "brand-tree", revision: 4 });
    const doc = hydrateCanon(holoscrollyCanon, hurl);
    expect(doc.root.hurl).toEqual(hurl);
  });

  it("activates the branch-resolved chamber", () => {
    const hurl = createHurl({ ...CANONICAL_ROOT_HURL, branch: "leadership-journey" });
    const doc = hydrateCanon(holoscrollyCanon, hurl);
    const seed = doc.root.children.find((c) => c.id === "soulseed-compass");
    expect(seed?.state).toBe("active");
    expect(activeChamberFor(hurl)).toBe("soulseed-compass");
  });

  it("does not mutate the seed canon", () => {
    const before = holoscrollyCanon.root.hurl?.branch;
    hydrateCanon(holoscrollyCanon, createHurl({ ...CANONICAL_ROOT_HURL, branch: "brand-tree" }));
    expect(holoscrollyCanon.root.hurl?.branch).toBe(before);
  });
});
