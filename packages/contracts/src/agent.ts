import { z } from "zod";
import { AgentKeySchema, ChamberKeySchema, ProductKeySchema, UuidSchema } from "./primitives";
import { MemoryRecordSchema, MemoryWriteSchema } from "./memory";
import { SessionStateSchema } from "./session";
import { SoulSeedSnapshotSchema } from "./artifact";

export const AgentRunInputSchema = z.object({
  /** Free-text user input. */
  message: z.string().optional(),
  /** Structured input, e.g. a Between-Place choice. */
  formData: z.record(z.unknown()).optional(),
});
export type AgentRunInput = z.infer<typeof AgentRunInputSchema>;

export const AgentRunContextSchema = z.object({
  /** Injected by Core; clients may pass overrides for testing. */
  memorySnapshot: z.array(MemoryRecordSchema).optional(),
  /** Return-loop hydration for the "What changed?" opener (S25). */
  returnContext: z.record(z.unknown()).optional(),
});
export type AgentRunContext = z.infer<typeof AgentRunContextSchema>;

export const AgentRunRequestSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  chamberKey: ChamberKeySchema,
  agentKey: AgentKeySchema,
  input: AgentRunInputSchema,
  context: AgentRunContextSchema.optional(),
});
export type AgentRunRequest = z.infer<typeof AgentRunRequestSchema>;

/**
 * The ONLY shape an agent returns — structured, never freeform text the app has
 * to parse. The agents/run response IS a SoulSeedAgentOutput in v1.
 */
export const SoulSeedAgentOutputSchema = z.object({
  message: z.string(),
  insight: z.string(),
  detectedThemes: z.array(z.string()),
  coherenceDelta: z.number(),
  memoryWrites: z.array(MemoryWriteSchema),
  statePatch: SessionStateSchema.partial(),
  // agents emit `null` (not just omit) when they have no suggestion
  suggestedNextQuestion: z.string().nullable().optional(),
  suggestedNextChamber: ChamberKeySchema.nullable().optional(),
});
export type SoulSeedAgentOutput = z.infer<typeof SoulSeedAgentOutputSchema>;

/** Alias — the agents/run response is a SoulSeedAgentOutput. */
export const AgentRunResponseSchema = SoulSeedAgentOutputSchema;
export type AgentRunResponse = SoulSeedAgentOutput;

/**
 * COACH's structured output (chamber 6 only). Synthesizes the Snapshot and
 * plants the return seed. See docs / agent-prompts/drafts/coach.md.
 */
export const CoachingAgentOutputSchema = z.object({
  message: z.string(),
  snapshot: SoulSeedSnapshotSchema,
  insight: z.string(),
  detectedThemes: z.array(z.string()),
  coherenceDelta: z.number(),
  memoryWrites: z.array(MemoryWriteSchema),
  statePatch: SessionStateSchema.partial(),
  returnSeed: z.string(),
});
export type CoachingAgentOutput = z.infer<typeof CoachingAgentOutputSchema>;
