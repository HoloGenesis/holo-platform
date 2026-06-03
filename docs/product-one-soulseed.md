# product-one-soulseed.md — SoulSeed Compass v1

Canonical product spec for SoulSeed Compass — the first HOLOSCROLLY. Authoritative for S4 (manifest), S5 (static shell), S19 (agent prompts), S21–S25 (the living loop), S26b–S27 (email capture + paywall).

Version: 1.0 · 2 June 2026 · v1 scope LOCKED per Brooks's 2 June answers.

---

## What this product is, in one paragraph

A user arrives, gets noticed by **REZZIE** ("you look like you're between worlds"), and walks through a six-chamber scroll that asks where they are and where they're heading. They leave with a **SoulSeed Snapshot** (a small personalized map of themselves), a permanent **HURL** they can return to, and an invitation: come back when something changes. On return, REZZIE doesn't say "welcome back" — it asks *what changed.* The continuity is the product.

---

## v1 scope — LOCKED

| Feature | v1 decision | Notes |
|---|---|---|
| **Payment** | **Stripe single tier $27, in v1.** Build last in the sprint order but it ships in v1. | Open sub-question Q2b: live $27 at launch vs. free beta first with payment as fast-follow. Doesn't block any other section. |
| **Voice** | **Text-only v1.** Hume S2S voice arrives v1.1. | Magic is memory + agent reflection — text delivers it. |
| **Astrology** | **Paid add-on.** v1 ships the paywall + entitlement (`astro-addon`); the real natal/ephemeris engine arrives v1.1. | Base v1 trajectory chamber = Between-Place + I-Ching *framing* only. Owning `astro-addon` unlocks a deeper-layer copy slot now and the real engine when v1.1 ships. |
| **Auth** | **Anonymous-first.** Mint anonymous `userId` + HURL on entry (`email = null`). Capture email at chamber 6. `merge_user(from, into)` handles later cross-device login. | Never require signup to start. |
| **Agents** | REZZIE for chambers 1–5; COACH for chamber 6. | ANG3L / HOLOBUCKY / the broader grid are parked. |

---

## The six chambers (the scroll)

Each chamber is a holon. Each is data, not code — defined in `packages/product-manifests/src/soulseed-compass.manifest.ts` and rendered by the same `<Chamber />` component for all six.

### 1. Threshold

- **Purpose:** the user arrives; REZZIE notices them.
- **REZZIE opener:** *"You look like you're between worlds."* (Time-aware variant: morning / afternoon / evening framing.)
- **Asks for:** name (single text input). Skippable — the rest of v1 works without it.
- **Agent:** REZZIE.
- **Memory writes:** `profile` (name if given, time-of-arrival band).
- **Events:** `chamber.entered`, `intake.captured`.
- **Next:** `identity-seed`.

### 2. Identity Seed — the Between-Place Gate

- **Purpose:** capture the user's arrival vector with one soft, low-cost choice.
- **UI:** four tappable cards (the four Between-Place options):
  - *I lost something*
  - *I'm building something*
  - *I'm becoming someone*
  - *I don't know yet*
- **Storage:** the choice is stored as `state.arrivalVector` and written as a `narrative`-scope memory with high importance (`0.85`).
- **REZZIE response:** one-line acknowledgment that mirrors the choice back. No interrogation.
- **Agent:** REZZIE.
- **Memory writes:** `narrative` (the arrival vector), `state` (the chosen frame).
- **Events:** `choice.selected`, `chamber.entered`.
- **Next:** `present-state`.

### 3. Present State

- **Purpose:** ask what's alive *now* — the texture of the current moment.
- **REZZIE questions:** one or two reflective prompts, chosen by the agent based on the arrival vector. Examples:
  - if `I lost something` → *"What's still here that you didn't expect to keep?"*
  - if `I'm building something` → *"What's the part you keep coming back to when no one is watching?"*
- **UI:** single freeform text input.
- **Agent:** REZZIE.
- **Memory writes:** `state` (the present texture), possibly `narrative` if a strong arc emerges.
- **Events:** `intake.captured`, `chamber.entered`.
- **Next:** `memory-root`.

### 4. Memory Root

- **Purpose:** surface the pattern that keeps returning across the user's life. The first "deeper" question.
- **REZZIE prompt:** *"What is the thing that keeps coming back to you — not the loudest, the most repeated?"*
- **UI:** freeform text input + optional "skip for now" affordance.
- **Agent:** REZZIE.
- **Memory writes:** `narrative` (the returning pattern, high importance ≥ `0.80`).
- **Events:** `intake.captured`.
- **Next:** `trajectory-branch`.

### 5. Trajectory Branch

- **Purpose:** locate where the becoming is moving. Base layer for everyone; deeper layer for `astro-addon` holders.
- **Base layer (always shown):**
  - Between-Place + I-Ching *framing* copy, derived from the prior three chambers.
  - One question: *"If this next year went better than you expect, what would be different — not in what you have, but in who you've become?"*
- **Deeper layer (entitlement-gated):**
  - If the user owns `astro-addon`: render a placeholder "deeper layer" panel that previews what v1.1's real natal/ephemeris computation will surface. Copy explicitly frames it as "engine arriving v1.1 — your add-on unlocks it the moment it ships."
  - If they don't own it: render a single inline CTA — *"Unlock the deeper trajectory layer ($X) — engine arrives v1.1, your access starts now."* Tapping it opens the Stripe checkout for the add-on.
- **Agent:** REZZIE.
- **Memory writes:** `trajectory` (the emerging direction).
- **Events:** `intake.captured`, `entitlement.checked`, possibly `paywall.shown`.
- **Next:** `living-invitation`.

### 6. Living Invitation

- **Purpose:** crystallize, hand over the artifact, capture email, mint/persist the HURL, plant the return seed.
- **Agent:** **COACH** (only chamber that swaps).
- **Output:** the SoulSeed Snapshot (see below), rendered on screen and stored in `artifacts`.
- **Email capture:** a single input for email. Submitting calls `core/users.setEmail({ userId, email })`. The HURL displayed is the user's permanent return address.
- **Payment slot:** if Q2b resolves to "live at launch," this chamber is also where the base $27 Stripe checkout is offered (probably gated behind the Snapshot reveal so the value is felt first). If Q2b resolves to "free beta," this slot shows a "join the waitlist for the paid full version" CTA instead.
- **Memory writes:** `narrative` (the crystallization), `artifact` (pointer to the Snapshot row).
- **Events:** `artifact.created`, `email.captured`, `chamber.entered`.
- **Next:** `null` (terminal).

---

## The SoulSeed Snapshot — the first artifact

Stored as one row in `artifacts` with `artifactType: "soulseed-snapshot"`. The fields are minimal in v1 — everything the user reads is derived from stored memories, not freshly hallucinated.

```ts
type SoulSeedSnapshot = {
  identitySignal:        string;   // 1 sentence, from narrative memories
  presentState:          string;   // 1 sentence, from state memories
  returningPattern:      string;   // 1 sentence, from the memory-root chamber
  emergingTrajectory:    string;   // 1 sentence, from trajectory memories
  firstInvitation:       string;   // 1-2 sentences, the next right step
  hurl:                  HurlPath; // permanent return address
  // optional, gated by astro-addon entitlement:
  deeperTrajectoryTeaser?: string; // placeholder in v1; real layer in v1.1
};
```

### How it's derived

`core/artifacts.create` calls a deterministic `assembleSnapshot(userId, sessionId)` helper that:

1. Loads top-N memories per scope via `core/memory.context`.
2. Calls the agent (COACH) with those memories + the chamber 6 prompt, asking for the five fields as **structured output**.
3. Validates against `SoulSeedSnapshotSchema`.
4. Mints/refreshes the HURL via `core/hurl.mint`.
5. Inserts into `artifacts`, returns the row.

**Reproducibility rule:** running `assembleSnapshot` twice on the same session should yield substantively the same Snapshot, because it derives from stored signals — the LLM is a formatter, not the source of truth. If the second run produces a wildly different Snapshot, that's a bug.

---

## The return loop (THE moat)

The single thing that separates SoulSeed from "a quiz that emails you a result."

### What happens on return

1. The user opens their HURL (or any product door — same `userId`).
2. The SDK calls `sessions/resume`. Core returns `resumeContext`:
   - `lastChamber`
   - `lastSnapshotSummary` (a 1-line summary of the prior Snapshot)
   - `keyMemories` — top-10 by importance across `[profile, narrative, trajectory, artifact]`.
3. The frontend hydrates into a **return-mode threshold chamber** — same component, different opener.
4. REZZIE's opener is **derived from `resumeContext`**, not "welcome back":
   - if last arrival vector = `I lost something` and last trajectory mentioned grief: *"Last time, you were carrying something you hadn't put down. What's different now?"*
   - if last arrival vector = `I'm building something`: *"Last time, you were building. What did the build teach you?"*
   - generic fallback: *"Last time you were between worlds. What changed?"*
5. The user answers (single freeform input).
6. The agent processes it → writes memory → orchestration advances → a *new* Snapshot is generated, derived from old + new memories.
7. The HURL re-mints with the new state coordinate.

### Implementation notes

- The return-mode opener is generated by `core/agents.run` with a special `returnContext` field on the request, *not* by hardcoded conditionals in the UI. The agent prompt encodes the "never say welcome back" rule.
- The new Snapshot is a *new row* in `artifacts`. The prior Snapshot is preserved — the user's evolution is queryable.
- The threshold chamber UI is the same component as first-entry; the difference is the agent's response, driven by `resumeContext`.

### Why this is the whole point

Most products forget the user. SoulSeed remembers them and uses that memory as the wedge. A v1 that mints a HURL but can't restore state on return is not done. S25 is the section that proves the moat; don't skip it.

---

## Walking-skeleton chain for SoulSeed (Milestone 1)

```
1. User enters → sessions/start → state(currentChamber=threshold), anonymous userId
2. Manifest fetched (products/manifest)
3. Chamber 1 entered → events
4. Agent called (mock in v1) → SoulSeedAgentOutput
5. memory/upsert per memoryWrite
6. orchestrations/next → state, nextChamber=identity-seed
7. ... (repeat through chambers 2–6)
8. Chamber 6 → COACH called → artifacts/create → SoulSeed Snapshot row + HURL persisted
9. Email captured → users.setEmail
10. User leaves
11. User returns → sessions/resume → resumeContext
12. REZZIE asks "What changed?" (return-mode threshold)
13. New memories, new Snapshot, re-minted HURL
```

If steps 1–13 run once with mock data and ugly UI, the product is proven and we move to polish.

---

## Manifest shape (what S4 produces)

```ts
const soulseedCompassManifest: ProductManifest = {
  productKey: "soulseed",
  version: "1.0.0",
  rootHolon: { /* see hdom */ },
  chambers: [
    {
      key: "threshold",
      title: "Threshold",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "trajectory", "artifact"], // mostly empty on first run
      memoryWriteScopes: ["profile", "event"],
      next: "identity-seed",
      prompts: {
        intro: "You look like you're between worlds.",
        questions: ["What should I call you?"]
      }
    },
    {
      key: "identity-seed",
      title: "Identity Seed",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative"],
      memoryWriteScopes: ["narrative", "state"],
      next: "present-state",
      prompts: {
        intro: "Pick the one that's closest, even if none of them is exactly right.",
        questions: [
          "I lost something.",
          "I'm building something.",
          "I'm becoming someone.",
          "I don't know yet."
        ]
      }
    },
    {
      key: "present-state",
      title: "Present State",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state"],
      memoryWriteScopes: ["state", "narrative"],
      next: "memory-root",
      prompts: {
        intro: "What's alive right now?",
        questions: [] // agent fills based on arrival vector
      }
    },
    {
      key: "memory-root",
      title: "Memory Root",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state"],
      memoryWriteScopes: ["narrative"],
      next: "trajectory-branch",
      prompts: {
        intro: "What keeps coming back?",
        questions: ["What is the thing that keeps coming back to you — not the loudest, the most repeated?"]
      }
    },
    {
      key: "trajectory-branch",
      title: "Trajectory Branch",
      agentKey: "rezzie",
      memoryReadScopes: ["profile", "narrative", "state", "trajectory"],
      memoryWriteScopes: ["trajectory"],
      next: "living-invitation",
      prompts: {
        intro: "Where's the becoming pointing?",
        questions: [
          "If this next year went better than you expect, what would be different — not in what you have, but in who you've become?"
        ]
      },
      entitlementsRequired: undefined,        // base layer is always shown
      addOns: [
        { entitlementKey: "astro-addon", slot: "deeperTrajectoryLayer" }
      ]
    },
    {
      key: "living-invitation",
      title: "Living Invitation",
      agentKey: "coach",
      memoryReadScopes: ["profile", "narrative", "state", "trajectory", "event"],
      memoryWriteScopes: ["narrative", "artifact"],
      next: null,
      prompts: {
        intro: "Here's what I'm seeing.",
        questions: []   // COACH generates Snapshot, then asks for email
      }
    }
  ]
};
```

Note: the `addOns` array is a v1 convention for declaring entitlement-gated slots inside a chamber. The contracts package will type this; UI reads it and gates accordingly.

---

## Open sub-question (Q2b — needs Brooks)

**Q2b: At first launch, do we ship with Stripe live at $27, or run a free beta and ship payment as a fast-follow point release?**

- Live at launch (default if Brooks doesn't pick): more pressure on the felt value of the Snapshot before chamber 6's checkout. Higher ceiling, higher risk of friction.
- Free beta: easier to gather signal on the chambers themselves; payment slots into chamber 6 in a 1.0.1.

This decides whether S27 ships in the first published cut or in the first point release. Everything else in v1 is locked.

---

## Parked for v2

- **Real natal/ephemeris astrology engine** (the actual computation behind the `astro-addon`). v1.1.
- **Hume S2S voice** — REZZIE talks. v1.1.
- **Compiled-Vector primitive** — directional memory, trajectory math, replay/time-travel.
- **ANG3L, HOLOBUCKY, agent grid** — only REZZIE + COACH in v1.
- **Additional products** (HOLOBOOK and beyond) — only the manifest stub (S29) in v1.
- **Multi-product dashboards / cross-product navigation UI**.
- **Per-chamber editing / "redo this chamber"** — out of scope in v1; users redo the whole flow on return.
- **Branching scrolls** — v1 is a linear 6-chamber sequence; trajectory branching is conceptual, not navigational.
- **Voice/copy localization** — English only in v1.

---

## What Code does with this next

S4a (Cowork) drafts the manifest data table verbatim from the chamber specs above. S4b (Code) wires it as a typed `ProductManifest`. S5 builds the static shell rendering all six chambers from the manifest. S19 (Cowork) writes the REZZIE + COACH prompt copy, encoding the "never say welcome back" rule and the structured-output schema. S20 (Code) wires the live agent runner with the mock→live switch. S21–S25 turn the chain on end-to-end. S26b + S27 add email capture, `merge_user` wiring, and the Stripe + `astro-addon` paywalls.
