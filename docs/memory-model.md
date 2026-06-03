# memory-model.md — HOLO Core memory

The single design that makes "one brain, many doors" real. Authoritative for S14 (schema), S16 (memory endpoints), and the `merge_user()` / entitlements design.

Version: 1.0 · 2 June 2026

---

## The thesis in one paragraph

A user's memory does **not** belong to a product. It belongs to the user, and Core owns it. Every product (SoulSeed Compass, HOLOBOOK, future) reads from and writes to the same `memories` table through Core endpoints, scoped by `sourceProduct` + `scope`. When a future product opens the same user's HURL, it inherits everything REZZIE learned in SoulSeed without re-asking. This is the moat — and the reason the frontend never touches the database.

---

## The `memories` table

```sql
create table memories (
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references users(id) on delete cascade,
  session_id      uuid references sessions(id) on delete set null,
  source_product  text not null,           -- which product wrote it
  scope           text not null,           -- one of the seven scopes (see below)
  content         text not null,           -- human-readable, 1-3 sentences
  content_json    jsonb,                   -- optional structured payload
  importance      numeric(3,2) not null,   -- 0.00–1.00
  embedding       vector,                  -- NULL in v1 (pgvector parked)
  created_at      timestamptz not null default now(),
  updated_at      timestamptz not null default now()
);

create index memories_user_scope_idx       on memories (user_id, scope);
create index memories_user_importance_idx  on memories (user_id, importance desc, created_at desc);
create index memories_source_product_idx   on memories (source_product);
```

Notes:
- `session_id` is `NULL`-able because some memories outlive the session that produced them (profile facts, narrative arcs).
- `embedding` column is declared but stays `NULL` in v1; pgvector is parked. Keeping the column means we don't run a migration when we turn it on.
- `content` is for prompts and UI; `content_json` is for code that needs structure.

---

## The seven scopes

Every memory is filed under exactly one scope. This is what makes prompts coherent and what lets future products read selectively.

| Scope | What it is | Examples | Typical write-path |
|---|---|---|---|
| **profile** | Durable facts about who the user *is*. | name, pronouns, location-band, age-band, work-band | name capture in `threshold`; later product onboardings |
| **state** | The user's current moment. Slow-changing but not durable. | "currently between jobs", "starting a startup", "grieving" | `present-state` chamber; agent insights |
| **narrative** | Stories the user tells about themselves. | "the recovering perfectionist", "the late-bloomer founder" | `identity-seed`, `memory-root` |
| **trajectory** | Where the user is moving / wants to move. | "leaving consulting for music", "moving to Lisbon in fall" | `trajectory-branch`; coach reflections |
| **event** | Discrete things that happened. Lower-importance, denser. | "chose 'I'm becoming someone'", "exported snapshot 2 Jun" | event-stream summarizations |
| **product** | Product-specific state another product shouldn't necessarily inherit. | "completed SoulSeed run #3", "skipped trajectory" | orchestration |
| **artifact** | Pointers to outputs the user has generated. | "SoulSeed Snapshot v3 at /artifacts/abc" | `artifacts/create` |

Scope choice is part of the agent's structured output (`memoryWrites[].scope`). Wrong scope = noise.

---

## "One memory, many doors"

Any product can call `memory/context` on any user it's authorized to read. The query is scoped by `userId` + caller `productKey` + requested `scopes[]`. In v1, all of a user's memories are readable by every product the user has interacted with — there is no cross-user sharing, no public memory, no team memory.

When HOLOBOOK arrives (Product #2):
- It calls `memory/context` with `productKey: "holobook", scopes: ["profile", "narrative", "trajectory"]`.
- It gets the durable shape of the user that SoulSeed already established.
- It writes its own memories with `sourceProduct: "holobook"`.
- It doesn't see SoulSeed's `product`-scoped rows unless it asks for them.

This is the moat: every new product gets a richer starting state than the last.

### Default scope filters per call

- **Agent prompt assembly** (`agents/run` → `memory/context`): `[profile, state, narrative, trajectory]`, top-N by importance, recency tiebreak.
- **Return-loop hydration** (`sessions/resume`): `[profile, narrative, trajectory, artifact]`, top-N=10.
- **Product onboarding** (a new product first call): `[profile, narrative, trajectory]`, importance ≥ 0.5.
- **Per-product dashboard** (future): `[product, artifact]` filtered by `sourceProduct`.

---

## What writes memory, and when

Memory writes are not free. The agent does not stream every utterance into the lattice. The discipline:

- Every meaningful interaction writes an **event**. Events are cheap, additive, never updated.
- Every meaningful **insight** is eligible to become a memory. The agent decides (in its structured `memoryWrites[]`) which insights are worth promoting and at what `importance`.
- Memory writes are upserts — same `userId + sourceProduct + scope + contentJson.key` → update. The `core/memory.upsert` function handles dedupe.

Rule of thumb: events are the log; memories are the lessons.

---

## Importance (the only ranking signal in v1)

`importance` is a single float `0.00–1.00`. In v1 we use one number, not multiple weights, because we don't yet have enough data to tune more.

Suggested bands (the agent's prompt should encode these):

- `0.90–1.00` — identity-defining facts ("starting a startup after leaving consulting"). Rare.
- `0.70–0.89` — durable narrative arcs ("the recovering perfectionist"). A handful per user.
- `0.40–0.69` — state and trajectory facts that age. Many.
- `0.10–0.39` — soft signals, low-confidence reads.
- `0.00–0.09` — noise; usually shouldn't be written.

When `memory/context` returns results, it sorts by `importance DESC, updated_at DESC`. No semantic search in v1.

---

## Anonymous-first + `merge_user()`

The full story of how identity stays clean when a user starts anonymous and later logs in.

### State at first entry

- A new row is inserted into `users` with `email = NULL`, `id = <new UUID>`.
- A `sessions` row is created against that user.
- A HURL is minted, e.g. `hurl://soulseed/threshold/state-1/coherence-010`.
- All subsequent memories/events/artifacts attach to that anonymous user.

### State at export (chamber 6)

- The user provides an email at the Living Invitation chamber.
- The frontend calls `core/users.setEmail({ userId, email })` (covered by SDK; thin handler over `core/users`).
- The existing `users` row is updated: `email = <provided>`, `email_captured_at = now()`. No migration of rows, because the `user_id` everywhere is already correct.

### State at later login from another device

- The user opens the product on a new device and signs in (Supabase Auth, magic link or social).
- Supabase creates (or finds) a canonical `users.id` for that email.
- If the email matches an existing anonymous row's email: nothing to merge.
- If the email matches but the **session was started anonymously on this new device**: we have *two* `users` rows for the same person — the anonymous one created today (`from`), and the canonical one Supabase Auth returned (`into`). We must merge.
- The SDK calls `users/merge` → `core/users.merge({ from, into })` → the Postgres function `merge_user(from, into)`.

### The `merge_user(from, into)` Postgres function

A single transaction that re-points every dependent row and deletes the source.

```sql
create or replace function merge_user(from_id uuid, into_id uuid)
returns json
language plpgsql
as $$
declare
  merged_sessions     int;
  merged_events       int;
  merged_memories     int;
  merged_hurls        int;
  merged_artifacts    int;
  merged_entitlements int;
begin
  if from_id = into_id then
    return json_build_object('ok', true, 'note', 'noop');
  end if;

  update sessions     set user_id = into_id where user_id = from_id;
  get diagnostics merged_sessions = row_count;

  update events       set user_id = into_id where user_id = from_id;
  get diagnostics merged_events = row_count;

  update memories     set user_id = into_id where user_id = from_id;
  get diagnostics merged_memories = row_count;

  update hurls        set user_id = into_id where user_id = from_id;
  get diagnostics merged_hurls = row_count;

  update artifacts    set user_id = into_id where user_id = from_id;
  get diagnostics merged_artifacts = row_count;

  update entitlements set user_id = into_id where user_id = from_id;
  get diagnostics merged_entitlements = row_count;

  -- agent_runs and products are global / shared; nothing to merge there.

  delete from users where id = from_id;

  return json_build_object(
    'ok', true,
    'merged', json_build_object(
      'sessions', merged_sessions,
      'events', merged_events,
      'memories', merged_memories,
      'hurls', merged_hurls,
      'artifacts', merged_artifacts,
      'entitlements', merged_entitlements
    )
  );
end;
$$;
```

### Why we build this on Day 1 even though it's "later"

Anonymous-first is cheap; merging is the part that bites at month three. Designing the table relationships now (every dependent table has a `user_id` foreign key with `on delete cascade`) means `merge_user` is a 30-line function instead of a refactor. Defined in S14, wired through the SDK in S26b.

### Edge cases (documented but punted)

- **Conflicting profile facts** (anon says "based in Lisbon", canonical user has "based in Berlin"): in v1 we keep the canonical's value where both exist, and append the anon's value to a `merge_conflicts` JSON field on the canonical user. Manual review later. UI doesn't surface this in v1.
- **Two anonymous users on the same device who both later log in**: device-local cookie identifies one anon user; the other is unreachable. Acceptable in v1.
- **Merging the wrong direction** (a canonical user accidentally merged into an anon): the function is symmetric in code, but the SDK enforces `from = anonymous, into = canonical`. Anon = `email IS NULL`.

---

## Entitlements

Entitlements record what a user has paid to unlock. They live in their own table because they're not memories (they're facts about the relationship with the product) and not events (they're queryable state, not log).

```sql
create table entitlements (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references users(id) on delete cascade,
  key          text not null,             -- e.g. "astro-addon"
  source       text not null,             -- "stripe" | "manual" | "promo"
  stripe_ref   text,                      -- charge or subscription id
  granted_at   timestamptz not null default now(),
  revoked_at   timestamptz,               -- soft-revoke; NULL = active
  unique (user_id, key)                   -- one row per user per entitlement key
);

create index entitlements_user_idx on entitlements (user_id);
```

### Keys defined in v1

- **(no entitlement)** — the base $27 SoulSeed purchase. Unlocks email capture flow, export, and full Snapshot. (Open Q2b: free beta first vs. live $27 at launch.)
- **`astro-addon`** — unlocks the deeper trajectory layer in the `trajectory-branch` chamber. **In v1, owning this entitlement changes UI copy and unlocks a placeholder "deeper layer" panel — the real natal/ephemeris engine arrives v1.1.**

### How entitlements are checked

- The SDK exposes `sdk.entitlements.get(userId): Entitlement[]`.
- The `products/manifest` response declares `entitlementsRequired?: EntitlementKey[]` per chamber slot.
- The orchestration step and UI gate read both and decide whether to render the gated slot or the paywall CTA.

### Entitlements survive `merge_user`

Because `entitlements.user_id` is re-pointed in the same transaction. A user who buys the add-on anonymously and later logs in keeps the add-on.

---

## What the agent sees vs. what the user sees

A common confusion worth pinning down:

- The **user** sees REZZIE's `message`, the SoulSeed Snapshot at chamber 6, and their HURL.
- The **agent** (in its prompt) sees a memory snapshot built by `core/memory.context`: top-N memories by importance + recency, filtered by scope. Plus the manifest's per-chamber prompt copy. Plus the user's current input.
- The **database** sees `memoryWrites[]` from the agent's structured output, which `core/orchestration.next` persists.

Identity outputs (the Snapshot's "identitySignal", "emergingTrajectory", etc.) must be **reproducible** from the stored memories. If the LLM is the sole source of an identity claim, that claim is a hallucination by design. Build the Snapshot rendering as `derive_from_memories(userId)`, not "ask the LLM to remember."

---

## Parked for v2

- **pgvector semantic search.** Column is declared in v1; queries are by `scope + importance` only.
- **Compiled-Vector trajectory math** — memories with directional derivatives, replay/time-travel. Post-1000-vectors.
- **Cross-user memory** (relationships between users, shared memory, team contexts).
- **Memory provenance graph** — which memory derived from which event/conversation, full lineage.
- **Memory decay** — older `state`-scope rows automatically demoted in importance over time.
- **Neo4j / identity graph DB** — only if pgvector + Postgres prove insufficient at scale.
- **Multiple importance dimensions** (confidence, recency-weight, source-trust) — v1 uses one number.
- **Manual memory editing UI** for the user — out of scope for v1.

---

## What Code does with this next

S14 implements this schema + the `merge_user()` Postgres function exactly as specified. S16 builds the `memory/upsert` + `memory/context` endpoints with the scope filters above. S20 wires `core/memory.context` into the agent runner's prompt assembly. S26b wires the SDK call to `users/merge` from the login flow. S27 writes the `entitlements` rows from the Stripe webhook. When a question arises about scopes or importance, this file is authoritative.
