import { z } from "zod";
import {
  ImportanceSchema,
  IsoDateTimeSchema,
  MemoryScopeSchema,
  ProductKeySchema,
  UuidSchema,
} from "./primitives";

/** A single memory write, as emitted inside an agent's structured output. */
export const MemoryWriteSchema = z.object({
  scope: MemoryScopeSchema,
  content: z.string(),
  // agents emit `null` when there's no structured payload
  contentJson: z.record(z.unknown()).nullable().optional(),
  importance: ImportanceSchema,
});
export type MemoryWrite = z.infer<typeof MemoryWriteSchema>;

/**
 * A persisted memory row — also the `memory/upsert` request shape.
 * `sessionId` is nullable: some memories (profile facts, narrative arcs)
 * outlive the session that produced them.
 */
export const MemoryRecordSchema = z.object({
  id: UuidSchema.optional(),
  userId: UuidSchema,
  sessionId: UuidSchema.nullable(),
  sourceProduct: ProductKeySchema,
  scope: MemoryScopeSchema,
  content: z.string(),
  contentJson: z.record(z.unknown()).optional(),
  importance: ImportanceSchema,
  createdAt: IsoDateTimeSchema.optional(),
  updatedAt: IsoDateTimeSchema.optional(),
});
export type MemoryRecord = z.infer<typeof MemoryRecordSchema>;
