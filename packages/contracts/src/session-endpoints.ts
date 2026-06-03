import { z } from "zod";
import { ChamberKeySchema, ProductKeySchema, UuidSchema } from "./primitives";
import { SessionStateSchema } from "./session";
import { HurlPathSchema } from "./hurl";
import { MemoryRecordSchema } from "./memory";

// I/O contracts for the sessions/* endpoints (see docs/api-contracts.md).

export const ClientHintSchema = z.object({
  tz: z.string().optional(),
  locale: z.string().optional(),
});
export type ClientHint = z.infer<typeof ClientHintSchema>;

// --- sessions/start -------------------------------------------------------

export const SessionStartRequestSchema = z.object({
  productKey: ProductKeySchema,
  /** Omitted on first entry — Core mints an anonymous user. */
  userId: UuidSchema.optional(),
  clientHint: ClientHintSchema.optional(),
});
export type SessionStartRequest = z.infer<typeof SessionStartRequestSchema>;

export const SessionStartResponseSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  isReturning: z.boolean(),
  state: SessionStateSchema,
});
export type SessionStartResponse = z.infer<typeof SessionStartResponseSchema>;

// --- sessions/get ---------------------------------------------------------

export const SessionGetResponseSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  state: SessionStateSchema,
  hurl: HurlPathSchema.optional(),
});
export type SessionGetResponse = z.infer<typeof SessionGetResponseSchema>;

// --- sessions/resume ------------------------------------------------------

export const SessionResumeRequestSchema = z.object({
  userId: UuidSchema,
  /** If absent, the user's most recent session is restored. */
  sessionId: UuidSchema.optional(),
});
export type SessionResumeRequest = z.infer<typeof SessionResumeRequestSchema>;

export const SessionResumeContextSchema = z.object({
  lastChamber: ChamberKeySchema,
  lastSnapshotSummary: z.string(),
  keyMemories: z.array(MemoryRecordSchema),
});
export type SessionResumeContext = z.infer<typeof SessionResumeContextSchema>;

export const SessionResumeResponseSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  state: SessionStateSchema,
  resumeContext: SessionResumeContextSchema,
});
export type SessionResumeResponse = z.infer<typeof SessionResumeResponseSchema>;
