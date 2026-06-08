# MOVE REGISTRY — Composable Scroll Grammar

A HOLOSCROLLY is assembled from **moves**: engine-ready scroll primitives. Each
move declares its inputs, outputs, parameters, a reduced-motion fallback, and the
moves it composes with.

## Move shape (`src/types/moves.ts`)

```ts
interface ScrollyMove {
  id: string;               // e.g. "HOLO_RETURN_EVENT"
  category: MoveCategory;   // ENGINE | PIN | REVEAL | AUTHOR | SYNC | PERF | TOPO | HOLO | …
  code: string;             // short code, e.g. "RETURN_EVENT"
  name: string;
  definition: string;
  narrativeUse: string;
  inputs: string[];
  outputs: string[];
  parameters: MoveParameters;   // includes mandatory reducedMotionFallback
  compatibleWith: string[];     // other move ids, or ["ALL"]
}
```

## Registered moves

| Code | Category | Reduced-motion fallback |
| --- | --- | --- |
| INTERSECTION_SUMMONING | ENGINE | cut |
| SCROLL_LINKED_TIMELINE | ENGINE | still-frame |
| STICKY_GRAPHIC_STEP | PIN | fade |
| LAYER_PEEL | REVEAL | text-spine |
| CLOSEREAD_GLYPH | AUTHOR | text-spine |
| SCROLL_TO_3D_SCENE | SYNC | still-frame |
| REDUCED_MOTION_MIRROR | PERF | still-frame (compatibleWith: ALL) |
| HOLONIC_RECURSION | TOPO | text-spine |
| SOULSEED_BLOOM | HOLO | still-frame |
| RESONANCE_LOCK_IN | HOLO | text-spine |
| RETURN_EVENT | HOLO | text-spine |

## Compatibility validator (`src/moves/validate.ts`)

Two moves are compatible when **either** declares the other in `compatibleWith`,
or when either declares `"ALL"`.

```ts
import { validateComposition, warnIfIncompatible } from "./moves/validate";

validateComposition(["ENGINE_INTERSECTION_SUMMONING", "PIN_STICKY_GRAPHIC_STEP"]); // []
warnIfIncompatible(myComposition, "my-chamber"); // console.warn in dev only
```

- `validateComposition(ids)` → pure, returns `CompatibilityIssue[]`.
- `warnIfIncompatible(ids, label)` → same, plus dev-console warnings (`import.meta.env.DEV`).
- Unknown move ids are reported as `reason: "unknown-move"`.

## Authoring rule

Reduced motion is **mandatory**, never an afterthought. Every move must carry a
`reducedMotionFallback`; the test suite enforces it.
