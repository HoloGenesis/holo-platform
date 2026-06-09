import { z } from "zod";
import { UuidSchema } from "./primitives";

// proof-v1 (S85). The conversion-proof moment: two responses to the same
// becoming question — a bland generic baseline and a SoulSeed-attuned answer
// that visibly cites what the user told us. Runs after cohering-v1.

export const ProofInputSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
});
export type ProofInput = z.infer<typeof ProofInputSchema>;

export const ProofOutputSchema = z.object({
  demoQuestion: z.string(), // the question both responses answer
  genericResponse: z.string(), // bland baseline, no user context
  attunedResponse: z.string(), // uses recognition + chamber vectors
  attunedCitation: z.string(), // a short phrase the attuned response cites verbatim
});
export type ProofOutput = z.infer<typeof ProofOutputSchema>;
