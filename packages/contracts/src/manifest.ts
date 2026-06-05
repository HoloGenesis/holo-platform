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

/**
 * A persona/conductor this skin can run. The skin OWNS its voice; the Core
 * engine reads these and never names a persona. See docs/skin-manifest-spec.md.
 */
export const AgentSpecSchema = z.object({
  role: z.string(),
  /** The persona's system prompt — the skin's voice. */
  systemPrompt: z.string(),
  /** Appended on return visits. */
  returnPrompt: z.string().optional(),
  /** Which engine output shape this agent yields. */
  output: z.enum(["agent", "synthesis"]),
  readScopes: z.array(MemoryScopeSchema),
  /** Per-agent mock/live override; falls back to env AGENT_MODE. */
  mode: z.enum(["mock", "live"]).optional(),
});
export type AgentSpec = z.infer<typeof AgentSpecSchema>;

/** The typed manifest a SKIN declares; chamber flow + personas are data, never hardcoded. */
export const ProductManifestSchema = z.object({
  productKey: ProductKeySchema,
  name: z.string(),
  version: z.string(),
  theme: z.string().optional(),
  rootHolon: HolonSchema,
  /** The personas this skin can run, keyed by agentKey; chambers reference these. */
  agents: z.record(AgentSpecSchema),
  chambers: z.array(ChamberSlotSchema),
});
export type ProductManifest = z.infer<typeof ProductManifestSchema>;
