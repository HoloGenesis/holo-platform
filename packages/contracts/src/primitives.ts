import { z } from "zod";

// ---------------------------------------------------------------------------
// Scalar primitives
// ---------------------------------------------------------------------------

/** UUID (v4) string. */
export const UuidSchema = z.string().uuid();
export type Uuid = z.infer<typeof UuidSchema>;

/** ISO-8601 datetime string. */
export const IsoDateTimeSchema = z.string().datetime();
export type IsoDateTime = z.infer<typeof IsoDateTimeSchema>;

/** Email — nullable, because identity is anonymous-first (`email = null` allowed). */
export const EmailSchema = z.string().email().nullable();
export type Email = z.infer<typeof EmailSchema>;

/** Memory ranking signal: a single float 0.00–1.00 (the only ranking weight in v1). */
export const ImportanceSchema = z.number().min(0).max(1);
export type Importance = z.infer<typeof ImportanceSchema>;

// ---------------------------------------------------------------------------
// Closed enums (kept as `as const` arrays so they can build the HURL pattern too)
// ---------------------------------------------------------------------------

export const PRODUCT_KEYS = ["soulseed", "holobook"] as const;
export const ProductKeySchema = z.enum(PRODUCT_KEYS);
export type ProductKey = z.infer<typeof ProductKeySchema>;

export const CHAMBER_KEYS = [
  "threshold",
  "identity-seed",
  "present-state",
  "memory-root",
  "trajectory-branch",
  "living-invitation",
] as const;
export const ChamberKeySchema = z.enum(CHAMBER_KEYS);
export type ChamberKey = z.infer<typeof ChamberKeySchema>;

export const AGENT_KEYS = ["rezzie", "coach", "ang3l"] as const;
export const AgentKeySchema = z.enum(AGENT_KEYS);
export type AgentKey = z.infer<typeof AgentKeySchema>;

/** The seven memory scopes (see docs/memory-model.md). */
export const MEMORY_SCOPES = [
  "profile",
  "state",
  "narrative",
  "trajectory",
  "event",
  "product",
  "artifact",
] as const;
export const MemoryScopeSchema = z.enum(MEMORY_SCOPES);
export type MemoryScope = z.infer<typeof MemoryScopeSchema>;

export const ENTITLEMENT_KEYS = ["astro-addon"] as const;
export const EntitlementKeySchema = z.enum(ENTITLEMENT_KEYS);
export type EntitlementKey = z.infer<typeof EntitlementKeySchema>;

export const ENTITLEMENT_SOURCES = ["stripe", "manual", "promo"] as const;
export const EntitlementSourceSchema = z.enum(ENTITLEMENT_SOURCES);
export type EntitlementSource = z.infer<typeof EntitlementSourceSchema>;
