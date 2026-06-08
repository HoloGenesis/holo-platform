import type { ArtifactRecord, EventRecord, MemoryRecord, SessionState } from "@holo/contracts";

/** A persisted session row, normalized to camelCase. `state` is the JSONB blob. */
export interface SessionRow {
  id: string;
  userId: string;
  productKey: string;
  currentChamber: string | null;
  state: unknown;
}

export interface CreateSessionInput {
  userId: string;
  productKey: string;
  currentChamber: string;
  state: SessionState;
}

export interface InsertHurlInput {
  userId: string;
  sessionId: string;
  productKey: string;
  path: string;
  chamber: string;
}

export interface InsertEventInput {
  userId: string;
  sessionId: string;
  productKey: string;
  chamberKey: string;
  eventType: string;
  payload: Record<string, unknown>;
}

export interface InsertMemoryInput {
  userId: string;
  sessionId: string | null;
  sourceProduct: string;
  scope: string;
  content: string;
  contentJson?: Record<string, unknown>;
  importance: number;
}

export interface UpdateMemoryInput {
  content: string;
  contentJson?: Record<string, unknown>;
  importance: number;
  sessionId: string | null;
}

export interface UpsertArtifactInput {
  userId: string;
  sessionId: string;
  productKey: string;
  artifactType: string;
  title: string;
  contentJson: Record<string, unknown>;
  fileUrl: string | null;
}

export interface InsertAgentRunInput {
  userId: string;
  sessionId: string;
  productKey: string;
  chamberKey: string;
  agentKey: string;
  input: unknown;
  output: unknown;
  model: string;
}

/**
 * The data-access port the core/ library depends on. The only place that talks
 * to the database is an implementation of this interface (the pg adapter). Core
 * functions take a `CoreRepo` so they stay pure and unit-testable with a fake.
 */
export interface CoreRepo {
  // users
  createAnonUser(): Promise<{ id: string }>;
  userExists(id: string): Promise<boolean>;
  setUserEmail(userId: string, email: string): Promise<{ id: string; email: string | null } | null>;
  /** Last HURL-invitation send time (ISO), or null if never sent. */
  getUserEmailSentAt(userId: string): Promise<string | null>;
  /** Stamp the last successful HURL-invitation send (ISO timestamp). */
  markUserEmailSent(userId: string, sentAt: string): Promise<void>;
  mergeUser(
    from: string,
    into: string
  ): Promise<{
    ok: boolean;
    merged?: {
      sessions: number;
      events: number;
      memories: number;
      hurls: number;
      artifacts: number;
      entitlements: number;
    };
    note?: string;
  }>;

  // sessions
  createSession(input: CreateSessionInput): Promise<{ id: string }>;
  getSessionById(id: string): Promise<SessionRow | null>;
  getLatestSessionForUser(userId: string): Promise<SessionRow | null>;
  updateSessionState(id: string, state: SessionState): Promise<void>;

  // hurls
  insertHurl(input: InsertHurlInput): Promise<void>;
  getSessionHurlPath(sessionId: string): Promise<string | null>;
  findHurlByPath(
    path: string
  ): Promise<{ userId: string; sessionId: string | null; productKey: string } | null>;

  // events
  insertEvent(input: InsertEventInput): Promise<{ id: string; createdAt: string }>;
  recentEvents(userId: string, limit: number): Promise<EventRecord[]>;

  // memories  (reads are by userId only — cross-product by design)
  insertMemory(input: InsertMemoryInput): Promise<{ id: string; createdAt: string }>;
  findMemoryIdByKey(
    userId: string,
    sourceProduct: string,
    scope: string,
    key: string
  ): Promise<string | null>;
  updateMemoryById(id: string, input: UpdateMemoryInput): Promise<void>;
  listMemories(userId: string, scopes: string[], limit: number): Promise<MemoryRecord[]>;
  topMemories(userId: string, limit: number): Promise<MemoryRecord[]>;

  // artifacts
  upsertArtifact(input: UpsertArtifactInput): Promise<{ id: string }>;
  priorArtifacts(userId: string, limit: number): Promise<ArtifactRecord[]>;
  latestArtifactTitle(userId: string): Promise<string | null>;

  // agent runs
  insertAgentRun(input: InsertAgentRunInput): Promise<{ id: string }>;

  // entitlements
  upsertEntitlement(input: UpsertEntitlementInput): Promise<{ id: string }>;
  getEntitlements(userId: string): Promise<{ key: string; source: string; grantedAt: string }[]>;
}

export interface UpsertEntitlementInput {
  userId: string;
  key: string;
  source: string;
  stripeRef?: string | null;
}
