# api-contracts.md — HOLO Core API

Every HOLO Core endpoint, with input/output shape in plain TS-ish pseudocode. The Zod schemas in `packages/contracts` are the runtime source of truth; this doc is the human reference both Cowork and Claude Code read before building.

Version: 1.0 · 2 June 2026

---

## Ground rules

1. **Frontend never calls these directly.** Apps call them only through `@holo/sdk`.
2. **Thin handlers, fat `core/` library.** Every route handler does: `parse → authorize → delegate to an importable core/<name>.ts function → return`. No business logic lives in route files. The eventual extraction of Core to a standalone service is "point a new server at the same `core/` library" — zero frontend edits.
3. **Zod first.** Every input and output is validated against a Zod schema in `@holo/contracts`. Inferred types are `z.infer<typeof Schema>`. Validation happens on input (route boundary) and output (before send) in dev; output validation may be gated behind a flag in prod.
4. **Anonymous-first.** Every endpoint accepts an anonymous `userId` (UUID minted at first entry) with `email = null` allowed. `merge_user(from, into)` re-points all rows when an anonymous user later logs in (see `memory-model.md`).
5. **Mock/live seam.** Endpoints that touch LLMs or Stripe have an env-driven mock/live switch. Mock by default in dev; never block the build on a live key.

### Status legend
- ✅ **live in v1** — real DB writes, real responses.
- 🟡 **mocked in v1** — endpoint exists, returns realistic structured stub. Live integration arrives later in the named sprint.
- 🅿️ **parked** — not built in v1 at all.

### Common types (defined in `@holo/contracts`)

```ts
type UUID = string;          // v4
type Email = string | null;  // nullable for anonymous-first
type ProductKey = "soulseed" | "holobook" /* future */;
type ChamberKey =
  | "threshold" | "identity-seed" | "present-state"
  | "memory-root" | "trajectory-branch" | "living-invitation";
type AgentKey = "rezzie" | "coach" | "ang3l" /* parked */;
type MemoryScope =
  | "profile" | "state" | "narrative" | "trajectory"
  | "event"   | "product" | "artifact";
type EntitlementKey = "astro-addon" /* future: "coach-pro", ... */;
type HurlPath = `hurl://${ProductKey}/${ChamberKey}/state-${number}/coherence-${number}`;
```

---

## Endpoint index

| Endpoint | Method | Status v1 | Sprint |
|---|---|---|---|
| `sessions/start` | POST | ✅ | S15 |
| `sessions/get` | GET | ✅ | S15 |
| `sessions/resume` | POST | ✅ | S15 (return-loop S25) |
| `events` (write) | POST | ✅ | S16 |
| `memory/upsert` | POST | ✅ | S16 |
| `memory/context` | POST | ✅ | S16 |
| `agents/run` | POST | 🟡 mocked, live in S20 | S20 |
| `orchestrations/next` | POST | ✅ | S17 |
| `hurl/mint` | POST | ✅ | S17 |
| `artifacts/create` | POST | ✅ | S23 |
| `products/manifest` | GET | ✅ | S4b |
| `entitlements/get` | GET | ✅ | S26b/S27 |
| `entitlements/grant` | POST (Stripe webhook) | 🟡 mocked, live in S27 | S27 |
| `users/merge` | POST | ✅ | S15 (function), S26b (wired) |

All routes live under `services/holo-core-api/app/api/...` for v1. Handlers delegate to `core/<name>.ts`.

---

## sessions/start — POST

Creates an anonymous user + session on first entry. Returns the IDs the frontend will use for every subsequent call.

**Status:** ✅ live in v1.

```ts
// REQUEST
{
  productKey: ProductKey,
  // optional client signals; nothing sensitive
  clientHint?: { tz?: string, locale?: string }
}

// RESPONSE
{
  userId: UUID,        // new if no cookie carried; reused if cookie present
  sessionId: UUID,
  productKey: ProductKey,
  isReturning: boolean,
  state: SessionState  // see below
}

type SessionState = {
  currentChamber: ChamberKey,        // "threshold" on first entry
  coherence: number,                 // float, simple in v1
  emergencePressure: number,         // float
  chambersVisited: ChamberKey[],
  custom: Record<string, unknown>    // JSONB freeform
}
```

Handler delegates to `core/sessions.start({ productKey, clientHint })`.

---

## sessions/get — GET

Fetches current session state for a known `userId` + `sessionId`. Used for hydration on page load and for `useChamberProgression`.

**Status:** ✅ live in v1.

```ts
// REQUEST (query params)
{ userId: UUID, sessionId: UUID }

// RESPONSE
{
  userId: UUID,
  sessionId: UUID,
  productKey: ProductKey,
  state: SessionState,
  hurl?: HurlPath        // present if minted
}
```

Handler delegates to `core/sessions.get({ userId, sessionId })`.

---

## sessions/resume — POST

Resumes a prior session for the return-visit "What changed?" loop (S25). Loads the user's prior memory context and prepares the resume payload REZZIE will use to greet them.

**Status:** ✅ live in v1.

```ts
// REQUEST
{ userId: UUID }       // sessionId optional; if absent, last session is restored

// RESPONSE
{
  userId: UUID,
  sessionId: UUID,             // existing or new "return" session
  productKey: ProductKey,
  state: SessionState,
  resumeContext: {
    lastChamber: ChamberKey,
    lastSnapshotSummary: string,
    keyMemories: MemoryRecord[]   // top-N by importance
  }
}
```

Handler delegates to `core/sessions.resume({ userId, sessionId })`. The `resumeContext` is what S25 feeds REZZIE so it can say *"Last time you were between worlds. What changed?"* — not "welcome back."

---

## events — POST

Records a single user/system event. Every meaningful interaction writes one. Cheap and additive — never updated, never deleted.

**Status:** ✅ live in v1.

```ts
// REQUEST = EventRecord
{
  userId: UUID,
  sessionId: UUID,
  productKey: ProductKey,
  chamberKey: ChamberKey,
  eventType: string,            // e.g. "chamber.entered", "intake.captured", "choice.selected"
  payload: Record<string, unknown>
}

// RESPONSE
{ eventId: UUID, createdAt: string /* ISO */ }
```

Handler delegates to `core/events.write(...)`.

---

## memory/upsert — POST

Writes or updates a memory. The agent's `memoryWrites[]` in its structured response flows through here.

**Status:** ✅ live in v1.

```ts
// REQUEST = MemoryRecord
{
  userId: UUID,
  sessionId: UUID,
  sourceProduct: ProductKey,   // who wrote this memory
  scope: MemoryScope,
  content: string,             // human-readable summary
  contentJson?: Record<string, unknown>,
  importance: number           // 0..1
}

// RESPONSE
{ memoryId: UUID, scope: MemoryScope }
```

Handler delegates to `core/memory.upsert(...)`. See `memory-model.md` for scope semantics + the "one memory, many doors" rule.

---

## memory/context — POST

Reads memory for an agent or a UI surface. The agent runner calls this *before* calling the LLM so the prompt includes prior context.

**Status:** ✅ live in v1.

```ts
// REQUEST
{
  userId: UUID,
  productKey: ProductKey,        // requesting product (for permission/scoping)
  scopes?: MemoryScope[],        // default = all
  limit?: number,                // default 25
  minImportance?: number         // 0..1
}

// RESPONSE
{
  memories: MemoryRecord[],      // sorted by importance desc, then recency
  asOf: string                   // ISO
}
```

Handler delegates to `core/memory.context(...)`.

---

## agents/run — POST

Runs an agent (REZZIE or COACH in v1) and returns a **structured** response. The app does not parse freeform text — the schema is the contract.

**Status:** 🟡 mocked in v1 until S20. Mock returns a realistic `SoulSeedAgentOutput`; live switch is env-driven (`AGENT_MODE=mock|live`).

```ts
// REQUEST = AgentRunRequest
{
  userId: UUID,
  sessionId: UUID,
  productKey: ProductKey,
  chamberKey: ChamberKey,
  agentKey: AgentKey,             // "rezzie" or "coach" in v1
  input: {
    message?: string,             // free-text user input
    formData?: Record<string, unknown>  // e.g. Between-Place choice
  },
  context?: {
    // injected by core; clients may pass overrides for testing
    memorySnapshot?: MemoryRecord[]
  }
}

// RESPONSE = AgentRunResponse / SoulSeedAgentOutput
{
  message: string,                       // what REZZIE says back
  insight: string,                       // 1-line crystallization stored as memory
  detectedThemes: string[],              // tags
  coherenceDelta: number,                // small float; applied to session.state
  memoryWrites: Array<{
    scope: MemoryScope,
    content: string,
    contentJson?: Record<string, unknown>,
    importance: number
  }>,
  statePatch: Partial<SessionState>,     // applied to session.state
  suggestedNextQuestion?: string,
  suggestedNextChamber?: ChamberKey      // orchestration may override
}
```

Handler delegates to `core/agents.run(...)` which:
1. Calls `core/memory.context` to assemble the prompt.
2. Calls the model router (mock or live).
3. Validates the LLM JSON against `SoulSeedAgentOutputSchema`.
4. Returns the validated object. Persistence of `memoryWrites` / `statePatch` happens via the orchestration step, not here.

---

## orchestrations/next — POST

Advances the session: applies the agent's `statePatch`, persists `memoryWrites`, decides the next chamber from the manifest, and updates `sessions.state`.

**Status:** ✅ live in v1.

```ts
// REQUEST
{
  userId: UUID,
  sessionId: UUID,
  productKey: ProductKey,
  agentOutput: SoulSeedAgentOutput     // result from agents/run
}

// RESPONSE
{
  sessionId: UUID,
  state: SessionState,         // updated
  nextChamber: ChamberKey | null,   // null = at terminal chamber
  hurl?: HurlPath              // re-minted if coherence/state advanced
}
```

Handler delegates to `core/orchestration.next(...)`. The chamber decision uses `@holo/hdom`'s `getNextChamber(manifest, currentKey)` plus any `suggestedNextChamber` override. Never hardcoded.

---

## hurl/mint — POST

Mints (or re-mints) the HURL string for a session at its current state. Pure derivation — no LLM, no randomness.

**Status:** ✅ live in v1.

```ts
// REQUEST
{ sessionId: UUID }

// RESPONSE
{
  hurl: HurlPath,
  // e.g. "hurl://soulseed/identity-seed/state-37/coherence-082"
}
```

Handler delegates to `core/hurl.mint({ sessionId })`. Persisted in the `hurls` table; returned to the app for display.

---

## artifacts/create — POST

Generates and stores the SoulSeed Snapshot at chamber 6 (Living Invitation). Idempotent per session — re-generation overwrites the prior row.

**Status:** ✅ live in v1.

```ts
// REQUEST
{
  userId: UUID,
  sessionId: UUID,
  productKey: ProductKey,
  artifactType: "soulseed-snapshot",
  title?: string,                // default: derived
  contentJson: {
    identitySignal: string,
    presentState: string,
    returningPattern: string,
    emergingTrajectory: string,
    firstInvitation: string,
    hurl: HurlPath
  }
}

// RESPONSE
{
  artifactId: UUID,
  fileUrl?: string,              // Supabase Storage URL for the rendered version
  contentJson: { /* echoed */ }
}
```

Handler delegates to `core/artifacts.create(...)`.

---

## products/manifest — GET

Returns the typed `ProductManifest` for a product. Apps load this once on boot; orchestration loads it server-side.

**Status:** ✅ live in v1 (manifest sourced from `@holo/product-manifests`).

```ts
// REQUEST (query)
{ productKey: ProductKey }

// RESPONSE = ProductManifest
{
  productKey: ProductKey,
  version: string,
  rootHolon: Holon,
  chambers: Array<{
    key: ChamberKey,
    title: string,
    agentKey: AgentKey,
    memoryReadScopes: MemoryScope[],
    memoryWriteScopes: MemoryScope[],
    next: ChamberKey | null,
    // copy slots (data, not code)
    prompts: {
      intro: string,
      questions: string[]
    },
    entitlementsRequired?: EntitlementKey[]   // e.g. ["astro-addon"] for deeper trajectory layer
  }>
}
```

Handler delegates to `core/products.manifest({ productKey })`.

---

## entitlements/get — GET

Lists what a user has paid to unlock. The trajectory chamber (S24) checks this to decide whether to show the deeper astro layer; the SDK exposes it to UI gates.

**Status:** ✅ live in v1.

```ts
// REQUEST (query)
{ userId: UUID }

// RESPONSE
{
  userId: UUID,
  entitlements: Array<{
    key: EntitlementKey,
    grantedAt: string,
    source: "stripe" | "manual" | "promo"
  }>
}
```

Handler delegates to `core/entitlements.get({ userId })`.

---

## entitlements/grant — POST (Stripe webhook)

Called by Stripe's webhook on successful checkout of the `$27` base or the `astro-addon`. Verifies the webhook signature, writes a row to `entitlements`, and optionally writes a `purchase` event.

**Status:** 🟡 mocked in v1 until S27. The mock variant accepts an admin-only POST that grants any entitlement to any user for testing.

```ts
// REQUEST (Stripe-signed payload)
{
  stripeEventId: string,
  userId: UUID,                   // mapped from Stripe customer metadata
  entitlementKey: EntitlementKey, // "astro-addon" etc.
  source: "stripe"
}

// RESPONSE
{ ok: true, entitlementId: UUID }
```

Handler delegates to `core/entitlements.grant(...)`. The base $27 purchase grants the product itself (no entitlement key) and unlocks email-capture / export. The `astro-addon` purchase grants `entitlementKey: "astro-addon"`.

---

## users/merge — POST

Re-points all sessions, events, memories, hurls, artifacts, and entitlements from an anonymous `from_user_id` onto a canonical `into_user_id`. Called when an anonymous user later signs in on another device.

**Status:** ✅ live in v1 (the Postgres `merge_user()` function is defined in S14; the API endpoint is wired in S26b).

```ts
// REQUEST
{ from: UUID, into: UUID }

// RESPONSE
{ ok: true, mergedRows: { sessions: number, events: number, memories: number, hurls: number, artifacts: number, entitlements: number } }
```

Handler delegates to `core/users.merge({ from, into })`, which calls the Postgres function `merge_user(from, into)` in a single transaction. See `memory-model.md`.

---

## How the app actually uses these (the walking-skeleton chain)

```
1. POST sessions/start              → userId, sessionId, state(currentChamber=threshold)
2. GET  products/manifest           → cached on boot
3. POST events                      → "chamber.entered" threshold
4. POST agents/run                  → SoulSeedAgentOutput (mock in v1)
5. POST memory/upsert (each write)
6. POST orchestrations/next         → state, nextChamber
7. POST hurl/mint                   → HurlPath
8. (chamber 6) POST artifacts/create → SoulSeed Snapshot
9. POST entitlements/get (S24)      → gate deeper astro layer
10. (return visit) POST sessions/resume → resumeContext for "What changed?"
```

If step 1, 4, 6, 7, 8, and 10 all work with mock data and ugly UI, the foundation is proven.

---

## Parked for v2

- `agents/run` with multiple agents in parallel (ANG3L, HOLOBUCKY grid).
- Streaming responses for `agents/run` (SSE / chunked).
- Cross-user memory queries / shared memory (only same-user reads in v1).
- Vector / semantic search endpoints (no pgvector in v1).
- Real natal/ephemeris compute endpoints (`astro/compute`) — the engine for the `astro-addon` lands in v1.1.
- Voice endpoints (Hume STT/TTS) — v1.1.
- Permission/ACL endpoints beyond entitlements.
- Admin/dashboard endpoints.

---

## What Code does with this next

Wire these contracts as Zod schemas in `packages/contracts` (S2), build `@holo/sdk` methods matching 1:1 (S18), and stand up the Core route files as thin handlers delegating to `core/<name>.ts` from S15 onward. When in doubt about a shape, this file is the human spec; the Zod schema is the runtime truth.
