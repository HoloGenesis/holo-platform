import { describe, expect, it } from "vitest";
import {
  CANONICAL_ROOT_HURL,
  bumpRevision,
  createHurl,
  hurlToRoute,
  parseHurlRoute,
  serializeHurl
} from "./hurl";

describe("serializeHurl", () => {
  it("produces the canonical address-of-becoming string", () => {
    expect(serializeHurl(CANONICAL_ROOT_HURL)).toBe(
      "hurl://holopedia/scrollytelling-to-holoscrolly.1.0.canon.c91.r1"
    );
  });

  it("rounds coherence and fixes stage to one decimal", () => {
    const h = createHurl({
      realm: "r", chamber: "c", stage: 2, branch: "b", coherence: 87.6, revision: 3
    });
    expect(serializeHurl(h)).toBe("hurl://r/c.2.0.b.c88.r3");
  });
});

describe("createHurl", () => {
  it("stamps the hurl protocol", () => {
    const h = createHurl({
      realm: "r", chamber: "c", stage: 1, branch: "b", coherence: 50, revision: 1
    });
    expect(h.protocol).toBe("hurl");
  });
});

describe("bumpRevision", () => {
  it("advances the revision without mutating the source", () => {
    const next = bumpRevision(CANONICAL_ROOT_HURL);
    expect(next.revision).toBe(CANONICAL_ROOT_HURL.revision + 1);
    expect(CANONICAL_ROOT_HURL.revision).toBe(1);
  });
});

describe("parseHurlRoute", () => {
  it("parses a full /h/ route", () => {
    const h = parseHurlRoute("/h/holopedia/chamber-x/2.0/brand-tree");
    expect(h).toMatchObject({
      realm: "holopedia", chamber: "chamber-x", stage: 2.0, branch: "brand-tree"
    });
  });

  it("returns null for non-/h/ paths", () => {
    expect(parseHurlRoute("/about")).toBeNull();
  });

  it("inherits missing segments from the base hurl", () => {
    const h = parseHurlRoute("/h/holopedia", CANONICAL_ROOT_HURL);
    expect(h?.chamber).toBe(CANONICAL_ROOT_HURL.chamber);
    expect(h?.branch).toBe(CANONICAL_ROOT_HURL.branch);
  });

  it("round-trips through hurlToRoute", () => {
    const route = hurlToRoute(CANONICAL_ROOT_HURL);
    const parsed = parseHurlRoute(route);
    expect(parsed).toMatchObject({
      realm: CANONICAL_ROOT_HURL.realm,
      chamber: CANONICAL_ROOT_HURL.chamber,
      branch: CANONICAL_ROOT_HURL.branch,
      stage: CANONICAL_ROOT_HURL.stage
    });
  });
});
