import { CoachingAgentOutputSchema, SoulSeedAgentOutputSchema } from "@holo/contracts";
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
