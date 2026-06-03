import type {
  MemoryContextRequest,
  MemoryContextResponse,
  MemoryRecord,
  MemoryScope,
  MemoryUpsertRequest,
  MemoryUpsertResponse,
} from "@holo/contracts";
import type { CoreRepo } from "../repo";

const DEFAULT_SCOPES: MemoryScope[] = ["profile", "state", "narrative", "trajectory"];
const MEMORY_LIMIT = 50;
const RECENT_EVENTS_LIMIT = 25;
const PRIOR_ARTIFACTS_LIMIT = 10;

function dedupeKeyOf(input: MemoryUpsertRequest): string | null {
  const key = input.contentJson?.["key"];
  return typeof key === "string" ? key : null;
}

/**
 * Write or update a memory. Always carries `sourceProduct` + `scope` so another
 * product can later read it. Dedupe rule: an explicit id updates that row; else
 * a `contentJson.key` updates the matching (user, sourceProduct, scope, key)
 * row if one exists; otherwise a new row is inserted.
 */
export async function upsertMemory(
  repo: CoreRepo,
  input: MemoryUpsertRequest
): Promise<MemoryUpsertResponse> {
  const update = {
    content: input.content,
    contentJson: input.contentJson,
    importance: input.importance,
    sessionId: input.sessionId,
  };

  if (input.id) {
    await repo.updateMemoryById(input.id, update);
    return { memoryId: input.id, scope: input.scope };
  }

  const key = dedupeKeyOf(input);
  if (key) {
    const existing = await repo.findMemoryIdByKey(input.userId, input.sourceProduct, input.scope, key);
    if (existing) {
      await repo.updateMemoryById(existing, update);
      return { memoryId: existing, scope: input.scope };
    }
  }

  const created = await repo.insertMemory({
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: input.sourceProduct,
    scope: input.scope,
    content: input.content,
    contentJson: input.contentJson,
    importance: input.importance,
  });
  return { memoryId: created.id, scope: input.scope };
}

/**
 * Assemble memory context for an agent or UI surface. THIS IS THE CROSS-PRODUCT
 * READ: memories/events/artifacts are filtered by `userId` only — never by the
 * requesting product — so every product inherits what the others learned.
 */
export async function getContext(
  repo: CoreRepo,
  params: MemoryContextRequest
): Promise<MemoryContextResponse> {
  const scopes = params.scopes && params.scopes.length > 0 ? params.scopes : DEFAULT_SCOPES;

  const memories = await repo.listMemories(params.userId, scopes, MEMORY_LIMIT);
  const inScope = (scope: MemoryScope): MemoryRecord[] => memories.filter((m) => m.scope === scope);

  const [recentEvents, priorArtifacts] = await Promise.all([
    repo.recentEvents(params.userId, RECENT_EVENTS_LIMIT),
    repo.priorArtifacts(params.userId, PRIOR_ARTIFACTS_LIMIT),
  ]);

  return {
    userId: params.userId,
    asOf: new Date().toISOString(),
    profile: inScope("profile"),
    state: inScope("state"),
    narrative: inScope("narrative"),
    trajectory: inScope("trajectory"),
    recentEvents,
    priorArtifacts,
  };
}
