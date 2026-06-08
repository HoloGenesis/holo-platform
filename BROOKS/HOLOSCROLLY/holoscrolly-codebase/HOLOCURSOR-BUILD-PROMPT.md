# HOLOCURSOR BUILD PROMPT — HOLOSCROLLY v0.1 → v0.2

You are implementing the canonical HOLOSCROLLY codebase.

## Non-negotiable definition

A HOLOSCROLLY is a trajectory-aware holonic document organism that uses scroll, interaction, memory, and return-events to orient a person, brand, community, or field inside its own becoming.

It is not merely scrollytelling.
It is not a landing page.
It is not a dashboard.
It is a living relationship container.

## Current codebase

- React + TypeScript + Vite
- HDOM types in `src/types/hdom.ts`
- HURL serializer in `src/utils/hurl.ts`
- Canonical document seed in `src/data/canon.ts`
- Move registry in `src/data/moves.ts`
- Scroll engine hooks:
  - `useScrollProgress`
  - `useActiveStep`
  - `useReducedMotion`

## Build v0.2

Implement the following completely:

1. Add route-level HURL support.
   - Use React Router or a small custom router.
   - Route pattern: `/h/:realm/:chamber/:stage/:branch`
   - Parse route into a HURL object.
   - If no route exists, use canonical root HURL.

2. Add Return Event memory.
   - Store local visit memory in localStorage.
   - Track visits, lastVisitAt, lastActiveNode, and lastReflection.
   - On return, show: “What changed since the last time you arrived here?”
   - Save user response to the HDOM memory object.

3. Add SoulSeed Compass intake.
   - First question: “What is trying to emerge through you right now?”
   - Save response as trunk signal.
   - Render branches: Brand Tree, Wholeness Journey, Leadership Journey.
   - Update HURL revision when the user submits.

4. Add Move Compatibility Validator.
   - Each move lists compatibleWith.
   - Warn in dev console when a declared composition includes incompatible moves.
   - Allow compatibleWith: ["ALL"].

5. Add tests.
   - Use Vitest.
   - Test serializeHurl().
   - Test createHurl().
   - Test move lookup.
   - Test compatibility validator.
   - Test local memory reducer.

6. Add documentation.
   - Update README with route examples.
   - Add `docs/HDOM.md`.
   - Add `docs/MOVE-REGISTRY.md`.

## Design rules

- Preserve HOLO metallic gold as sacred accent.
- Every visible major section maps to an HDOM node.
- Reduced-motion fallback is mandatory.
- No generic SaaS UI.
- No tabbed dashboard pattern.
- No separate funnel pages.
- One evolving container.
