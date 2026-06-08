import pg from "pg";
import { ArtifactRecordSchema, EventRecordSchema, MemoryRecordSchema } from "@holo/contracts";
import type { ArtifactRecord, EventRecord, MemoryRecord } from "@holo/contracts";
import { CoreError } from "./errors";
import type {
  CoreRepo,
  CreateSessionInput,
  InsertAgentRunInput,
  InsertEventInput,
  InsertHurlInput,
  InsertMemoryInput,
  SessionRow,
  UpdateMemoryInput,
  UpsertArtifactInput,
  UpsertEntitlementInput,
} from "./repo";

const { Pool } = pg;

let pool: pg.Pool | null = null;

function getPool(): pg.Pool {
  if (!pool) {
    const connectionString = process.env.DATABASE_URL ?? process.env.HOLO_DATABASE_URL;
    if (!connectionString) {
      throw new CoreError("missing_database_url", 500, "DATABASE_URL is not set");
    }
    pool = new Pool({ connectionString });
  }
  return pool;
}

async function query<T>(sql: string, params: unknown[] = []): Promise<T[]> {
  const result = await getPool().query(sql, params as unknown[]);
  return result.rows as T[];
}

function toIso(value: unknown): string {
  return value instanceof Date ? value.toISOString() : String(value);
}

interface MemoryRow {
  id: string;
  user_id: string;
  session_id: string | null;
  source_product: string;
  scope: string;
  content: string;
  content_json: unknown;
  importance: string;
  created_at: unknown;
}

function mapMemory(row: MemoryRow): MemoryRecord {
  return MemoryRecordSchema.parse({
    id: row.id,
    userId: row.user_id,
    sessionId: row.session_id,
    sourceProduct: row.source_product,
    scope: row.scope,
    content: row.content,
    contentJson: (row.content_json as Record<string, unknown> | null) ?? undefined,
    importance: Number(row.importance),
    createdAt: toIso(row.created_at),
  });
}

const MEMORY_COLUMNS =
  "id, user_id, session_id, source_product, scope, content, content_json, importance, created_at";

/** The Postgres-backed implementation of the CoreRepo port. */
export function createPgRepo(): CoreRepo {
  return {
    // ----- users -----
    async createAnonUser() {
      const rows = await query<{ id: string }>(
        "insert into users (email) values (null) returning id"
      );
      return { id: rows[0]!.id };
    },

    async userExists(id) {
      const rows = await query<{ exists: boolean }>(
        "select exists(select 1 from users where id = $1) as exists",
        [id]
      );
      return rows[0]?.exists ?? false;
    },

    async setUserEmail(userId, email) {
      // sets email on the EXISTING row — no new user, no row migration
      const rows = await query<{ id: string; email: string | null }>(
        "update users set email = $2 where id = $1 returning id, email",
        [userId, email]
      );
      return rows[0] ?? null;
    },

    async getUserEmailSentAt(userId) {
      const rows = await query<{ email_sent_at: unknown }>(
        "select email_sent_at from users where id = $1",
        [userId]
      );
      const value = rows[0]?.email_sent_at ?? null;
      return value == null ? null : toIso(value);
    },

    async markUserEmailSent(userId, sentAt) {
      await query("update users set email_sent_at = $2 where id = $1", [userId, sentAt]);
    },

    async mergeUser(from, into) {
      // delegates to the Postgres merge_user() function (single transaction)
      const rows = await query<{
        result: {
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
        };
      }>("select merge_user($1::uuid, $2::uuid) as result", [from, into]);
      return rows[0]!.result;
    },

    // ----- sessions -----
    async createSession(input: CreateSessionInput) {
      const rows = await query<{ id: string }>(
        `insert into sessions (user_id, product_key, current_chamber, state)
         values ($1, $2, $3, $4::jsonb) returning id`,
        [input.userId, input.productKey, input.currentChamber, JSON.stringify(input.state)]
      );
      return { id: rows[0]!.id };
    },

    async getSessionById(id): Promise<SessionRow | null> {
      const rows = await query<{
        id: string;
        user_id: string;
        product_key: string;
        current_chamber: string | null;
        state: unknown;
      }>(
        "select id, user_id, product_key, current_chamber, state from sessions where id = $1",
        [id]
      );
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        userId: row.user_id,
        productKey: row.product_key,
        currentChamber: row.current_chamber,
        state: row.state,
      };
    },

    async updateSessionState(id, state) {
      await query(
        `update sessions set state = $2::jsonb, current_chamber = $3, updated_at = now()
          where id = $1`,
        [id, JSON.stringify(state), state.currentChamber]
      );
    },

    async getLatestSessionForUser(userId): Promise<SessionRow | null> {
      const rows = await query<{
        id: string;
        user_id: string;
        product_key: string;
        current_chamber: string | null;
        state: unknown;
      }>(
        `select id, user_id, product_key, current_chamber, state
           from sessions where user_id = $1 order by created_at desc limit 1`,
        [userId]
      );
      const row = rows[0];
      if (!row) return null;
      return {
        id: row.id,
        userId: row.user_id,
        productKey: row.product_key,
        currentChamber: row.current_chamber,
        state: row.state,
      };
    },

    // ----- hurls -----
    async insertHurl(input: InsertHurlInput) {
      await query(
        `insert into hurls (user_id, session_id, product_key, path, chamber)
         values ($1, $2, $3, $4, $5)`,
        [input.userId, input.sessionId, input.productKey, input.path, input.chamber]
      );
    },

    async getSessionHurlPath(sessionId) {
      const rows = await query<{ path: string }>(
        "select path from hurls where session_id = $1 order by created_at desc limit 1",
        [sessionId]
      );
      return rows[0]?.path ?? null;
    },

    async findHurlByPath(path) {
      const rows = await query<{
        user_id: string;
        session_id: string | null;
        product_key: string;
      }>(
        "select user_id, session_id, product_key from hurls where path = $1 order by created_at desc limit 1",
        [path]
      );
      const row = rows[0];
      if (!row) return null;
      return { userId: row.user_id, sessionId: row.session_id, productKey: row.product_key };
    },

    // ----- events -----
    async insertEvent(input: InsertEventInput) {
      const rows = await query<{ id: string; created_at: unknown }>(
        `insert into events (user_id, session_id, product_key, chamber_key, event_type, payload)
         values ($1, $2, $3, $4, $5, $6::jsonb) returning id, created_at`,
        [
          input.userId,
          input.sessionId,
          input.productKey,
          input.chamberKey,
          input.eventType,
          JSON.stringify(input.payload),
        ]
      );
      return { id: rows[0]!.id, createdAt: toIso(rows[0]!.created_at) };
    },

    async recentEvents(userId, limit): Promise<EventRecord[]> {
      const rows = await query<{
        id: string;
        user_id: string;
        session_id: string | null;
        product_key: string;
        chamber_key: string | null;
        event_type: string;
        payload: unknown;
        created_at: unknown;
      }>(
        `select id, user_id, session_id, product_key, chamber_key, event_type, payload, created_at
           from events where user_id = $1 order by created_at desc limit $2`,
        [userId, limit]
      );
      return rows.map((row) =>
        EventRecordSchema.parse({
          id: row.id,
          userId: row.user_id,
          sessionId: row.session_id,
          productKey: row.product_key,
          chamberKey: row.chamber_key,
          eventType: row.event_type,
          payload: (row.payload as Record<string, unknown> | null) ?? {},
          createdAt: toIso(row.created_at),
        })
      );
    },

    // ----- memories (reads are by userId only — cross-product) -----
    async insertMemory(input: InsertMemoryInput) {
      const rows = await query<{ id: string; created_at: unknown }>(
        `insert into memories (user_id, session_id, source_product, scope, content, content_json, importance)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7) returning id, created_at`,
        [
          input.userId,
          input.sessionId,
          input.sourceProduct,
          input.scope,
          input.content,
          input.contentJson ? JSON.stringify(input.contentJson) : null,
          input.importance,
        ]
      );
      return { id: rows[0]!.id, createdAt: toIso(rows[0]!.created_at) };
    },

    async findMemoryIdByKey(userId, sourceProduct, scope, key) {
      const rows = await query<{ id: string }>(
        `select id from memories
          where user_id = $1 and source_product = $2 and scope = $3 and content_json->>'key' = $4
          order by created_at desc limit 1`,
        [userId, sourceProduct, scope, key]
      );
      return rows[0]?.id ?? null;
    },

    async updateMemoryById(id, input: UpdateMemoryInput) {
      await query(
        `update memories set content = $2, content_json = $3::jsonb, importance = $4, session_id = $5
          where id = $1`,
        [
          id,
          input.content,
          input.contentJson ? JSON.stringify(input.contentJson) : null,
          input.importance,
          input.sessionId,
        ]
      );
    },

    async listMemories(userId, scopes, limit): Promise<MemoryRecord[]> {
      const rows = await query<MemoryRow>(
        `select ${MEMORY_COLUMNS} from memories
          where user_id = $1 and scope = any($2::text[])
          order by importance desc, created_at desc limit $3`,
        [userId, scopes, limit]
      );
      return rows.map(mapMemory);
    },

    async topMemories(userId, limit): Promise<MemoryRecord[]> {
      const rows = await query<MemoryRow>(
        `select ${MEMORY_COLUMNS} from memories
          where user_id = $1 order by importance desc, created_at desc limit $2`,
        [userId, limit]
      );
      return rows.map(mapMemory);
    },

    // ----- artifacts -----
    async upsertArtifact(input: UpsertArtifactInput) {
      // idempotent per session+type: re-generation overwrites the prior row
      await query("delete from artifacts where session_id = $1 and artifact_type = $2", [
        input.sessionId,
        input.artifactType,
      ]);
      const rows = await query<{ id: string }>(
        `insert into artifacts (user_id, session_id, product_key, artifact_type, title, content_json, file_url)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7) returning id`,
        [
          input.userId,
          input.sessionId,
          input.productKey,
          input.artifactType,
          input.title,
          JSON.stringify(input.contentJson),
          input.fileUrl,
        ]
      );
      return { id: rows[0]!.id };
    },

    async priorArtifacts(userId, limit): Promise<ArtifactRecord[]> {
      const rows = await query<{
        id: string;
        user_id: string;
        session_id: string | null;
        product_key: string;
        artifact_type: string;
        title: string | null;
        content_json: unknown;
        file_url: string | null;
        created_at: unknown;
      }>(
        `select id, user_id, session_id, product_key, artifact_type, title, content_json, file_url, created_at
           from artifacts where user_id = $1 order by created_at desc limit $2`,
        [userId, limit]
      );
      return rows.map((row) =>
        ArtifactRecordSchema.parse({
          id: row.id,
          userId: row.user_id,
          sessionId: row.session_id,
          productKey: row.product_key,
          artifactType: row.artifact_type,
          title: row.title ?? "",
          contentJson: (row.content_json as Record<string, unknown> | null) ?? {},
          fileUrl: row.file_url ?? undefined,
          createdAt: toIso(row.created_at),
        })
      );
    },

    async latestArtifactTitle(userId) {
      const rows = await query<{ title: string | null }>(
        "select title from artifacts where user_id = $1 order by created_at desc limit 1",
        [userId]
      );
      return rows[0]?.title ?? null;
    },

    async getArtifactById(id) {
      const rows = await query<{
        id: string;
        user_id: string;
        session_id: string | null;
        product_key: string;
        artifact_type: string;
        title: string | null;
        content_json: unknown;
        file_url: string | null;
        created_at: unknown;
      }>(
        `select id, user_id, session_id, product_key, artifact_type, title, content_json, file_url, created_at
           from artifacts where id = $1`,
        [id]
      );
      const row = rows[0];
      if (!row) return null;
      return ArtifactRecordSchema.parse({
        id: row.id,
        userId: row.user_id,
        sessionId: row.session_id,
        productKey: row.product_key,
        artifactType: row.artifact_type,
        title: row.title ?? "",
        contentJson: (row.content_json as Record<string, unknown> | null) ?? {},
        fileUrl: row.file_url ?? undefined,
        createdAt: toIso(row.created_at),
      });
    },

    // ----- agent runs -----
    async insertAgentRun(input: InsertAgentRunInput) {
      const rows = await query<{ id: string }>(
        `insert into agent_runs (user_id, session_id, product_key, chamber_key, agent_key, input, output, model)
         values ($1, $2, $3, $4, $5, $6::jsonb, $7::jsonb, $8) returning id`,
        [
          input.userId,
          input.sessionId,
          input.productKey,
          input.chamberKey,
          input.agentKey,
          JSON.stringify(input.input ?? null),
          JSON.stringify(input.output ?? null),
          input.model,
        ]
      );
      return { id: rows[0]!.id };
    },

    // ----- entitlements -----
    async upsertEntitlement(input: UpsertEntitlementInput) {
      const rows = await query<{ id: string }>(
        `insert into entitlements (user_id, key, source, stripe_ref)
         values ($1, $2, $3, $4)
         on conflict (user_id, key)
         do update set source = excluded.source, stripe_ref = excluded.stripe_ref, granted_at = now()
         returning id`,
        [input.userId, input.key, input.source, input.stripeRef ?? null]
      );
      return { id: rows[0]!.id };
    },

    async getEntitlements(userId) {
      const rows = await query<{ key: string; source: string; granted_at: unknown }>(
        `select key, source, granted_at from entitlements
          where user_id = $1 and revoked_at is null order by granted_at`,
        [userId]
      );
      return rows.map((row) => ({ key: row.key, source: row.source, grantedAt: toIso(row.granted_at) }));
    },
  };
}

let repo: CoreRepo | null = null;

/** Shared, lazily-initialized repo. Route handlers obtain it and pass it to core. */
export function getRepo(): CoreRepo {
  if (!repo) repo = createPgRepo();
  return repo;
}
