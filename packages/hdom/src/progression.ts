import type { ChamberKey, ProductManifest } from "@holo/contracts";

/**
 * The next chamber after `currentKey`, per the manifest's declared flow.
 * Returns `null` at the terminal chamber, or if `currentKey` isn't in the manifest.
 *
 * Chamber order is data, not code — it comes from the manifest, never hardcoded.
 */
export function getNextChamber(
  manifest: ProductManifest,
  currentKey: ChamberKey
): ChamberKey | null {
  const slot = manifest.chambers.find((chamber) => chamber.key === currentKey);
  return slot ? slot.next : null;
}

/**
 * Progress through the scroll as a fraction `0..1`, based on the position of
 * `currentKey` in the manifest. The first chamber is `1/N`; the terminal
 * chamber is `1.0`. Returns `0` if `currentKey` isn't in the manifest.
 */
export function calculateProgress(
  manifest: ProductManifest,
  currentKey: ChamberKey
): number {
  const count = manifest.chambers.length;
  if (count === 0) return 0;
  const index = manifest.chambers.findIndex((chamber) => chamber.key === currentKey);
  if (index === -1) return 0;
  return (index + 1) / count;
}
