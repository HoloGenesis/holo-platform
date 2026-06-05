# holobook.draft.md — HOLOBOOK manifest STUB (S29)

**⚠️ STUB — DO NOT BUILD IN v1.** This file is the *proof point* that HOLO Core supports a second product without modification. The chambers below are placeholders; HOLOBOOK as a product is post-v1 work. The only v1 deliverable is this draft + the Code-side validation (S29 → S29b) that the same `ProductManifestSchema` parses it cleanly.

Source of truth for the structure is `packages/product-manifests/drafts/soulseed-compass.draft.md` — this stub mirrors it intentionally to demonstrate reusability.

Version: 0.0.1 · stub

---

## What this stub proves

| Claim | How this stub demonstrates it |
|---|---|
| One core, many doors | HOLOBOOK uses the same `ProductManifestSchema`, same agent registry, same HURL minting, same `memory/context` endpoint as SoulSeed. |
| Memory continuity across products | Chamber 1 reads `narrative`, `trajectory`, and `artifact` scopes that **SoulSeed wrote**. HOLOBOOK opens with the user already known. |
| No Core changes required | See the "What Core needs to change" section at the bottom. Answer: nothing in v1's Core. Contracts may widen `AgentKey` and `EntitlementKey` enums; that's a `@holo/contracts` change, not a Core change. |
| Thin handlers earn their keep | Because every Core route delegates to `core/<name>.ts`, swapping `productKey: "holobook"` in the request flows through the exact same code path. No new route files. |

---

## Manifest header

| Field | Value |
|---|---|
| productKey | holobook |
| version | 0.0.1 |
| rootHolon.id | holobook-root |
| rootHolon.type | product |
| rootHolon.title | HOLOBOOK |
| status | stub (not for v1 build) |

---

## Chamber order (linear, 3 chambers — placeholder shape)

| Order | Key | Title | Agent | Next |
|---|---|---|---|---|
| 1 | homecoming | Homecoming | rezzie | chapter-mark |
| 2 | chapter-mark | Chapter Mark | rezzie | page-one |
| 3 | page-one | Page One | scribe | (null — terminal) |

Note on `scribe`: HOLOBOOK's chamber-3 agent is the synthesis role (same shape as SoulSeed's COACH — produces an artifact, doesn't ask questions). Naming a new `AgentKey` is the only contracts widening this stub implies. **For v1, `scribe` can be aliased to COACH** to avoid any contracts edit; HOLOBOOK's real build will introduce SCRIBE if and when it ships.

---

## Chamber 1 — Homecoming

The continuity proof point. The user arrives at HOLOBOOK via their HURL (same `userId`, new `productKey: "holobook"`). REZZIE reads what SoulSeed deposited and opens with recognition — not "tell me about yourself."

| Field | Value |
|---|---|
| key | homecoming |
| title | Homecoming |
| agentKey | rezzie |
| next | chapter-mark |
| entitlementsRequired | (none) |
| input.kind | freeform text |
| input.required | no |

### Prompts

| Slot | Copy |
|---|---|
| intro (no SoulSeed history) | A new room. Same you. What brings you to the page? |
| intro (with SoulSeed history) | (REZZIE composes from `resumeContext` — e.g. *"Last we walked together you were [emergingTrajectory]. Open the book at that page?"*) |
| question | What's the chapter you'd open if no one else was reading? |

### Memory read scopes (CROSS-PRODUCT — proves continuity)

| Scope | Source product | Why |
|---|---|---|
| profile | soulseed | Name and durable facts. No re-onboarding. |
| narrative | soulseed | Arrival vector, returning pattern, crystallization. |
| trajectory | soulseed | Where the becoming was pointing at last SoulSeed run. |
| artifact | soulseed | The last SoulSeed Snapshot — used as the orienting frame. |
| profile | holobook | (empty on first HOLOBOOK visit) |
| narrative | holobook | (empty on first HOLOBOOK visit) |

This row is the moat in table form. HOLOBOOK does not ask. HOLOBOOK *remembers*.

### Memory write scopes

| Scope | Source product | What gets written |
|---|---|---|
| event | holobook | chamber.entered, intake.captured |
| state | holobook | the chapter-shape the user named (low importance until chamber 2 confirms) |

---

## Chamber 2 — Chapter Mark

The user names the chapter they're in. This either confirms or revises SoulSeed's last trajectory read.

| Field | Value |
|---|---|
| key | chapter-mark |
| title | Chapter Mark |
| agentKey | rezzie |
| next | page-one |
| entitlementsRequired | (none) |
| input.kind | single-choice + freeform |
| input.options | (see below) |

### Prompts

| Slot | Copy |
|---|---|
| intro | Books name themselves slowly. Pick the closest. |
| question | Which of these is closest to the chapter you're in? |
| follow-up freeform | If none of these fit, name yours in a single line. |

### Chapter options (placeholder set)

| optionKey | Label |
|---|---|
| leaving | The Leaving |
| arriving | The Arriving |
| building | The Building |
| waiting | The Long Pause |
| custom | None of these — I'll name mine. |

### Memory read scopes

| Scope | Source product | Why |
|---|---|---|
| trajectory | soulseed | To check the new chapter against the prior trajectory direction. |
| narrative | holobook | (empty on first HOLOBOOK visit; populated on return) |

### Memory write scopes

| Scope | Source product | What gets written |
|---|---|---|
| narrative | holobook | The chapter name, importance 0.80 |
| state | holobook | `currentChapter: <optionKey or custom string>` |
| event | holobook | choice.selected (or custom.named) |

### Continuity check note (for REZZIE composition)

If the user's HOLOBOOK chapter contradicts the SoulSeed trajectory in a notable way (e.g. SoulSeed said `building`, HOLOBOOK chapter is `waiting`), REZZIE writes an additional `narrative`-scope memory at importance 0.70: `"User's HOLOBOOK chapter ('waiting') diverges from prior SoulSeed trajectory ('building')."` This is signal, not contradiction — REZZIE does not surface it to the user.

---

## Chamber 3 — Page One (terminal; produces an artifact)

| Field | Value |
|---|---|
| key | page-one |
| title | Page One |
| agentKey | scribe (aliased to coach in v1 to avoid contracts edit) |
| next | (null — terminal) |
| entitlementsRequired | (none) |
| input.kind | freeform text |
| input.required | yes |
| input.maxLength | 600 |

### Prompts

| Slot | Copy |
|---|---|
| intro | One line. The first line of this chapter, written for no one but you. |
| question | What's the first sentence? |
| close (return seed) | Come back when the next line writes itself. I'll keep your page. |

### Outputs produced

| Output | Where it goes |
|---|---|
| HOLOBOOK Page-One artifact (chapter name + first line + HURL) | `artifacts` table, row of type `holobook-page-one` |
| HURL minted/refreshed | `hurls` table; format `hurl://holobook/page-one/state-[n]/coherence-[nnn]` |

### Artifact field sources (reproducible, not hallucinated — same rule as SoulSeed Snapshot)

| Artifact field | Derived from |
|---|---|
| chapterName | chamber-2 chosen optionKey or custom string |
| firstLine | chamber-3 user input verbatim (the agent does not paraphrase the user's first line — that's the point) |
| openingFrameFromSoulSeed | one-line excerpt of the most recent `narrative` memory written by SoulSeed (optional; appears as a quiet epigraph in the rendered artifact) |
| hurl | derived from sessionId + state coordinate, no LLM |

### Memory read scopes

| Scope | Source product |
|---|---|
| profile | soulseed |
| narrative | soulseed, holobook |
| state | holobook |
| trajectory | soulseed |
| artifact | soulseed, holobook |

### Memory write scopes

| Scope | Source product | What gets written |
|---|---|---|
| artifact | holobook | pointer to the Page-One row, importance 0.70 |
| narrative | holobook | the first line, importance 0.85 |
| event | holobook | artifact.created, chamber.entered |

---

## Cross-product memory flow (the continuity demo)

This is the picture S29's Code-side validation should print to console as a sanity check:

```
[ on HOLOBOOK homecoming for a user who has run SoulSeed once ]

  memory/context request:
    userId:       <existing>
    productKey:   holobook
    scopes:       [profile, narrative, trajectory, artifact]
    limit:        10
    minImportance: 0.50

  memory/context response:
    [
      { sourceProduct: "soulseed", scope: "narrative",
        content: "User crystallized as a builder leaving a known role...", importance: 0.92 },
      { sourceProduct: "soulseed", scope: "trajectory",
        content: "Year-out exit toward a self-shaped role.", importance: 0.85 },
      { sourceProduct: "soulseed", scope: "narrative",
        content: "User arrived as 'building' — making something they haven't fully named.", importance: 0.85 },
      { sourceProduct: "soulseed", scope: "artifact",
        content: "SoulSeed Snapshot generated for 2 Jun 2026.", importance: 0.70 },
      { sourceProduct: "soulseed", scope: "profile",
        content: "User goes by [name].", importance: 0.85 }
    ]

  REZZIE opens HOLOBOOK with:
    "Last we walked together you were a builder leaving a known role. Open the book at that page?"
```

No re-onboarding. No "tell me about yourself." HOLOBOOK is the second door into the same brain.

---

## What Core needs to change to support this

**v1 Core: nothing.** Every endpoint already accepts a `productKey` parameter; the thin handlers delegate to the same `core/<name>.ts` library; the `memories` table is already scoped by `source_product`; the HURL format already templates on `productKey`.

| Concern | Already supports HOLOBOOK in v1? | Notes |
|---|---|---|
| `sessions/start` (+ get/resume) | ✅ yes | `productKey` is already a request field. |
| `events` | ✅ yes | `productKey` is on the EventRecord. |
| `memory/upsert` | ✅ yes | `sourceProduct` on every row. |
| `memory/context` | ✅ yes | Caller passes `productKey` and `scopes`. Cross-product reads are the default in v1 (single user, same-user reads only). |
| `agents/run` | ✅ yes | The agent registry already keys on `agentKey`. REZZIE works for any product that wants the recognition-first voice. |
| `orchestrations/next` | ✅ yes | Reads the manifest. No code change. |
| `hurl/mint` | ✅ yes | `hurl://${productKey}/...` templates. |
| `artifacts/create` | ✅ yes | `productKey` + `artifactType` on the row. |
| `products/manifest` | ✅ yes — once the HOLOBOOK manifest is registered in `@holo/product-manifests`. | Registration is a one-line export, not a Core change. |
| `entitlements/*` | ✅ yes | `key` is freeform. If HOLOBOOK adds entitlements, they're new keys; no schema change. |
| `users/merge` | ✅ yes | Operates on `user_id` across all products. |

**Contracts (`@holo/contracts`):** widening `ProductKey` to include `"holobook"` and `AgentKey` to include `"scribe"` (if SCRIBE actually ships) are pure additive enum changes. The v1 stub keeps `productKey: "holobook"` valid by adding it to the enum at S2; it keeps `agentKey: "scribe"` valid by aliasing it to `"coach"` until SCRIBE is real.

**Frontend (`apps/holobook`):** would be a *new app* in `apps/`, but importing `@holo/sdk` exactly as SoulSeed does. The whole reason for the thin-handler rule is that "second app" means "new shell, same brain."

**What v1 does NOT have to do:**
- Stand up a separate API service.
- Add new database tables.
- Add product-specific endpoints.
- Migrate any memory data.
- Add per-product authentication.

If any of the above were required, the architecture would have failed the proof. They aren't.

---

## What Code does with this next (S29 → S29b → S30)

- **S29b (Code):** add `"holobook"` to the `ProductKey` enum in `@holo/contracts`, wire this draft into `packages/product-manifests/src/holobook.manifest.ts` exporting `holobookManifestStub`, and validate against `ProductManifestSchema.parse()` at module load. Add one Vitest case: load the stub manifest, call `getNextChamber(stub, "homecoming")` and confirm it resolves `homecoming → chapter-mark → page-one → null`. Add one integration smoke test: hit `products/manifest?productKey=holobook` and confirm the stub returns. **Do not build any HOLOBOOK frontend, agent prompts, or routes.**
- **S30 (Cowork):** "How to add a HOLOSCROLLY" doc — turns this stub + its Code validation into a 1-page playbook future-Hiren (or a future builder) follows when Product #3 lands. The stub is the example the playbook points at.
- **When HOLOBOOK is real:** introduce SCRIBE in the agent registry (`packages/agent-prompts/scribe.md`), widen `AgentKey`, replace `"coach"` alias with `"scribe"` in chamber 3. The chamber shapes above are placeholders — the real product will revise them. The proof point is that none of that work touches Core or SoulSeed.

---

## Parked — HOLOBOOK as a real product

Everything below is post-v1. Listed here only so v1 doesn't drift into it.

- Full HOLOBOOK product design (more than 3 chambers, real voice, real artifact templates).
- SCRIBE agent prompt + structured-output contract.
- HOLOBOOK-specific entitlements (e.g. `holobook-pro`, custom book exports).
- A returning-reader loop equivalent to SoulSeed's "What changed?" — likely *"What did you read since?"* — but designed at HOLOBOOK time, not now.
- Visual / scroll language distinct from SoulSeed's HOLOTORUS theme.
- Cross-product navigation UI (a single shell that surfaces both products under one HURL hub).

None of the above is in v1. The stub above is the entire S29 deliverable.
