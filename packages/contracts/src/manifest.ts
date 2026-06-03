import { z } from "zod";
import {
  AgentKeySchema,
  ChamberKeySchema,
  EntitlementKeySchema,
  MemoryScopeSchema,
  ProductKeySchema,
} from "./primitives";
import { HolonSchema } from "./holon";

/** Per-chamber copy slots — data, not code. */
export const ChamberPromptsSchema = z.object({
  intro: z.string(),
  questions: z.array(z.string()),
});
export type ChamberPrompts = z.infer<typeof ChamberPromptsSchema>;

/** A v1 convention for declaring an entitlement-gated slot inside a chamber. */
export const ChamberAddOnSchema = z.object({
  entitlementKey: EntitlementKeySchema,
  slot: z.string(),
});
export type ChamberAddOn = z.infer<typeof ChamberAddOnSchema>;

/** One chamber in a product's scroll. */
export const ChamberSlotSchema = z.object({
  key: ChamberKeySchema,
  title: z.string(),
  agentKey: AgentKeySchema,
  memoryReadScopes: z.array(MemoryScopeSchema),
  memoryWriteScopes: z.array(MemoryScopeSchema),
  next: ChamberKeySchema.nullable(),
  prompts: ChamberPromptsSchema,
  entitlementsRequired: z.array(EntitlementKeySchema).optional(),
  addOns: z.array(ChamberAddOnSchema).optional(),
});
export type ChamberSlot = z.infer<typeof ChamberSlotSchema>;

/** The typed manifest a product declares; chamber flow is data, never hardcoded. */
export const ProductManifestSchema = z.object({
  productKey: ProductKeySchema,
  version: z.string(),
  rootHolon: HolonSchema,
  chambers: z.array(ChamberSlotSchema),
});
export type ProductManifest = z.infer<typeof ProductManifestSchema>;
