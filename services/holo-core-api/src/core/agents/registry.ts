import { CoachingAgentOutputSchema, SoulSeedAgentOutputSchema } from "@holo/contracts";
import type { AgentKey, MemoryScope } from "@holo/contracts";
import type { PromptAgent } from "@holo/agent-prompts";
import { CoreError } from "../../errors";

/** Minimal validator shape (zod's safeParse is structurally compatible). */
export interface OutputValidator {
  safeParse(data: unknown): { success: true; data: unknown } | { success: false };
}

export interface AgentDef {
  key: AgentKey;
  role: string;
  promptAgent: PromptAgent;
  outputSchema: OutputValidator;
  /** Default memory scopes to read if the chamber doesn't declare its own. */
  defaultReadScopes: MemoryScope[];
}

const REGISTRY: Partial<Record<AgentKey, AgentDef>> = {
  rezzie: {
    key: "rezzie",
    role: "Sensei Wonderdog at the threshold (chambers 1–5)",
    promptAgent: "rezzie",
    outputSchema: SoulSeedAgentOutputSchema,
    defaultReadScopes: ["profile", "state", "narrative", "trajectory"],
  },
  coach: {
    key: "coach",
    role: "Synthesizing presence at the Living Invitation (chamber 6)",
    promptAgent: "coach",
    outputSchema: CoachingAgentOutputSchema,
    defaultReadScopes: ["profile", "narrative", "state", "trajectory", "event"],
  },
  // ang3l and the broader grid are parked for v1.
};

export function getAgent(key: AgentKey): AgentDef {
  const def = REGISTRY[key];
  if (!def) throw new CoreError("unknown_agent", 400, `No agent "${key}" in v1`);
  return def;
}
