import { randomUUID } from "node:crypto";
import type { ArtifactRecord, EventRecord, MemoryRecord } from "@holo/contracts";
import type {
  CoreRepo,
  CreateSessionInput,
  InsertAgentRunInput,
  InsertEventInput,
  InsertHurlInput,
  InsertMemoryInput,
  SessionRow,
  UpdateMemoryInput,
} from "../repo";

// An in-memory CoreRepo for unit-testing core/ logic without a database.
// Not exported from the package index — test-only.

interface MemRow {
  id: string;
  userId: string;
  sessionId: string | null;
  sourceProduct: string;
  scope: string;
  content: string;
  contentJson?: Record<string, unknown>;
  importance: number;
  seq: number;
}

const BASE_TIME = 1_717_000_000_000;
const isoForSeq = (seq: number): string => new Date(BASE_TIME + seq * 1000).toISOString();

export interface FakeRepo {
  repo: CoreRepo;
  users: Map<string, { id: string; email: string | null; emailSentAt: string | null }>;
  sessions: Map<string, SessionRow & { seq: number }>;
  hurls: InsertHurlInput[];
  events: (InsertEventInput & { id: string; seq: number })[];
  memories: MemRow[];
  artifacts: ArtifactRecord[];
  agentRuns: (InsertAgentRunInput & { id: string })[];
  entitlements: { id: string; userId: string; key: string; source: string; grantedAt: string }[];
}

export function makeFakeRepo(): FakeRepo {
  const users = new Map<string, { id: string; email: string | null; emailSentAt: string | null }>();
  const sessions = new Map<string, SessionRow & { seq: number }>();
  const hurls: InsertHurlInput[] = [];
  const events: (InsertEventInput & { id: string; seq: number })[] = [];
  const memories: MemRow[] = [];
  const artifacts: ArtifactRecord[] = [];
  const entitlements: {
    id: string;
    userId: string;
    key: string;
    source: string;
    grantedAt: string;
  }[] = [];
  const agentRuns: (InsertAgentRunInput & { id: string })[] = [];
  let seq = 0;

  const memToRecord = (m: MemRow): MemoryRecord => ({
    id: m.id,
    userId: m.userId,
    sessionId: m.sessionId,
    sourceProduct: m.sourceProduct as MemoryRecord["sourceProduct"],
    scope: m.scope as MemoryRecord["scope"],
    content: m.content,
    contentJson: m.contentJson,
    importance: m.importance,
    createdAt: isoForSeq(m.seq),
  });

  const repo: CoreRepo = {
    async createAnonUser() {
      const id = randomUUID();
      users.set(id, { id, email: null, emailSentAt: null });
      return { id };
    },
    async userExists(id) {
      return users.has(id);
    },
    async setUserEmail(userId, email) {
      const user = users.get(userId);
      if (!user) return null;
      user.email = email;
      return { id: user.id, email: user.email };
    },
    async getUserEmailSentAt(userId) {
      return users.get(userId)?.emailSentAt ?? null;
    },
    async markUserEmailSent(userId, sentAt) {
      const user = users.get(userId);
      if (user) user.emailSentAt = sentAt;
    },
    async mergeUser(from, into) {
      if (from === into) return { ok: true, note: "noop" };
      let s = 0;
      let e = 0;
      let m = 0;
      let h = 0;
      let a = 0;
      for (const sess of sessions.values()) {
        if (sess.userId === from) {
          sess.userId = into;
          s++;
        }
      }
      for (const ev of events) {
        if (ev.userId === from) {
          ev.userId = into;
          e++;
        }
      }
      for (const mem of memories) {
        if (mem.userId === from) {
          mem.userId = into;
          m++;
        }
      }
      for (const hu of hurls) {
        if (hu.userId === from) {
          hu.userId = into;
          h++;
        }
      }
      for (const art of artifacts) {
        if (art.userId === from) {
          art.userId = into;
          a++;
        }
      }
      users.delete(from);
      return {
        ok: true,
        merged: { sessions: s, events: e, memories: m, hurls: h, artifacts: a, entitlements: 0 },
      };
    },

    async createSession(input: CreateSessionInput) {
      const id = randomUUID();
      sessions.set(id, {
        id,
        userId: input.userId,
        productKey: input.productKey,
        currentChamber: input.currentChamber,
        state: input.state,
        seq: seq++,
      });
      return { id };
    },
    async getSessionById(id) {
      return sessions.get(id) ?? null;
    },
    async getLatestSessionForUser(userId) {
      return (
        [...sessions.values()].filter((s) => s.userId === userId).sort((a, b) => b.seq - a.seq)[0] ??
        null
      );
    },
    async updateSessionState(id, state) {
      const s = sessions.get(id);
      if (s) {
        s.state = state;
        s.currentChamber = state.currentChamber;
      }
    },

    async insertHurl(input) {
      hurls.push(input);
    },
    async getSessionHurlPath(sessionId) {
      return hurls.filter((h) => h.sessionId === sessionId).at(-1)?.path ?? null;
    },
    async findHurlByPath(path) {
      const found = hurls.filter((h) => h.path === path).at(-1);
      return found
        ? { userId: found.userId, sessionId: found.sessionId, productKey: found.productKey }
        : null;
    },

    async insertEvent(input) {
      const id = randomUUID();
      const s = seq++;
      events.push({ ...input, id, seq: s });
      return { id, createdAt: isoForSeq(s) };
    },
    async recentEvents(userId, limit): Promise<EventRecord[]> {
      return events
        .filter((e) => e.userId === userId)
        .sort((a, b) => b.seq - a.seq)
        .slice(0, limit)
        .map((e) => ({
          id: e.id,
          userId: e.userId,
          sessionId: e.sessionId,
          productKey: e.productKey as EventRecord["productKey"],
          chamberKey: e.chamberKey as EventRecord["chamberKey"],
          eventType: e.eventType,
          payload: e.payload,
          createdAt: isoForSeq(e.seq),
        }));
    },

    async insertMemory(input: InsertMemoryInput) {
      const id = randomUUID();
      const s = seq++;
      memories.push({
        id,
        userId: input.userId,
        sessionId: input.sessionId,
        sourceProduct: input.sourceProduct,
        scope: input.scope,
        content: input.content,
        contentJson: input.contentJson,
        importance: input.importance,
        seq: s,
      });
      return { id, createdAt: isoForSeq(s) };
    },
    async findMemoryIdByKey(userId, sourceProduct, scope, key) {
      const found = memories
        .filter(
          (m) =>
            m.userId === userId &&
            m.sourceProduct === sourceProduct &&
            m.scope === scope &&
            m.contentJson?.["key"] === key
        )
        .sort((a, b) => b.seq - a.seq)[0];
      return found?.id ?? null;
    },
    async updateMemoryById(id, input: UpdateMemoryInput) {
      const m = memories.find((row) => row.id === id);
      if (m) {
        m.content = input.content;
        m.contentJson = input.contentJson;
        m.importance = input.importance;
        m.sessionId = input.sessionId;
      }
    },
    async listMemories(userId, scopes, limit): Promise<MemoryRecord[]> {
      // cross-product: filtered by userId only, NOT by source_product
      return memories
        .filter((m) => m.userId === userId && scopes.includes(m.scope))
        .sort((a, b) => b.importance - a.importance || b.seq - a.seq)
        .slice(0, limit)
        .map(memToRecord);
    },
    async topMemories(userId, limit): Promise<MemoryRecord[]> {
      return memories
        .filter((m) => m.userId === userId)
        .sort((a, b) => b.importance - a.importance || b.seq - a.seq)
        .slice(0, limit)
        .map(memToRecord);
    },

    async upsertArtifact(input) {
      const id = randomUUID();
      for (let i = artifacts.length - 1; i >= 0; i--) {
        const a = artifacts[i];
        if (a && a.sessionId === input.sessionId && a.artifactType === input.artifactType) {
          artifacts.splice(i, 1);
        }
      }
      artifacts.unshift({
        id,
        userId: input.userId,
        sessionId: input.sessionId,
        productKey: input.productKey as ArtifactRecord["productKey"],
        artifactType: input.artifactType as ArtifactRecord["artifactType"],
        title: input.title,
        contentJson: input.contentJson,
        fileUrl: input.fileUrl ?? undefined,
        createdAt: isoForSeq(seq++),
      });
      return { id };
    },
    async priorArtifacts(userId, limit): Promise<ArtifactRecord[]> {
      return artifacts.filter((a) => a.userId === userId).slice(0, limit);
    },
    async latestArtifactTitle(userId) {
      return artifacts.find((a) => a.userId === userId)?.title ?? null;
    },

    async insertAgentRun(input) {
      const id = randomUUID();
      agentRuns.push({ ...input, id });
      return { id };
    },

    async upsertEntitlement(input) {
      const existing = entitlements.find((e) => e.userId === input.userId && e.key === input.key);
      if (existing) {
        existing.source = input.source;
        return { id: existing.id };
      }
      const id = randomUUID();
      entitlements.push({
        id,
        userId: input.userId,
        key: input.key,
        source: input.source,
        grantedAt: isoForSeq(seq++),
      });
      return { id };
    },
    async getEntitlements(userId) {
      return entitlements
        .filter((e) => e.userId === userId)
        .map((e) => ({ key: e.key, source: e.source, grantedAt: e.grantedAt }));
    },
  };

  return { repo, users, sessions, hurls, events, memories, artifacts, agentRuns, entitlements };
}
