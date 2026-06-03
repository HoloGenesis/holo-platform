import { z } from "zod";
import { ChamberKeySchema, ProductKeySchema, UuidSchema } from "./primitives";
import { SessionStateSchema } from "./session";
import { SoulSeedAgentOutputSchema } from "./agent";
import { HurlPathSchema } from "./hurl";

// I/O contracts for orchestration + HURL endpoints (see docs/api-contracts.md).

// --- orchestrations/next --------------------------------------------------

export const OrchestrationNextRequestSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
  agentOutput: SoulSeedAgentOutputSchema,
});
export type OrchestrationNextRequest = z.infer<typeof OrchestrationNextRequestSchema>;

export const OrchestrationNextResponseSchema = z.object({
  sessionId: UuidSchema,
  state: SessionStateSchema,
  nextChamber: ChamberKeySchema.nullable(),
  hurl: HurlPathSchema.optional(),
});
export type OrchestrationNextResponse = z.infer<typeof OrchestrationNextResponseSchema>;

// --- hurl/mint ------------------------------------------------------------

export const HurlMintRequestSchema = z.object({
  sessionId: UuidSchema,
});
export type HurlMintRequest = z.infer<typeof HurlMintRequestSchema>;

export const HurlMintResponseSchema = z.object({
  hurl: HurlPathSchema,
});
export type HurlMintResponse = z.infer<typeof HurlMintResponseSchema>;

// --- hurl/resolve (return-by-HURL) ---------------------------------------

/** Resolve a HURL path back to the user + session that minted it. */
export const HurlResolveResponseSchema = z.object({
  userId: UuidSchema,
  sessionId: UuidSchema,
  productKey: ProductKeySchema,
});
export type HurlResolveResponse = z.infer<typeof HurlResolveResponseSchema>;
