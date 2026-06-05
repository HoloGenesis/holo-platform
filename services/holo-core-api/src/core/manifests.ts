import type { ProductKey, ProductManifest } from "@holo/contracts";
import { manifests } from "@holo/product-manifests";
import { CoreError } from "../errors";

// The engine resolves a skin's manifest by key from the installed registry.
// It does not enumerate products or personas — adding a skin is a data change
// in @holo/product-manifests, not engine code.
export function getManifest(productKey: ProductKey): ProductManifest {
  const manifest = manifests[productKey];
  if (!manifest) throw new CoreError("unknown_product", 400, `No manifest for "${productKey}"`);
  return manifest;
}
