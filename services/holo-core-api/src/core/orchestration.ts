import { ProductKeySchema, SessionStateSchema } from "@holo/contracts";
import type {
  ChamberKey,
  EventWriteRequest,
  MemoryUpsertRequest,
  OrchestrationNextRequest,
  OrchestrationNextResponse,
  ProductKey,
  ProductManifest,
  SessionState,
  SoulSeedAgentOutput,
} from "@holo/contracts";
import { getNextChamber } from "@holo/hdom";
import { CoreError } from "../errors";
import type { CoreRepo } from "../repo";
import { writeEvent } from "./events";
import { mintAndPersistHurl } from "./hurl";
import { getManifest } from "./manifests";
import { upsertMemory } from "./memory";

export interface ArtifactDraft {
  artifactType: "soulseed-snapshot";
  title: string;
  contentJson: Record<string, unknown>;
}

export interface OrchestrationNextArgs {
  userId: string;
  sessionId: string;
  productKey: ProductKey;
  currentChamber: ChamberKey;
  state: SessionState;
  agentOutput: SoulSeedAgentOutput;
  manifest: ProductManifest;
}

export interface OrchestrationPlan {
  nextChamber: ChamberKey | null;
  statePatch: Partial<SessionState>;
  eventsToWrite: EventWriteRequest[];
  memoriesToWrite: MemoryUpsertRequest[];
  artifactDraft: ArtifactDraft | null;
}

const clamp = (value: number, lo: number, hi: number): number =>
  Math.max(lo, Math.min(hi, value));

/**
 * Pure orchestration planner. Decides the next chamber FROM THE MANIFEST (via
 * getNextChamber, with an optional validated agent override), computes the
 * state patch, and gathers the events/memories/artifact to persist. No I/O.
 */
export function next(args: OrchestrationNextArgs): OrchestrationPlan {
  const { userId, sessionId, productKey, currentChamber, state, agentOutput, manifest } = args;

  const manifestNext = getNextChamber(manifest, currentChamber);
  const suggested = agentOutput.suggestedNextChamber;
  const suggestionIsValid =
    suggested !== undefined && manifest.chambers.some((c) => c.key === suggested);
  const nextChamber: ChamberKey | null = suggestionIsValid ? suggested! : manifestNext;

  const advancedChamber = nextChamber ?? currentChamber;
  const chambersVisited = state.chambersVisited.includes(advancedChamber)
    ? state.chambersVisited
    : [...state.chambersVisited, advancedChamber];

  const statePatch: Partial<SessionState> = {
    ...agentOutput.statePatch,
    currentChamber: advancedChamber,
    coherence: clamp(state.coherence + agentOutput.coherenceDelta, 0, 1),
    chambersVisited,
  };

  const eventsToWrite: EventWriteRequest[] = [
    {
      userId,
      sessionId,
      productKey,
      chamberKey: currentChamber,
      eventType: "orchestration.advanced",
      payload: {
        from: currentChamber,
        to: nextChamber,
        coherenceDelta: agentOutput.coherenceDelta,
        detectedThemes: agentOutput.detectedThemes,
      },
    },
  ];

  const memoriesToWrite: MemoryUpsertRequest[] = agentOutput.memoryWrites.map((write) => ({
    userId,
    sessionId,
    sourceProduct: productKey,
    scope: write.scope,
    content: write.content,
    contentJson: write.contentJson ?? undefined,
    importance: write.importance,
  }));

  const artifactDraft: ArtifactDraft | null =
    nextChamber === null
      ? {
          artifactType: "soulseed-snapshot",
          title: "SoulSeed Snapshot",
          contentJson: {
            insight: agentOutput.insight,
            message: agentOutput.message,
            detectedThemes: agentOutput.detectedThemes,
          },
        }
      : null;

  return { nextChamber, statePatch, eventsToWrite, memoriesToWrite, artifactDraft };
}

/**
 * Run the planner for a session and PERSIST the result: apply the state patch,
 * write the planned events + memories (via the S16 core lib), re-mint the HURL.
 * Artifact persistence is deferred to S23 — the draft is computed but not stored.
 */
export async function applyNext(
  repo: CoreRepo,
  input: OrchestrationNextRequest
): Promise<OrchestrationNextResponse> {
  const session = await repo.getSessionById(input.sessionId);
  if (!session) throw new CoreError("session_not_found", 404);

  const state = SessionStateSchema.parse(session.state);
  const productKey = ProductKeySchema.parse(session.productKey);
  const manifest = getManifest(productKey);

  const plan = next({
    userId: session.userId,
    sessionId: session.id,
    productKey,
    currentChamber: state.currentChamber,
    state,
    agentOutput: input.agentOutput,
    manifest,
  });

  const newState: SessionState = { ...state, ...plan.statePatch };
  await repo.updateSessionState(session.id, newState);

  for (const memory of plan.memoriesToWrite) {
    await upsertMemory(repo, memory);
  }
  for (const event of plan.eventsToWrite) {
    await writeEvent(repo, event);
  }

  const hurl = await mintAndPersistHurl(repo, session.id);

  return { sessionId: session.id, state: newState, nextChamber: plan.nextChamber, hurl };
}
