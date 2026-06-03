# architecture.md — HOLO platform

Canonical architecture for the `holo-platform` monorepo. Authoritative for every later build section. If this file and `01_Master_Blueprint.md` disagree, the Blueprint wins and this file gets updated.

Version: 1.0 · 2 June 2026 (post Brooks decision lock)

---

## What this platform is, in one paragraph

`holo-platform` is a monorepo whose first product is **SoulSeed Compass**, a thin "HOLOSCROLLY" front-end built on a reusable backend called **HOLO Core**. Core owns the database, memory, agents, orchestration, HURL minting, and artifacts. Future products are new thin shells plugged into the same Core. The first build's only job is to prove the whole nervous system runs end-to-end with mock data — *then* it gets beautiful.

---

## The platform-vs-product split (the heart of it)

| Concern | Lives in **HOLO Core** | Lives in **SoulSeed Compass** |
|---|---|---|
| Canonical user memory / identity graph | ✅ owns | reads/writes via API only |
| Agent harness (REZZIE / COACH) | ✅ owns | calls agent endpoint |
| Orchestration / chamber routing | ✅ owns | declares which agents/chambers it uses |
| Database (Supabase) | ✅ single source of truth | **no direct DB access, ever** |
| HURL minting | ✅ owns | displays the HURL |
| Entitlements (`astro-addon` etc.) | ✅ owns | reads via API to gate UI |
| Narrative, visuals, scroll, copy | — | ✅ the product's unique part |

The split is the foundation. Anything ambiguous belongs in Core unless it is visibly product-specific. When in doubt, Core.

---

## Core as routes for v1 (LOCKED — Brooks Q1)

For v1, **HOLO Core is Next.js API routes inside the monorepo**, with Supabase as the source of truth. There is no separate deployment on Day 1.

**Extraction trigger:** when Product #2 (HOLOBOOK) needs Core, the routes get lifted to a standalone service. This is reversible by design — see the thin-handler rule below.

### The thin-handler rule (non-negotiable)

Every API route handler does only four things:

```
parse  →  authorize  →  delegate to an importable core/ library function  →  return
```

All business logic lives in `core/` library functions. Route files contain zero domain logic. When we eventually point a new server at the same `core/` library, **the frontend doesn't change** — apps only ever call the SDK, and the SDK only ever calls `/api/...` (later, `https://core.holo.../...`). Enforce from S15 onward.

### Why this matters

Without the thin-handler rule, "extract Core" becomes a two-week refactor with frontend rewrites and contract drift. With it, extraction is "create a new Next/Express/Hono service, import `core/`, deploy, swap the SDK base URL." Zero frontend edits.

---

## Frontend never touches the database

The single most enforced rule. Every line of code in `apps/*` calls Core through `@holo/sdk`. No Supabase client in any app file. If a piece of data is missing from the SDK, the right move is to add a Core endpoint + SDK method, not bypass the boundary.

This rule:
- Prevents per-product memory silos.
- Lets us swap Supabase later without touching apps.
- Makes the eventual standalone Core extraction frictionless.
- Forces every data access to be a typed, versioned contract.

---

## Monorepo layout

```
holo-platform/
├── apps/
│   └── soulseed-compass/        ← the product (thin Next.js shell)
├── services/
│   └── holo-core-api/           ← Core (Next.js API routes for v1)
├── packages/
│   ├── contracts/               ← Zod schemas — the most important early package
│   ├── holo-sdk/                ← typed client every product calls
│   ├── hdom/                    ← holon runtime (immutable updates)
│   ├── product-manifests/       ← data-driven chamber flows
│   ├── agent-prompts/           ← REZZIE / COACH prompt copy
│   └── ui/                      ← shared visual components
├── infra/
│   └── supabase/                ← schema + migrations
├── docs/                        ← this folder
└── core/                        ← (created at S15) importable business logic;
                                    Core routes delegate to these functions
```

**Cowork** owns `docs/`, `packages/product-manifests/`, `packages/agent-prompts/`.
**Code** owns everything that compiles.

Path aliases (set in `tsconfig.base.json`): `@holo/contracts`, `@holo/hdom`, `@holo/sdk`, `@holo/product-manifests`, `@holo/agent-prompts`, `@holo/ui`.

---

## Stack (locked)

- **Frontend:** Next.js App Router · React · TypeScript strict · Tailwind · Framer Motion · Zustand (local UI state only).
- **Backend v1:** Next.js API routes · Supabase Postgres · Supabase Auth (anonymous-first) · Supabase Storage.
- **AI:** shared agent runner · model router abstraction (OpenAI/Anthropic swappable) · prompt registry · structured JSON outputs. Mock first, live second; env-driven switch.
- **Payment:** Stripe (single tier $27 + `astro-addon` add-on).
- **Tooling:** pnpm workspaces + Turborepo · ESLint · Prettier.
- **Deployment:** Vercel (frontend + API routes for v1) · Supabase (DB/auth/storage) · GitHub Actions (CI).

---

## Vocabulary translation table (Brooks → code)

This table is the canonical decoder. Build to the right column, never the left.

| Brooks's word | What it actually is in code |
|---|---|
| **HURL** | Permanent user/session identifier + the URL their evolving app lives at. `users` + `sessions` rows. Format: `hurl://soulseed/[chamber]/state-[n]/coherence-[nnn]` |
| **HOLOSCROLLY** | A product front-end built as a scrolling sequence of "chambers." SoulSeed Compass is the first. A Next.js app. |
| **HDOM (Holonic Document Object Model)** | A data model where every section ("chamber") is a node ("holon") carrying identity, state, history, trajectory, relationships, children. A TypeScript type + utilities. |
| **Holon** | One node in that tree. One chamber = one holon. |
| **Chamber** | One step/scene in the SoulSeed scroll. There are six. |
| **HOLO Core** | The shared backend: database, memory, agents, orchestration, HURL minting, artifacts. For v1, Next.js API routes + Supabase. |
| **REZZIE / ANG3L / COACH** | AI agents. For v1, only REZZIE (chambers 1–5) + COACH (chamber 6). |
| **Memory Lattice / Identity Graph** | The `memories` table in Supabase, scoped so any product can read/write a user's memory. |
| **Coherence / Emergence Pressure** | Numbers the agent emits describing the user's state. Stored on session state. Simple floats. |
| **Compiled-Vector** | Future primitive (trajectory, not position). Out of scope for v1. |
| **Artifact** | The output the user gets — the SoulSeed Snapshot. An `artifacts` row + a render. |
| **HOLOTORUS / COSMOI** | Visual language / aesthetic frame. Maps to theme, scroll, Framer Motion compositions in the UI. Not a backend concept. |
| **Astrology add-on (HOLOSTROLOGY)** | A paid entitlement (`astro-addon`) that unlocks a deeper trajectory layer. v1 ships the paywall + entitlement; the natal/ephemeris engine is v1.1. |

If a Brooks term has no mapping here, it's either an unbuilt-yet abstraction (park it) or pure aesthetic (route it to UI / copy, not architecture).

---

## What every later section gets from this doc

- The platform-vs-product table tells you where a new concern lives.
- The thin-handler rule + "frontend never touches DB" determine the *shape* of every API/route change.
- The vocab table is the single decoder ring — if a section spec uses a Brooks word, look here first.

---

## Parked for v2

- Standalone Core service deployment (still routes-in-monorepo in v1; lift at Product #2).
- Compiled-Vector primitive (trajectory math, agent_affinities, vector HURLs, time-travel/replay).
- Real natal/ephemeris astrology *engine* (HOLOSTROLOGY computation). The paid add-on paywall + entitlement is in v1; the engine itself is v1.1.
- Hume S2S voice (v1.1).
- ANG3L, HOLOBUCKY, and the full agent grid (v1 = REZZIE + COACH only).
- Neo4j / identity graph DB.
- pgvector semantic search.
- HOLOBOOK and any second product beyond the S29 manifest stub.
- Dashboards, multi-tenant permissioning beyond basic identity + entitlements.

---

## What Code does with this next

Read this file before S2 (contracts) and again before S15 (sessions endpoints). The vocab table seeds the schema names. The thin-handler rule shapes every API route from S15 forward. The platform-vs-product table is the tiebreaker for "where does this code go."
