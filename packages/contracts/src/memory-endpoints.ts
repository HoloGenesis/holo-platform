import { z } from "zod";
import {
  ChamberKeySchema,
  IsoDateTimeSchema,
  MemoryScopeSchema,
  ProductKeySchema,
  UuidSchema,
} from "./primitives";
import { MemoryRecordSchema } from "./memory";
import { EventRecordSchema } from "./event";
import { ArtifactRecordSchema } from "./artifact";

// I/O contracts for events + memory endpoints (see docs/api-contracts.md,
// docs/memory-model.md).

// --- events (write) -------------------------------------------------------

export const EventWriteRequestSchema = EventRecordSchema;
export type EventWriteRequest = z.infer<typeof EventWriteRequestSchema>;

export const EventWriteResponseSchema = z.object({
  eventId: UuidSchema,
  createdAt: IsoDateTimeSchema,
});
export type EventWriteResponse = z.infer<typeof EventWriteResponseSchema>;

// --- memory/upsert --------------------------------------------------------

export const MemoryUpsertRequestSchema = MemoryRecordSchema;
export type MemoryUpsertRequest = z.infer<typeof MemoryUpsertRequestSchema>;

export const MemoryUpsertResponseSchema = z.object({
  memoryId: UuidSchema,
  scope: MemoryScopeSchema,
});
export type MemoryUpsertResponse = z.infer<typeof MemoryUpsertResponseSchema>;

// --- memory/context -------------------------------------------------------

export const MemoryContextRequestSchema = z.object({
  userId: UuidSchema,
  /** The requesting product (for future permissioning); does NOT filter rows in v1. */
  productKey: ProductKeySchema,
  chamberKey: ChamberKeySchema.optional(),
  /** Defaults to [profile, state, narrative, trajectory] when omitted. */
  scopes: z.array(MemoryScopeSchema).optional(),
});
export type MemoryContextRequest = z.infer<typeof MemoryContextRequestSchema>;

/**
 * Context assembled for an agent or UI surface. Memories are grouped by scope;
 * `recentEvents` and `priorArtifacts` round out the picture. All of it is scoped
 * by userId only — so any product sees what every other product learned.
 */
export const MemoryContextResponseSchema = z.object({
  userId: UuidSchema,
  asOf: IsoDateTimeSchema,
  profile: z.array(MemoryRecordSchema),
  state: z.array(MemoryRecordSchema),
  narrative: z.array(MemoryRecordSchema),
  trajectory: z.array(MemoryRecordSchema),
  recentEvents: z.array(EventRecordSchema),
  priorArtifacts: z.array(ArtifactRecordSchema),
});
export type MemoryContextResponse = z.infer<typeof MemoryContextResponseSchema>;
