import { z } from "zod";
import { UuidSchema } from "./primitives";

// I/O for users/* endpoints (email capture + account merge). Anonymous-first:
// setEmail sets the email on the EXISTING user row — userId never changes.

export const SetEmailRequestSchema = z.object({
  userId: UuidSchema,
  email: z.string().email(),
});
export type SetEmailRequest = z.infer<typeof SetEmailRequestSchema>;

export const SetEmailResponseSchema = z.object({
  userId: UuidSchema,
  email: z.string().email(),
});
export type SetEmailResponse = z.infer<typeof SetEmailResponseSchema>;

export const MergeUserRequestSchema = z.object({
  from: UuidSchema,
  into: UuidSchema,
});
export type MergeUserRequest = z.infer<typeof MergeUserRequestSchema>;

export const MergedCountsSchema = z.object({
  sessions: z.number(),
  events: z.number(),
  memories: z.number(),
  hurls: z.number(),
  artifacts: z.number(),
  entitlements: z.number(),
});
export type MergedCounts = z.infer<typeof MergedCountsSchema>;

export const MergeUserResponseSchema = z.object({
  ok: z.boolean(),
  merged: MergedCountsSchema.optional(),
  note: z.string().optional(),
});
export type MergeUserResponse = z.infer<typeof MergeUserResponseSchema>;
