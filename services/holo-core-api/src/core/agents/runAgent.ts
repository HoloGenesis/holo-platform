import type { AgentRunRequest, CoachingAgentOutput, SoulSeedAgentOutput } from "@holo/contracts";
import { composePrompt } from "@holo/agent-prompts";
import type { CoreRepo } from "../../repo";
import { getContext } from "../memory";
import { getManifest } from "../manifests";
import { fallbackOutput } from "./fallback";
import { createModelRouter } from "./modelRouter";
import type { ModelRouter } from "./modelRouter";
import { getAgent } from "./registry";
import type { OutputValidator } from "./registry";

export type AgentOutput = SoulSeedAgentOutput | CoachingAgentOutput;

export interface RunAgentResult {
  agentKey: AgentRunRequest["agentKey"];
  model: string;
  usedFallback: boolean;
  agentRunId: string;
  output: AgentOutput;
}

export interface RunAgentOptions {
  /** Inject a router (tests / custom providers). Defaults to env-resolved. */
  router?: ModelRouter;
}

const CORRECTIVE =
  "Your previous response did not match the required JSON schema. Re-emit a single valid JSON object only — no text, no markdown outside the JSON.";

/** Parse + validate raw model text. Returns null on malformed JSON or bad shape. */
function validate(schema: OutputValidator, raw: string): AgentOutput | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  const result = schema.safeParse(parsed);
  return result.success ? (result.data as AgentOutput) : null;
}

/**
 * Run an agent: build memory context, load the prompt from @holo/agent-prompts,
 * call the model router, validate the output against the agent's schema (retry
 * once on failure, then fall back to a safe canned response), and persist the
 * run to agent_runs. Never throws on bad model output.
 */
export async function runAgent(
  repo: CoreRepo,
  request: AgentRunRequest,
  options: RunAgentOptions = {}
): Promise<RunAgentResult> {
  const agent = getAgent(request.agentKey); // throws CoreError for unknown agents
  const router = options.router ?? createModelRouter();
  const manifest = getManifest(request.productKey);

  // 1. build context — pull memory via core/memory.getContext (cross-product)
  const chamber = manifest.chambers.find((c) => c.key === request.chamberKey);
  const scopes = chamber?.memoryReadScopes ?? agent.defaultReadScopes;
  const ctx = await getContext(repo, {
    userId: request.userId,
    productKey: request.productKey,
    chamberKey: request.chamberKey,
    scopes,
  });

  // 2. load + compose the prompt (never inlined here)
  const isReturning = Boolean(request.context?.returnContext);
  const systemPrompt = composePrompt({
    agent: agent.promptAgent,
    chamberKey: request.chamberKey,
    isReturning,
  });
  const userContent = JSON.stringify({
    input: request.input,
    memory: {
      profile: ctx.profile,
      state: ctx.state,
      narrative: ctx.narrative,
      trajectory: ctx.trajectory,
      recentEvents: ctx.recentEvents,
    },
    returnContext: request.context?.returnContext ?? null,
  });

  // 3. generate → validate (retry once) → fallback
  let output: AgentOutput | null = null;
  for (let attempt = 0; attempt < 2 && output === null; attempt++) {
    const raw = await router.generate({
      systemPrompt,
      userContent,
      request,
      corrective: attempt === 1 ? CORRECTIVE : undefined,
    });
    output = validate(agent.outputSchema, raw);
  }

  const usedFallback = output === null;
  const finalOutput: AgentOutput = output ?? fallbackOutput(request, manifest);
  const model = usedFallback ? `${router.model}+fallback` : router.model;

  // 4. persist the run
  const run = await repo.insertAgentRun({
    userId: request.userId,
    sessionId: request.sessionId,
    productKey: request.productKey,
    chamberKey: request.chamberKey,
    agentKey: request.agentKey,
    input: request.input,
    output: finalOutput,
    model,
  });

  return {
    agentKey: request.agentKey,
    model,
    usedFallback,
    agentRunId: run.id,
    output: finalOutput,
  };
}
