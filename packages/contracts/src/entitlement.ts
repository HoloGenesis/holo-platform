import { z } from "zod";
import {
  EntitlementKeySchema,
  EntitlementSourceSchema,
  IsoDateTimeSchema,
  UuidSchema,
} from "./primitives";

/**
 * What a user has paid to unlock (e.g. `astro-addon`). Not a memory and not an
 * event — queryable state about the relationship with the product.
 */
export const EntitlementSchema = z.object({
  id: UuidSchema.optional(),
  userId: UuidSchema,
  key: EntitlementKeySchema,
  source: EntitlementSourceSchema,
  grantedAt: IsoDateTimeSchema,
  /** Soft-revoke: null = active. */
  revokedAt: IsoDateTimeSchema.nullable().optional(),
  /** Stripe charge or subscription id, when source = "stripe". */
  stripeRef: z.string().optional(),
});
export type Entitlement = z.infer<typeof EntitlementSchema>;
