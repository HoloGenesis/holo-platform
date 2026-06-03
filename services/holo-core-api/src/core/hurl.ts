import { HurlPathSchema, ProductKeySchema, SessionStateSchema } from "@holo/contracts";
import type {
  ChamberKey,
  HurlPath,
  HurlResolveResponse,
  ProductKey,
  SessionState,
} from "@holo/contracts";
import { CoreError } from "../errors";
import type { CoreRepo } from "../repo";

// FNV-1a 32-bit — a small, stable, dependency-free string hash.
function fnv1a(input: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < input.length; i++) {
    hash ^= input.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}

/** coherence float (0..1+) → 3-digit triplet, e.g. 0.82 → "082". */
function coherenceTriplet(coherence: number): string {
  const n = Math.max(0, Math.min(999, Math.round((coherence ?? 0) * 100)));
  return String(n).padStart(3, "0");
}

/** A deterministic state coordinate derived from the inputs + session state. */
function stateNumber(userId: string, sessionId: string, state: SessionState): number {
  const stable = [
    userId,
    sessionId,
    state.currentChamber,
    state.coherence,
    state.emergencePressure,
    state.chambersVisited.join(","),
    JSON.stringify(state.custom),
  ].join("|");
  return fnv1a(stable) % 100000;
}

/**
 * Mint a HURL path. Pure and DETERMINISTIC: identical inputs always yield the
 * identical path. Format: hurl://<product>/<chamber>/state-<n>/coherence-<nnn>.
 */
export function mintHurl(
  userId: string,
  sessionId: string,
  productKey: ProductKey,
  chamber: ChamberKey,
  state: SessionState
): HurlPath {
  const n = stateNumber(userId, sessionId, state);
  const coherence = coherenceTriplet(state.coherence);
  const path = `hurl://${productKey}/${chamber}/state-${n}/coherence-${coherence}`;
  return HurlPathSchema.parse(path);
}

/** Mint the HURL for a session's current state and persist it. */
export async function mintAndPersistHurl(repo: CoreRepo, sessionId: string): Promise<HurlPath> {
  const session = await repo.getSessionById(sessionId);
  if (!session) throw new CoreError("session_not_found", 404);

  const state = SessionStateSchema.parse(session.state);
  const productKey = ProductKeySchema.parse(session.productKey);
  const chamber = state.currentChamber;

  const path = mintHurl(session.userId, session.id, productKey, chamber, state);
  await repo.insertHurl({ userId: session.userId, sessionId: session.id, productKey, path, chamber });
  return path;
}

/** Resolve a HURL path back to the user + session that minted it (return-by-HURL). */
export async function resolveHurl(repo: CoreRepo, path: string): Promise<HurlResolveResponse> {
  const found = await repo.findHurlByPath(path);
  if (!found || !found.sessionId) {
    throw new CoreError("hurl_not_found", 404, `No session for HURL "${path}"`);
  }
  return {
    userId: found.userId,
    sessionId: found.sessionId,
    productKey: ProductKeySchema.parse(found.productKey),
  };
}
