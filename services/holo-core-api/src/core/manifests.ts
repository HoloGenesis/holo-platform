import type { ProductKey, ProductManifest } from "@holo/contracts";
import { soulseedCompassManifest } from "@holo/product-manifests";
import { CoreError } from "../errors";

// Core owns orchestration, so it resolves a product's manifest (chamber flow)
// by key. Only soulseed in v1.
const MANIFESTS: Record<string, ProductManifest> = {
  soulseed: soulseedCompassManifest,
};

export function getManifest(productKey: ProductKey): ProductManifest {
  const manifest = MANIFESTS[productKey];
  if (!manifest) throw new CoreError("unknown_product", 400, `No manifest for "${productKey}"`);
  return manifest;
}
