import type { Hurl } from "../types/hdom";

/** Canonical fallback HURL used when no route is present. */
export const CANONICAL_ROOT_HURL: Hurl = {
  protocol: "hurl",
  realm: "holopedia",
  chamber: "scrollytelling-to-holoscrolly",
  stage: 1.0,
  branch: "canon",
  coherence: 91,
  revision: 1
};

/** Serialize a HURL into its canonical string address-of-becoming. */
export function serializeHurl(hurl: Hurl): string {
  const stage = Number.isFinite(hurl.stage) ? hurl.stage.toFixed(1) : "0.0";
  const coherence = Math.round(hurl.coherence);
  return `${hurl.protocol}://${hurl.realm}/${hurl.chamber}.${stage}.${hurl.branch}.c${coherence}.r${hurl.revision}`;
}

/** Create a HURL, stamping the protocol. */
export function createHurl(params: Omit<Hurl, "protocol">): Hurl {
  return { protocol: "hurl", ...params };
}

/** Bump the revision of a HURL (used when the SoulSeed Compass mutates trajectory). */
export function bumpRevision(hurl: Hurl, by = 1): Hurl {
  return { ...hurl, revision: hurl.revision + by };
}

/**
 * Parse a route path of shape `/h/:realm/:chamber/:stage/:branch` into a HURL.
 * Missing or malformed segments inherit from the canonical root HURL so the
 * organism always has a valid address-of-becoming. Returns null when the path
 * is not an `/h/...` route at all (caller should then use the canonical root).
 */
export function parseHurlRoute(
  path: string,
  base: Hurl = CANONICAL_ROOT_HURL
): Hurl | null {
  const clean = path.split("?")[0].split("#")[0].replace(/\/+$/, "");
  const parts = clean.split("/").filter(Boolean);
  if (parts[0] !== "h") return null;

  const [, realm, chamber, stageRaw, branch] = parts;
  const stage = stageRaw !== undefined ? Number.parseFloat(stageRaw) : NaN;

  return {
    protocol: "hurl",
    realm: realm || base.realm,
    chamber: chamber || base.chamber,
    stage: Number.isFinite(stage) ? stage : base.stage,
    branch: branch || base.branch,
    coherence: base.coherence,
    revision: base.revision
  };
}

/** Serialize a HURL back into an `/h/...` route path for navigation. */
export function hurlToRoute(hurl: Hurl): string {
  return `/h/${hurl.realm}/${hurl.chamber}/${hurl.stage.toFixed(1)}/${hurl.branch}`;
}
