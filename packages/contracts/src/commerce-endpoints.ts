import { z } from "zod";
import {
  EntitlementKeySchema,
  EntitlementSourceSchema,
  IsoDateTimeSchema,
  UuidSchema,
} from "./primitives";

// I/O for checkout / webhook / entitlements (see docs/api-contracts.md, S14 entitlements).

/** What a user can purchase. "base" is the $27 product; "astro-addon" grants an entitlement. */
export const CheckoutItemSchema = z.enum(["base", "astro-addon"]);
export type CheckoutItem = z.infer<typeof CheckoutItemSchema>;

export const CheckoutRequestSchema = z.object({
  userId: UuidSchema,
  item: CheckoutItemSchema,
});
export type CheckoutRequest = z.infer<typeof CheckoutRequestSchema>;

export const CheckoutResponseSchema = z.object({
  enabled: z.boolean(),
  /** free-beta = PAYMENTS_ENABLED off; mock = on but no Stripe key; live = real Stripe. */
  mode: z.enum(["free-beta", "mock", "live"]),
  /** open = no charge needed; granted = entitlement written now (mock); redirect = go to Stripe. */
  status: z.enum(["open", "granted", "redirect"]),
  item: CheckoutItemSchema,
  checkoutUrl: z.string().optional(),
  grantedEntitlement: EntitlementKeySchema.nullable().optional(),
});
export type CheckoutResponse = z.infer<typeof CheckoutResponseSchema>;

/** Mock/test webhook grant (used when STRIPE_WEBHOOK_SECRET is unset). */
export const WebhookTestGrantSchema = z.object({
  userId: UuidSchema,
  entitlementKey: EntitlementKeySchema,
  source: EntitlementSourceSchema,
});
export type WebhookTestGrant = z.infer<typeof WebhookTestGrantSchema>;

export const WebhookResponseSchema = z.object({
  ok: z.boolean(),
  entitlementId: UuidSchema.optional(),
  note: z.string().optional(),
});
export type WebhookResponse = z.infer<typeof WebhookResponseSchema>;

export const EntitlementSummarySchema = z.object({
  key: EntitlementKeySchema,
  source: EntitlementSourceSchema,
  grantedAt: IsoDateTimeSchema,
});
export type EntitlementSummary = z.infer<typeof EntitlementSummarySchema>;

export const EntitlementsGetResponseSchema = z.object({
  userId: UuidSchema,
  /** Whether the paywall is active; false = free beta (everything open). */
  paymentsEnabled: z.boolean(),
  entitlements: z.array(EntitlementSummarySchema),
});
export type EntitlementsGetResponse = z.infer<typeof EntitlementsGetResponseSchema>;
