# HOLOPEDIA of HOLOSCROLLY

A first executable codebase for the canonical **HOLOSCROLLY** format. **(v0.4)**

> Deep dives: [`docs/HDOM.md`](docs/HDOM.md) · [`docs/MOVE-REGISTRY.md`](docs/MOVE-REGISTRY.md)

## Definition

A HOLOSCROLLY is a trajectory-aware holonic document organism that uses scroll, interaction, memory, and return-events to orient a person, brand, community, or field inside its own becoming.

It is not merely scrollytelling.  
It is not a landing page.  
It is not a dashboard.  
It is a living relationship container.

## Canonical sources folded into this build

1. ROOT / Narrative Immunology HOLOSCROLLY
   - Living Membrane
   - Attack Vectors
   - Self / Non-Self Literacy Gate
   - Four-Layer Immune Stack
   - HOLOAIKIDO Dojo
   - Memory Lattice
   - Microbiome of Allies
   - Living Diagnosis
   - Visible Invitation

2. HDOM v0.1 — Holonic Document Object Model
   - identity
   - state
   - history
   - trajectory
   - relationships
   - children
   - memory

3. Personal Dashboard of Becoming
   - canonical question: “Where am I in becoming?”
   - SoulSeed Compass
   - HURL issuance
   - Living Identity Graph
   - HOLOBAGUA Field Map
   - Product Pathways
   - Return Event
   - HURL evolution

## Install

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
npm run preview
```

## Test

```bash
npm run test       # watch mode (Vitest)
npm run test:run   # single run, CI-friendly
npm run typecheck  # tsc --noEmit
```

## HURL routing

Routes carry the **address-of-becoming**, not a static location:

```txt
/h/:realm/:chamber/:stage/:branch
```

Examples:

```txt
/h/holopedia/scrollytelling-to-holoscrolly/1.0/canon
/h/holopedia/scrollytelling-to-holoscrolly/1.0/brand-tree
/h/holopedia/scrollytelling-to-holoscrolly/1.0/wholeness-journey
/h/holopedia/scrollytelling-to-holoscrolly/1.0/leadership-journey
```

- No route present → the canonical root HURL is used (`CANONICAL_ROOT_HURL`).
- Missing segments inherit from the base HURL, so the organism is never address-less.
- The SoulSeed Compass mints a new revision and `navigate()`s to the chosen branch.

Parser/serializer: `src/utils/hurl.ts` (`parseHurlRoute`, `hurlToRoute`). Router hook: `src/router/useHurlRoute.ts`.

## Return Event memory

Local visit memory lives in `localStorage` (`src/memory/returnMemory.ts`) behind a
pure, testable reducer. It tracks `visits`, `lastVisitAt`, `lastActiveNode`, and
`lastReflection`. On a return visit the organism asks
*"What changed since the last time you arrived here?"* and writes the answer back
into the HDOM node's `memory.notes`.

## File map

```txt
src/
  components/
    HoloscrollyApp.tsx       # Main prototype
    StickyChapter.tsx        # Sticky visual + scroll steps chamber
    HoloSigil.tsx            # Scroll-reactive symbolic visual
    HurlPanel.tsx            # HURL display
    HdomNodeView.tsx         # HDOM node renderer
    MoveCard.tsx             # Move registry card
    ProgressSpine.tsx        # Scroll progress spine
  data/
    canon.ts                 # Canonical HDOM document seed
    hydrate.ts               # route-driven canon hydration (v0.3)
    moves.ts                 # Composable scrollytelling / HOLOSCROLLY move registry
  components/
    HoloTorusScene.tsx       # SYNC_SCROLL_TO_3D_SCENE Three.js adapter, lazy-loaded (v0.3/v0.4)
  recursion/
    holonicRecursion.ts      # TOPO recursion pure logic + tests (v0.4)
    RecursionPanel.tsx       # nested HOLOSCROLLY enter/traverse/return UI (v0.4)
  hooks/
    useActiveStep.ts         # IntersectionObserver step activation
    useReducedMotion.ts      # Accessibility signal
    useScrollProgress.ts     # Scroll-linked timeline primitive
  types/
    hdom.ts                  # HDOM and HURL types
    moves.ts                 # Move registry types
  router/
    useHurlRoute.ts          # /h/:realm/:chamber/:stage/:branch → HURL (v0.2)
  memory/
    returnMemory.ts          # pure reducer + localStorage edges (v0.2)
    useReturnMemory.ts       # React binding for Return Event memory (v0.2)
  soulseed/
    branches.ts              # trunk question + three canonical branches (v0.2)
    SoulSeedCompass.tsx      # intake → HURL revision bump (v0.2)
  moves/
    validate.ts              # move compatibility validator (v0.2)
  components/
    ReturnEvent.tsx          # "what changed since last time?" (v0.2)
  utils/
    hurl.ts                  # HURL create / serialize / parse / route (v0.2)
  styles.css                 # HOLOGLASS visual layer
docs/
  HDOM.md                    # HDOM model reference (v0.2)
  MOVE-REGISTRY.md           # move grammar + validator reference (v0.2)
```

## v0.2 status

| Build item | Status |
| --- | --- |
| HURL routing | ✅ `src/router/useHurlRoute.ts`, `src/utils/hurl.ts` |
| Return Event memory | ✅ `src/memory/*` |
| SoulSeed Compass intake | ✅ `src/soulseed/*` |
| Move Compatibility Validator | ✅ `src/moves/validate.ts` |
| Vitest suite | ✅ `src/**/*.test.ts` |
| Documentation | ✅ `docs/` + this README |

## v0.3 status

| Build item | Status |
| --- | --- |
| Route-driven canon hydration | ✅ `src/data/hydrate.ts` — `hydrateCanon(doc, hurl)` stamps the route HURL and activates the branch-resolved chamber, without mutating the seed canon |
| Three.js scroll-to-scene (`SYNC_SCROLL_TO_3D_SCENE`) | ✅ `src/components/HoloTorusScene.tsx` — scroll-linked HOLOTORUS, coherence-tuned material, still-frame reduced-motion fallback |

### HOLOTORUS chamber

A pinned `sticky` scene whose scroll progress drives camera travel, torus
rotation, and emissive intensity. The HURL's `coherence` tunes the material hue.
Under `prefers-reduced-motion`, the scene renders a single composed still frame
and surfaces a text-spine caption instead of travelling.

### Hydration

`hydrateCanon(holoscrollyCanon, hurl)` runs on every render in `HoloscrollyApp`.
Deep-linking to `/h/holopedia/.../leadership-journey` marks the SoulSeed chamber
`active` and reflects the branch in the hero badge — the document reflects the
address, while the canonical seed stays immutable.

## v0.4 status

| Build item | Status |
| --- | --- |
| Code-split the torus | ✅ `HoloTorusScene` is `React.lazy`-loaded behind `Suspense`. Three.js ships in its own chunk (~457 kB) that loads only when the chamber renders; the initial bundle drops to ~179 kB |
| `TOPO_HOLONIC_RECURSION` | ✅ `src/recursion/` — a step opens a smaller complete HOLOSCROLLY (`inner-orientation` holon) and returns to the parent timeline with a `HolonReturnEvent` |

### Holonic recursion

`src/recursion/holonicRecursion.ts` holds the pure logic — `createReturnEvent`,
`applyReturn` (marks the child `remembered`, bumps its visit count, notes the
parent, never mutates input), and `findHolon` for locating a nested holon in the
tree. `src/recursion/RecursionPanel.tsx` is the UI: **Enter the chamber** →
traverse the inner steps → carry one true step → **Return to parent timeline**.
The carried step is written back into HDOM memory.

> Note: the logic module is `holonicRecursion.ts` and the component is
> `RecursionPanel.tsx` — deliberately *not* casing-twins, to stay safe on
> case-insensitive filesystems.

## Next production steps

1. Persist HDOM nodes in Supabase/Postgres.
2. Add HURL routing: `/h/:realm/:chamber/:stage/:branch`.
3. Add return-event comparison: previous memory vs current user response.
4. Add SoulSeed Compass intake component.
5. Add HOLOBAGUA scoring and branch recommendation.
6. Add MDX/Quarto authoring layer for `AUTHOR_CLOSEREAD_GLYPH`.
7. Add Three.js adapter for `SYNC_SCROLL_TO_3D_SCENE`.
8. Add test suite for HURL serialization, HDOM state transitions, and move compatibility.

## Cursor / Claude Code instruction

Build forward from this prototype by treating `src/data/canon.ts` as the seed living document and `src/data/moves.ts` as the choreography registry. Do not reduce this to a generic landing page. Every section must remain an HDOM node with trajectory and memory.
