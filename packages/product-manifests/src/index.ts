// @holo/product-manifests — chamber flow + personas as data. Each SKIN declares
// its scroll + conductor(s) here as a typed, validated ProductManifest.

import type { ProductManifest } from "@holo/contracts";
import { soulseedCompassManifest } from "./soulseed-compass.manifest";
import { guideCompassManifest } from "./guide-compass.manifest";

export { soulseedCompassManifest } from "./soulseed-compass.manifest";
export { guideCompassManifest } from "./guide-compass.manifest";

/**
 * The installed skins/instances, keyed by productKey. Adding a skin = add a
 * manifest file + one entry here (data layer) — no engine code.
 */
export const manifests: Record<string, ProductManifest> = {
  [soulseedCompassManifest.productKey]: soulseedCompassManifest,
  [guideCompassManifest.productKey]: guideCompassManifest,
};
