import { z } from "zod";
import { UuidSchema } from "./primitives";

// Cohering-v1 (S84). One LLM call reads the user's single freeform answer and
// returns BOTH a recognition line for the UI and 6 chamber vectors for the
// backend. Chambers become hidden interpretive lenses, not visible turns.
// "First run proves meetability. Returns deepen identity."

/** Short interpretive strings, one per (hidden) chamber dimension. */
export const ChamberVectorsSchema = z.object({
  threshold: z.string(),
  identitySeed: z.string(),
  presentState: z.string(),
  memoryRoot: z.string(),
  trajectoryBranch: z.string(),
  livingInvitation: z.string(),
});
export type ChamberVectors = z.infer<typeof ChamberVectorsSchema>;

export const CoheringInputSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  answer: z.string().min(1).max(4000),
  /** Path (c) "Not quite": the corrective signal — regenerate from this. */
  correctionOf: z.string().optional(),
  /** Path (b) "Mostly, but there's more": augments the answer, not replaces it. */
  addedContext: z.string().optional(),
  /** "return" = re-cohering on a return visit (S89); defaults to "first". */
  mode: z.enum(["first", "return"]).optional(),
});
export type CoheringInput = z.infer<typeof CoheringInputSchema>;

export const CoheringOutputSchema = z.object({
  recognitionLine: z.string(), // 1–2 sentences for Screen 5
  supportingLine: z.string(), // 1 sentence "why this matters"
  chamberVectors: ChamberVectorsSchema,
  confidence: z.number().min(0).max(1),
  /** Short support-style tags, e.g. "warm", "direct", "evidence-based" (S84b). */
  supportStyleSignals: z.array(z.string()).min(1).max(8),
  /** Short avoid tags, e.g. "fluff", "false positivity", "generic advice" (S84b). */
  avoidSignals: z.array(z.string()).min(0).max(8),
  /** One concrete sentence, e.g. "Choose one priority and define what enough looks like." */
  nextCoherentStep: z.string().min(1),
});
export type CoheringOutput = z.infer<typeof CoheringOutputSchema>;
