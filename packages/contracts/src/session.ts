import { z } from "zod";
import { ChamberKeySchema, IsoDateTimeSchema, ProductKeySchema, UuidSchema } from "./primitives";
import { HurlPathSchema } from "./hurl";

/** The live chamber/coherence state carried on a session (JSONB in Postgres). */
export const SessionStateSchema = z.object({
  currentChamber: ChamberKeySchema,
  coherence: z.number(),
  emergencePressure: z.number(),
  chambersVisited: z.array(ChamberKeySchema),
  custom: z.record(z.unknown()),
});
export type SessionState = z.infer<typeof SessionStateSchema>;

export const SessionSchema = z.object({
  id: UuidSchema,
  userId: UuidSchema,
  productKey: ProductKeySchema,
  state: SessionStateSchema,
  hurl: HurlPathSchema.optional(),
  isReturning: z.boolean().optional(),
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
});
export type Session = z.infer<typeof SessionSchema>;
