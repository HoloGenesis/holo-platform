# PRD-HOLOSCROLLY v0.3 — BUILD SPEC (Execution Addendum)

*The hands. v0.1 = Product Vision Seed · v0.2 = Canonical PRD (`PRD-HOLOSCROLLY-v0.2.md`) · v0.3 = this Claude Code / HOLOCURSOR build spec. Do not re-litigate vision here; this document converts v0.2 into files, contracts, tests, and acceptance criteria. **2026-06-10 · Hermes-Daedalus, ratified by Brooks Cole.**

> **CRITICAL CONTEXT (saved by Hiren+Cowork, 10 Jun PM; Q-U RESOLVED 11 Jun PM by Brooks):** This document arrived as the *canonical HOLOSCROLLY architecture* — the meta-spec for any HOLOSCROLLY instance. Brooks's framing: *"This is the latest PRD for the HOLOSCROLLY of which the SoulSeed Compass is the first example."* The PRD references a codebase with `packages/@holo/hdom`, `packages/@holo/sacred-geometry`, `packages/@holo/consciousness`, `holoscrolly-kit/moves/move-set.json`, `HOLOSCROLLS/example-*.html`, `LANES.md`, and `dev-brooks` branch — **none of which exist in our `holo-platform` codebase**.
>
> **Q-U RULING (Brooks, 11 Jun PM):** *"Treat PRD v0.3 as the canonical pattern/specification layer, not a literal file-path migration mandate. Apply the principles, product logic, UX sequence, Dawn Glass design system, SoulSeed-as-first-HOLOSCROLLY framing, and agent behavior contracts inside the existing holo-platform architecture. Do not refactor the repo toward the PRD's speculative package/file layout right now. Use existing analogous paths and modules in holo-platform. A repo-wide refactor toward that layout would be a separate multi-week architecture sprint, not part of the current SoulSeed / HOLOSCROLLY implementation pass."*
>
> **Canonical principle:** *"Implement the canon in the repo we have. Do not migrate to the repo we imagine until that becomes its own architecture sprint."*
>
> All path references below are conceptual / future-aligned. Apply via existing modules (HURL in `packages/contracts/`, Holon in `packages/hdom/`, cohering + return loop in `services/holo-core-api/`, etc.).

**Lane:** 2 (Brooks-REZZIE-Sensei-7Fold-Evolved) per `LANES.md`. Branch: `dev-brooks`. Forbidden paths apply.

---

## 1. Rulings (locked, do not reopen)

| # | Ruling | Source |
|---|---|---|
| R1 | **HURL grammar is a versioned protocol.** v0.1 = current code grammar (`#coherence-nnn`). v0.2 = resonance-hash grammar (`@resonance-hash`). All parsers backward-compatible. No existing HURL may ever be invalidated. Canonical text in v0.2 PRD FR-2.3. | Brooks, 2026-06-10 |
| R2 | **Anonymous-first identity.** The scroll appears before the account. "Claim this scroll" only after first identity artifact. Optional magic link. Export seed always. No forced registration. | Brooks via eval adoption |
| R3 | **HOLOBAGUA: internal numeric, external qualitative.** Store `"mental": 0.91`; show "Mental: Brilliant / Overextended." No visible low-score shame loops. | Brooks via eval adoption |
| R4 | **Execution order: P0 static inevitability → P1 engine hardening → P2 return loop → P3 Pattern Intelligence.** Do not build Pattern Intelligence until the static scroll feels real. | v0.2 §10, eval confirmed |

---

## 2. HURL Versioned Grammar — Implementation Contract

**Modify:** `packages/@holo/hdom/src/hurl.ts` · **Create:** `packages/@holo/hdom/src/hurl.test.ts`

```ts
export type HurlGrammarVersion = 'v0.1' | 'v0.2';

export interface Hurl {
  // existing fields unchanged (realm, path, seed, version, chamber, resonance)
  readonly grammar: HurlGrammarVersion;        // NEW — provenance, default 'v0.1'
  readonly resonanceHash?: string;             // NEW — v0.2 only, field signature hash
}

// Parser: detect version → parse accordingly → normalize to canonical Hurl
//   #coherence-nnn  → grammar 'v0.1'
//   @<base36hash>   → grammar 'v0.2'
export function parseHurl(raw: string): Hurl;          // throws on invalid (unchanged behavior)
export function tryParseHurl(raw: string): Hurl | null;

// Serializer: explicit version, default preserves provenance
export function serializeHurl(hurl: Hurl, opts?: { version?: HurlGrammarVersion }): string;

// Migration: NEVER mutate the original. Store both.
export function upgradeHurl(v01: Hurl): Hurl;          // returns v0.2 twin; computes resonanceHash via resonanceHashEmbed
```

**Constraints:** `deriveSeed`, `mintHurl`, `evolveHurl`, `hurlCoordinate` signatures unchanged (additive only). Realm enum stays 4-value in v0.1; v0.2 may extend (e.g. `holopedia`) behind the version gate. Round-trip law: `parseHurl(serializeHurl(h)) ≡ h` for both grammars.

---

## 3. File Plan

### P1 — Engine hardening (create)

```
packages/@holo/hdom/vitest.config.ts
packages/@holo/hdom/src/hurl.test.ts
packages/@holo/hdom/src/lattice.test.ts
packages/@holo/hdom/src/holon.test.ts
packages/@holo/hdom/src/coherence.test.ts
packages/@holo/hdom/src/holoscrolly.test.ts
packages/@holo/hdom/CHANGELOG.md            ← start at 0.1.0, document grammar versioning as 0.2.0
```

Modify: `packages/@holo/hdom/package.json` (add `"test": "vitest run"`, devDep vitest).

### P2 — Return loop app shell (create)

```
apps/soulseed-compass/                       ← Next.js App Router, TS strict
├── package.json                             ← deps: @holo/hdom, @holo/sacred-geometry,
│                                              @holo/consciousness, framer-motion, gsap, zustand
├── app/
│   ├── page.tsx                             ← / Threshold landing
│   ├── intake/page.tsx                      ← /intake SoulSeed intake
│   ├── generating/page.tsx                  ← /generating HURL minting state
│   └── h/[...hurl]/
│       ├── page.tsx                         ← /h/... the HOLOSCROLLY
│       ├── return/page.tsx                  ← /h/.../return Return Event
│       └── share/page.tsx                   ← /h/.../share export & sovereignty
├── components/                              ← see §5 inventory
├── lib/
│   ├── store.ts                             ← Zustand: fieldCoherence (0–100) — the ONE global
│   ├── memory.ts                            ← reducer + localStorage (append-only event log)
│   └── routeHurl.ts                         ← web route ↔ HURL codec (see §4.2)
└── styles/                                  ← consume holodesign-kit tokens; never restate
```

### P3 — Pattern Intelligence (create)

```
packages/@holo/hdom/src/patternIntelligence.ts
packages/@holo/hdom/src/patternIntelligence.test.ts
packages/@holo/hdom/src/types/patternIntelligence.ts
apps/soulseed-compass/components/PatternPanel.tsx
```

---

## 4. API Contracts

### 4.1 Pattern Intelligence (P3)

```ts
// types/patternIntelligence.ts
export interface MemoryEcho   { readonly text: string; readonly similarity: number; readonly eventId: string; }
export interface LoopSignal   { readonly detected: boolean; readonly confidence: number; readonly reason: string; readonly repeatedTerms: readonly string[]; }
export interface AccelSignal  { readonly detected: boolean; readonly confidence: number; readonly reason: string; readonly catalyticTerms: readonly string[]; }
export type BranchId = 'resonantbrand' | 'healingquest' | 'leadership' | 'integration';
export interface BranchRec    { readonly branch: BranchId; readonly rationale: string; readonly domainEvidence: readonly DimensionId[]; }

export interface PatternIntelligenceReport {
  readonly echoes: readonly MemoryEcho[];
  readonly stuckLoop: LoopSignal;
  readonly acceleration: AccelSignal;
  readonly holobagua: Readonly<Record<DimensionId, number>>;   // numeric internal (R3)
  readonly recommendation: BranchRec;
}

// patternIntelligence.ts — ALL pure, deterministic, zero network (sovereignty policy)
export function embedTextLite(text: string): Float64Array;                 // reuse resonanceHashEmbed under the hood
export function findNearestHistoryMatches(text: string, history: readonly LatticeEvent[], k?: number): MemoryEcho[];
export function detectStuckLoop(history: readonly LatticeEvent[]): LoopSignal;
export function detectAcceleration(history: readonly LatticeEvent[]): AccelSignal;
export function scoreHoloBaguaDomains(text: string): Readonly<Record<DimensionId, number>>;
export function recommendBranch(report: Omit<PatternIntelligenceReport, 'recommendation'>): BranchRec;
export function createPatternIntelligenceReport(reflection: string, snapshot: Snapshot): PatternIntelligenceReport;
```

`cosineSimilarity`: **reuse** `cosineDistance` from `coherence.ts` — do not duplicate.

### 4.2 Web routes ↔ HURL (R1)

```
/h/v1/:realm/:path*/:seed.:version.:chamber                    ← grammar v0.1
/h/v2/:realm/:path*/:seed.:version.:chamber@:resonanceHash     ← grammar v0.2
/h/:anything-else → attempt tryParseHurl on both; 404 → Threshold with gentle copy
```

### 4.3 Local memory (P2)

```ts
// lib/memory.ts — localStorage key: `holoscrolly:${seed}`
interface StoredScroll {
  readonly grammar: HurlGrammarVersion;
  readonly hurl: string;                    // serialized, provenance-preserving
  readonly events: readonly LatticeEvent[]; // append-only; reducer REJECTS mutation/deletion
  readonly memories: readonly ScopedMemory[];
}
```

Restore on load → `deriveSnapshot` → `orient`. Export = JSON download of `StoredScroll`. Delete = full key removal + confirmation rite (R2 sovereignty).

---

## 5. Component Inventory (P2/P3)

```
HoloScrollyShell            ← scroll container, engine auto-routing per holoscrolly-kit §2
ThresholdChamber            ← Chamber composition per kit move codes
SoulSeedCompassChamber        (each chamber = one question, one memory-write,
PresentStateChamber            one HURL advance — HOLOSCROLLY-ARCHITECTURE §3)
MemoryRootChamber
TrajectoryBranchChamber
LivingInvitationChamber
HoloBaguaSpine              ← live 8-intelligence bar; qualitative labels only (R3)
HurlBadge                   ← shows continuation token; copy/save; never auto-exposed
ReturnPrompt                ← renders returnPrompt(snapshot) verbatim last-state
PatternPanel                ← P3; renders PatternIntelligenceReport
NextMovementCard            ← singular, embodied, declinable
ConsentGate                 ← "Want me to look deeper? · Yes / Not Yet"
ExportPanel                 ← export seed / claim scroll / delete (R2)
ReducedMotionProvider       ← prefers-reduced-motion → discrete IO cuts (kit law, non-negotiable)
```

Chamber composition language: kit move codes (`HOLO_SOULSEED_BLOOM`, `HOLO_TIMELINE_SCRUB`, `HOLO_RESONANCE_LOCK_IN`, …) loaded from `holoscrolly-kit/moves/move-set.json`.

---

## 6. Test Matrix (minimum to pass each phase gate)

**HURL (P1):** deterministic mint · valid parse v0.1 · valid parse v0.2 · invalid parse returns null · round-trip both grammars · `upgradeHurl` never mutates original · grammar cross-compat (v0.1 parser output serializes back identically).

**HDOM (P1):** `deriveSnapshot` pure (same input → same output, no Date.now leakage) · return event appends, never overwrites · child holons preserve relationships · Φ-Gate throws `CoherenceException` past 0.618 and integrates φ-weighted below it · seam test: one incoherent signal → identical `CoherenceInterruptPayload` across REZZIE_SKIN and NEUTRAL_COMPASS_SKIN.

**Pattern Intelligence (P3):** handles empty history (no throw, empty echoes, `detected:false`) · detects repeated-phrase loop across ≥3 returns · detects acceleration across returns · branch recommendation always includes rationale + domain evidence · deterministic for same input · zero network.

**UI (P2):** reduced motion respected (continuous moves degrade to IO cuts) · private by default (nothing leaves device without consent action) · HURL restore works after refresh · export produces re-importable JSON · 404 HURL lands on Threshold, not an error page.

---

## 7. Acceptance Criteria per Phase

**P0 — Static inevitability.** One sample HOLOSCROLLY (realistic Brooks/HOLO data, hand-built HTML in `HOLOSCROLLS/`) that Brooks signs off as *emotionally undeniable*. Gate is aesthetic-emotional, not technical. Start from `HOLOSCROLLS/example-*.html` stock + holodesign-kit tokens.

**P1 — Engine hardening.** `npm run test` green across §6 HURL+HDOM matrix · `npm run typecheck` clean · CHANGELOG started · HurlGrammarVersion shipped per §2.

**P2 — Return loop live (Chamber Zero DoD, verbatim canon).** A stranger scans a QR, the scroll greets the field (not a form), a HURL is minted on first answer, the answer persists, and a return visit re-enters through the same HURL with memory intact — no opt-in, no second page, no reset. Plus: all six SoulSeed chambers traversable · `orient()` renders the four orientation fields · UI test matrix green.

**P3 — Pattern Intelligence.** Return Event flows through `createPatternIntelligenceReport` · PatternPanel renders echoes/loop/acceleration/HOLOBAGUA/branch · PI test matrix green · report deterministic.

**P4+ (Supabase/pgvector, 3D field, agents):** spec'd in v0.2 §10; ticket when P3 closes.

---

## 8. Data Schema (forward note for P4)

Supabase tables per FOUNDATION canon: `users` (claim-time only, R2) · `sessions` · `events` (append-only) · `memories` · `hurls` (store BOTH grammar serializations per R1) · `artifacts` · `agent_runs` · `products`. RLS on; pgvector for resonance matching. Do not build in P0–P3.

---

## 9. Open Items Carried (not blockers)

1. Pattern Intelligence poster build (off-repo or aspirational) — §3 P3 builds fresh either way; if the off-repo build surfaces, diff and harvest.
2. Locate `docs/prd-v0.3-soulseed-compass.md` referenced by doctrine; cross-bind when found.
3. PAS / HOLOAIKIDO integration points (doctrine §VI) — design in P4 alongside agents.

---

*v0.1 discovered the scroll. v0.2 discovered the organism. v0.3 is the hands: the exact files, seams, tests, and living motions by which becoming stops being a beautiful doctrine and becomes something a stranger can open, recognize, return to, and trust.*
