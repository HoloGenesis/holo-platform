import type { AgentRunRequest, CoachingAgentOutput, SoulSeedAgentOutput } from "@holo/contracts";
import type { CoreRepo } from "../../repo";
import { getContext } from "../memory";
import { getManifest } from "../manifests";
import { mintHurl } from "../hurl";
import { getSession } from "../sessions";
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

/**
 * Parse + validate raw model text. Returns null on malformed JSON or bad shape.
 * The HURL is a Core coordinate the model must never invent — for synthesis
 * output we stamp the deterministically-minted HURL into the snapshot before
 * validating, so a model that guesses the coordinate can't fail the schema.
 */
function validate(
  schema: OutputValidator,
  raw: string,
  outputKind: "agent" | "synthesis",
  hurl: string
): AgentOutput | null {
  let parsed: unknown;
  try {
    parsed = JSON.parse(raw);
  } catch {
    return null;
  }
  if (outputKind === "synthesis" && parsed && typeof parsed === "object") {
    const snapshot = (parsed as { snapshot?: unknown }).snapshot;
    if (snapshot && typeof snapshot === "object") {
      (snapshot as { hurl?: string }).hurl = hurl;
    }
  }
  const result = schema.safeParse(parsed);
  return result.success ? (result.data as AgentOutput) : null;
}

/**
 * The user's HURL for this turn: the deterministically-minted coordinate for the
 * current session + chamber. Falls back to a valid default if the session can't
 * be read, so a snapshot is never blocked on a HURL lookup.
 */
async function resolveHurl(repo: CoreRepo, request: AgentRunRequest): Promise<string> {
  try {
    const session = await getSession(repo, request.sessionId);
    if (session) {
      return mintHurl(
        session.userId,
        request.sessionId,
        request.productKey,
        request.chamberKey,
        session.state
      );
    }
  } catch {
    // fall through to the default below
  }
  return `hurl://${request.productKey}/${request.chamberKey}/state-0/coherence-000`;
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
  const manifest = getManifest(request.productKey);
  const agent = getAgent(manifest, request.agentKey); // throws CoreError for unknown agents
  const router = options.router ?? createModelRouter(agent.mode);

  // 1. build context — pull memory via core/memory.getContext (cross-product)
  const chamber = manifest.chambers.find((c) => c.key === request.chamberKey);
  const scopes = chamber?.memoryReadScopes ?? agent.readScopes;
  const chamberIntro = chamber?.prompts.intro ?? "";
  const ctx = await getContext(repo, {
    userId: request.userId,
    productKey: request.productKey,
    chamberKey: request.chamberKey,
    scopes,
  });

  // Mint the user's HURL coordinate deterministically — Core owns it, the model
  // never invents it. Supplied to the model as context AND stamped post-parse.
  const sessionHurl = await resolveHurl(repo, request);

  // 2. assemble the system prompt from the SKIN's manifest (the skin owns its voice)
  const isReturning = Boolean(request.context?.returnContext);
  const systemPrompt =
    isReturning && agent.returnPrompt
      ? `${agent.systemPrompt}\n\n---\n\n${agent.returnPrompt}`
      : agent.systemPrompt;
  const userContent = JSON.stringify({
    input: request.input,
    hurl: sessionHurl,
    memory: {
      profile: ctx.profile,
      state: ctx.state,
      narrative: ctx.narrative,
      trajectory: ctx.trajectory,
      recentEvents: ctx.recentEvents,
    },
    returnContext: request.context?.returnContext ?? null,
  });

  // 3. generate → validate (retry once) → fallback. A thrown provider/network
  // error is caught and treated like an invalid attempt, so a transient model
  // outage degrades to the safe fallback instead of failing the user's journey.
  let output: AgentOutput | null = null;
  for (let attempt = 0; attempt < 2 && output === null; attempt++) {
    try {
      const raw = await router.generate({
        systemPrompt,
        userContent,
        request,
        outputKind: agent.outputKind,
        chamberIntro,
        corrective: attempt === 1 ? CORRECTIVE : undefined,
      });
      output = validate(agent.outputSchema, raw, agent.outputKind, sessionHurl);
    } catch {
      output = null; // provider error — retry, then fall back below
    }
  }

  const usedFallback = output === null;
  const finalOutput: AgentOutput = output ?? fallbackOutput(agent.outputKind, chamberIntro);
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
