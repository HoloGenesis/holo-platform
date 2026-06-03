import { z } from "zod";
import { EmailSchema, IsoDateTimeSchema, UuidSchema } from "./primitives";

/**
 * A user. Exists from first entry with `email = null` (anonymous-first).
 * Email is set later at the export chamber; rows never need migrating because
 * the `userId` is already correct everywhere.
 */
export const UserSchema = z.object({
  id: UuidSchema,
  email: EmailSchema,
  emailCapturedAt: IsoDateTimeSchema.nullable().optional(),
  createdAt: IsoDateTimeSchema.optional(),
  /** Appended-to when `merge_user` finds conflicting profile facts. */
  mergeConflicts: z.record(z.unknown()).optional(),
});
export type User = z.infer<typeof UserSchema>;
