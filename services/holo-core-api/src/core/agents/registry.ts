import {
  CoachingAgentOutputSchema,
  CoheringOutputSchema,
  ProofOutputSchema,
  SoulSeedAgentOutputSchema,
} from "@holo/contracts";
import type { AgentSpec, MemoryScope, ProductManifest } from "@holo/contracts";
import { CoreError } from "../../errors";

/** Minimal validator shape (zod's safeParse is structurally compatible). */
export interface OutputValidator {
  safeParse(data: unknown): { success: true; data: unknown } | { success: false };
}

export interface AgentDef {
  key: string;
  role: string;
  systemPrompt: string;
  returnPrompt?: string;
  outputKind: AgentSpec["output"];
  outputSchema: OutputValidator;
  readScopes: MemoryScope[];
  mode?: "mock" | "live";
}

// The engine knows two OUTPUT shapes (both persona-agnostic compass outputs);
// the skin's manifest maps each agent to one. It never names a persona.
const OUTPUT_SCHEMAS: Record<AgentSpec["output"], OutputValidator> = {
  agent: SoulSeedAgentOutputSchema,
  synthesis: CoachingAgentOutputSchema,
};

/**
 * Recipe registry (S84). Recipes are non-persona agents with their own output
 * shape and memory behavior, dispatched outside the manifest-driven persona
 * flow. cohering-v1 reads one freeform answer → recognition + 6 chamber vectors.
 */
export const COHERING_RECIPE = {
  recipeId: "cohering-v1" as const,
  agentKey: "cohering" as const,
  outputSchema: CoheringOutputSchema as OutputValidator,
  readScopes: ["profile", "narrative", "state"] as MemoryScope[],
};

/** proof-v1 (S85): generic vs SoulSeed-attuned A/B from the cohering output. */
export const PROOF_RECIPE = {
  recipeId: "proof-v1" as const,
  agentKey: "proof" as const,
  outputSchema: ProofOutputSchema as OutputValidator,
  readScopes: ["state", "narrative"] as MemoryScope[],
};

/**
 * Resolve an agent from the active skin's manifest — NOT a hardcoded table.
 * A new persona is a manifest entry; zero engine code.
 */
export function getAgent(manifest: ProductManifest, key: string): AgentDef {
  const spec = manifest.agents[key];
  if (!spec) {
    throw new CoreError("unknown_agent", 400, `No agent "${key}" in skin "${manifest.productKey}"`);
  }
  return {
    key,
    role: spec.role,
    systemPrompt: spec.systemPrompt,
    returnPrompt: spec.returnPrompt,
    outputKind: spec.output,
    outputSchema: OUTPUT_SCHEMAS[spec.output],
    readScopes: spec.readScopes,
    mode: spec.mode,
  };
}
