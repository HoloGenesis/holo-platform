import type { SoulSeedSnapshotV2 } from "@holo/contracts";

// Return-link helpers (S87). Pure, no side effects. The user-facing "HURL" is
// the SHAREABLE RETURN URL (APP_URL/?hurl=<encoded canonical>) — the same
// convention S60's email carries and S25's resume-by-HURL honors. The raw
// hurl://… canonical stays internal (doctrine: don't narrate the platform).
// No HURL grammar change: this reconstructs the existing 4-part form.

/** Rebuild the canonical 4-part HURL from hurlSeedData parts. */
export function reconstructCanonicalHurl(parts: {
  realm: string;
  chamber: string;
  stage: number;
  coherence: number;
}): string {
  return `hurl://${parts.realm}/${parts.chamber}/state-${parts.stage}/coherence-${String(
    parts.coherence
  ).padStart(3, "0")}`;
}

/**
 * The shareable return URL for a Snapshot. SSR-safe: uses window.location.origin
 * only in the browser; otherwise the passed appUrl (empty origin = relative URL).
 */
export function returnUrlFromSnapshot(snapshot: SoulSeedSnapshotV2, appUrl?: string): string {
  const origin = appUrl ?? (typeof window !== "undefined" ? window.location.origin : "");
  const canonical = reconstructCanonicalHurl(snapshot.hurlSeedData);
  return `${origin}/?hurl=${encodeURIComponent(canonical)}`;
}
