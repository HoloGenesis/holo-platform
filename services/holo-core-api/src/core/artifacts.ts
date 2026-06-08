import type {
  ArtifactCreateRequest,
  ArtifactCreateResponse,
  HurlPath,
  MemoryRecord,
  ProductKey,
  SoulSeedSnapshot,
} from "@holo/contracts";
import { SoulSeedSnapshotSchema } from "@holo/contracts";
import type { ReturnView } from "@holo/contracts";
import type { CoreRepo } from "../repo";
import { assembleReturnView } from "./artifacts/assembleReturn";
import { mintAndPersistHurl } from "./hurl";
import { getContext } from "./memory";
import { upsertMemory } from "./memory";

const ARTIFACT_TYPE = "soulseed-snapshot" as const;

// Honest fallbacks when a source memory is thin/missing (see coach.md). The
// Snapshot is derived from stored signal — never freshly invented.
const FALLBACK = {
  identitySignal: "You arrive as someone in motion — the rest is being written.",
  presentState: "The present is loud and undecided. That's not nothing.",
  returningPattern: "The pattern that keeps returning hasn't named itself yet. Notice when it does.",
  emergingTrajectory: "The direction is faintly drawn. Walk toward the part that's already true.",
  firstInvitation:
    "This week, name the thing you've been pretending not to notice. Write it where you'll see it tomorrow.",
};

function content(memory: MemoryRecord | undefined): string | undefined {
  return memory?.content;
}

function composeInvitation(trajectory: MemoryRecord | undefined): string {
  if (!trajectory) return FALLBACK.firstInvitation;
  return `This week, take one concrete step toward what you named: "${trajectory.content}".`;
}

/**
 * Assemble the SoulSeed Snapshot deterministically from stored memory. Running
 * this twice on the same memory yields the same Snapshot (reproducible) — the
 * fields are derived, not invented.
 */
async function assembleSnapshot(
  repo: CoreRepo,
  userId: string,
  productKey: ProductKey,
  hurl: HurlPath
): Promise<SoulSeedSnapshot> {
  const ctx = await getContext(repo, {
    userId,
    productKey,
    scopes: ["profile", "state", "narrative", "trajectory"],
  });

  return SoulSeedSnapshotSchema.parse({
    identitySignal: content(ctx.narrative[0]) ?? FALLBACK.identitySignal,
    presentState: content(ctx.state[0]) ?? FALLBACK.presentState,
    returningPattern: content(ctx.narrative[1]) ?? content(ctx.state[1]) ?? FALLBACK.returningPattern,
    emergingTrajectory: content(ctx.trajectory[0]) ?? FALLBACK.emergingTrajectory,
    firstInvitation: composeInvitation(ctx.trajectory[0]),
    hurl,
    deeperTrajectoryTeaser: null, // astro-addon entitlement check arrives in S27
  });
}

function titleFor(snapshot: SoulSeedSnapshot): string {
  return snapshot.identitySignal.slice(0, 120);
}

/**
 * Generate, persist, and return the SoulSeed Snapshot for a session. Mints/
 * refreshes the HURL, derives the Snapshot from stored memory, overwrites any
 * prior artifact for this session, and records an artifact-scope memory.
 */
export async function createArtifact(
  repo: CoreRepo,
  input: ArtifactCreateRequest
): Promise<ArtifactCreateResponse> {
  const hurl = await mintAndPersistHurl(repo, input.sessionId);
  const snapshot = await assembleSnapshot(repo, input.userId, input.productKey, hurl);
  const title = titleFor(snapshot);

  // Compute the return delta BEFORE overwriting — on a return the session is
  // reused, so its existing artifact row is the prior Snapshot. null = first visit.
  const returnView: ReturnView | null = await assembleReturnView(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    snapshot,
  });

  const { id } = await repo.upsertArtifact({
    userId: input.userId,
    sessionId: input.sessionId,
    productKey: input.productKey,
    artifactType: ARTIFACT_TYPE,
    title,
    contentJson: snapshot,
    fileUrl: null,
  });

  // a pointer memory so future products / the return loop can find the Snapshot
  await upsertMemory(repo, {
    userId: input.userId,
    sessionId: input.sessionId,
    sourceProduct: input.productKey,
    scope: "artifact",
    content: "SoulSeed Snapshot generated.",
    contentJson: { artifactId: id, summary: snapshot.identitySignal },
    importance: 0.7,
  });

  return {
    artifactId: id,
    artifactType: ARTIFACT_TYPE,
    title,
    contentJson: snapshot,
    hurl,
    ...(returnView ? { returnView } : {}),
  };
}
