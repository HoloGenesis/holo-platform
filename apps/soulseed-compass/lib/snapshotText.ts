import type { SoulSeedSnapshot } from "@holo/contracts";

// Pure, deterministic plain-text rendering of a Snapshot for "Copy as text".
// Same Snapshot in → same string out (no time, no randomness).

const FIELDS: { label: string; key: keyof SoulSeedSnapshot }[] = [
  { label: "Identity signal", key: "identitySignal" },
  { label: "Present state", key: "presentState" },
  { label: "Returning pattern", key: "returningPattern" },
  { label: "Emerging trajectory", key: "emergingTrajectory" },
  { label: "First invitation", key: "firstInvitation" },
];

/** Build the shareable plain-text Snapshot (5 fields, HURL footer, attribution). */
export function snapshotToText(snapshot: SoulSeedSnapshot): string {
  const lines: string[] = ["SoulSeed Snapshot", ""];
  for (const { label, key } of FIELDS) {
    lines.push(`${label}: ${String(snapshot[key])}`, "");
  }
  lines.push(snapshot.hurl, "From SoulSeed Compass — soulseed-compass.app");
  return lines.join("\n");
}
