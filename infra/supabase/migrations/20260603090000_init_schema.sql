-- ===========================================================================
-- HOLO Core — v1 schema (S14)
-- Nine tables, anonymous-first. The frontend never touches these; only HOLO
-- Core API does, via thin handlers over the core/ library.
--
-- Idempotent: re-runnable in order (IF NOT EXISTS / ON CONFLICT throughout).
-- v1 minimal: NO pgvector, NO graph DB, NO RLS beyond defaults.
-- ===========================================================================

-- gen_random_uuid(): native in PG13+; pgcrypto provides it on older/contrib too.
create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------------
-- users — exists from first entry with email = NULL (anonymous-first).
-- Email/display_name are set later at the export chamber. No row migration
-- needed there, because the user_id everywhere is already correct.
-- ---------------------------------------------------------------------------
create table if not exists users (
  id            uuid primary key default gen_random_uuid(),
  email         text,                       -- NULL = anonymous
  display_name  text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- sessions — one live run of a product for a user. state is the JSONB live
-- chamber/coherence blob.
-- ---------------------------------------------------------------------------
create table if not exists sessions (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid not null references users(id) on delete cascade,
  product_key      text not null,
  current_chamber  text,
  state            jsonb not null default '{}'::jsonb,
  created_at       timestamptz not null default now(),
  updated_at       timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- events — every meaningful interaction. Cheap, additive, never updated.
-- ---------------------------------------------------------------------------
create table if not exists events (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  session_id   uuid references sessions(id) on delete set null,
  product_key  text not null,
  chamber_key  text,
  event_type   text not null,
  payload      jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- memories — the shared lattice. Scoped by source_product + scope.
-- importance is the single ranking signal in v1 (0.00–1.00). No embedding
-- column in v1 (pgvector is parked).
-- ---------------------------------------------------------------------------
create table if not exists memories (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  session_id      uuid references sessions(id) on delete set null,
  source_product  text not null,
  scope           text not null,
  content         text not null,
  content_json    jsonb,
  importance      numeric(3,2) not null default 0.5
                    check (importance >= 0 and importance <= 1),
  created_at      timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- hurls — minted permanent coordinates, e.g.
-- hurl://soulseed/identity-seed/state-37/coherence-082
-- ---------------------------------------------------------------------------
create table if not exists hurls (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  session_id   uuid references sessions(id) on delete set null,
  product_key  text not null,
  path         text not null,
  chamber      text,
  state_hash   text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- artifacts — generated outputs (the SoulSeed Snapshot).
-- ---------------------------------------------------------------------------
create table if not exists artifacts (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references users(id) on delete cascade,
  session_id    uuid references sessions(id) on delete set null,
  product_key   text not null,
  artifact_type text not null,
  title         text,
  content_json  jsonb not null default '{}'::jsonb,
  file_url      text,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- agent_runs — a log of agent invocations. Global/shared: NOT re-pointed by
-- merge_user, so user_id is set-null on user delete rather than blocking it.
-- ---------------------------------------------------------------------------
create table if not exists agent_runs (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references users(id) on delete set null,
  session_id   uuid references sessions(id) on delete set null,
  product_key  text not null,
  chamber_key  text,
  agent_key    text not null,
  input        jsonb,
  output       jsonb,
  model        text,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- products — one row per product. manifest is metadata; the authoritative
-- manifest lives in @holo/product-manifests.
-- ---------------------------------------------------------------------------
create table if not exists products (
  product_key  text primary key,
  name         text not null,
  version      text not null,
  manifest     jsonb not null default '{}'::jsonb,
  created_at   timestamptz not null default now()
);

-- ---------------------------------------------------------------------------
-- entitlements — what a user has paid to unlock (e.g. 'astro-addon').
-- One row per (user, key). Survives merge_user (re-pointed in the same txn).
-- ---------------------------------------------------------------------------
create table if not exists entitlements (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references users(id) on delete cascade,
  key         text not null,
  source      text not null,
  granted_at  timestamptz not null default now(),
  unique (user_id, key)
);

-- ---------------------------------------------------------------------------
-- Indexes (minimal). Memory reads are by (user, scope) and (user, importance).
-- ---------------------------------------------------------------------------
create index if not exists sessions_user_idx            on sessions (user_id);
create index if not exists events_user_idx              on events (user_id);
create index if not exists events_session_idx           on events (session_id);
create index if not exists memories_user_scope_idx      on memories (user_id, scope);
create index if not exists memories_user_importance_idx on memories (user_id, importance desc, created_at desc);
create index if not exists hurls_user_idx               on hurls (user_id);
create index if not exists artifacts_user_idx           on artifacts (user_id);
create index if not exists agent_runs_user_idx          on agent_runs (user_id);
create index if not exists entitlements_user_idx        on entitlements (user_id);
