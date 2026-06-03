import { ProductKeySchema, SessionStateSchema } from "@holo/contracts";
import type {
  ChamberKey,
  ProductKey,
  ProductManifest,
  SessionGetResponse,
  SessionResumeRequest,
  SessionResumeResponse,
  SessionStartRequest,
  SessionStartResponse,
  SessionState,
} from "@holo/contracts";
import { CoreError } from "../errors";
import { getManifest } from "./manifests";
import type { CoreRepo, SessionRow } from "../repo";

function initialChamberFor(manifest: ProductManifest): ChamberKey {
  return manifest.chambers[0]?.key ?? "threshold";
}

function freshState(initialChamber: ChamberKey): SessionState {
  return {
    currentChamber: initialChamber,
    coherence: 0,
    emergencePressure: 0,
    chambersVisited: [initialChamber],
    custom: {},
  };
}

/**
 * Start (or resume-into) a session. Anonymous-first: if no userId is provided,
 * mint an anonymous user (email NULL). Creates the session at the manifest's
 * initial chamber and mints a placeholder HURL (real minting lands in S17).
 */
export async function startSession(
  repo: CoreRepo,
  input: SessionStartRequest
): Promise<SessionStartResponse> {
  const manifest = getManifest(input.productKey);
  const initialChamber = initialChamberFor(manifest);

  let userId: string;
  let isReturning = false;
  if (input.userId && (await repo.userExists(input.userId))) {
    userId = input.userId;
    isReturning = true;
  } else {
    const created = await repo.createAnonUser();
    userId = created.id;
  }

  const state = freshState(initialChamber);
  const session = await repo.createSession({
    userId,
    productKey: input.productKey,
    currentChamber: initialChamber,
    state,
  });

  // Placeholder HURL — deterministic minting arrives in S17.
  await repo.insertHurl({
    userId,
    sessionId: session.id,
    productKey: input.productKey,
    path: `hurl://${input.productKey}/${initialChamber}/state-1/coherence-000`,
    chamber: initialChamber,
  });

  return { userId, sessionId: session.id, productKey: input.productKey, isReturning, state };
}

function toProductKey(value: string): ProductKey {
  return ProductKeySchema.parse(value);
}

function parseState(row: SessionRow): SessionState {
  return SessionStateSchema.parse(row.state);
}

/** Fetch a session by id for hydration. Returns null if it doesn't exist. */
export async function getSession(
  repo: CoreRepo,
  sessionId: string
): Promise<SessionGetResponse | null> {
  const row = await repo.getSessionById(sessionId);
  if (!row) return null;

  const state = parseState(row);
  const hurl = await repo.getSessionHurlPath(row.id);
  const base: SessionGetResponse = {
    userId: row.userId,
    sessionId: row.id,
    productKey: toProductKey(row.productKey),
    state,
  };
  return hurl ? { ...base, hurl } : base;
}

/**
 * Resume a prior session for the return-visit loop (S25). Loads state and a
 * resume context (last chamber, prior snapshot summary, top memories) that
 * REZZIE will use to ask "what changed?" instead of "welcome back".
 */
export async function resumeSession(
  repo: CoreRepo,
  input: SessionResumeRequest
): Promise<SessionResumeResponse> {
  const row = input.sessionId
    ? await repo.getSessionById(input.sessionId)
    : await repo.getLatestSessionForUser(input.userId);
  if (!row) throw new CoreError("session_not_found", 404);

  const state = parseState(row);
  const keyMemories = await repo.topMemories(input.userId, 10);
  const lastSnapshotSummary = (await repo.latestArtifactTitle(input.userId)) ?? "No prior snapshot yet.";

  return {
    userId: row.userId,
    sessionId: row.id,
    productKey: toProductKey(row.productKey),
    state,
    resumeContext: {
      lastChamber: state.currentChamber,
      lastSnapshotSummary,
      keyMemories,
    },
  };
}
