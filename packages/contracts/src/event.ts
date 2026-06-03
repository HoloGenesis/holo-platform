import { z } from "zod";
import { ChamberKeySchema, IsoDateTimeSchema, ProductKeySchema, UuidSchema } from "./primitives";

/**
 * A single user/system event. Every meaningful interaction writes one.
 * Cheap and additive — never updated, never deleted.
 */
export const EventRecordSchema = z.object({
  id: UuidSchema.optional(),
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  chamberKey: ChamberKeySchema,
  /** e.g. "chamber.entered", "intake.captured", "choice.selected". */
  eventType: z.string().min(1),
  payload: z.record(z.unknown()),
  createdAt: IsoDateTimeSchema.optional(),
});
export type EventRecord = z.infer<typeof EventRecordSchema>;
