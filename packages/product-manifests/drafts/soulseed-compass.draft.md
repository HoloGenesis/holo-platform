# soulseed-compass.draft.md — manifest content (S4a)

Draft data for the SoulSeed Compass v1 manifest. Plain tables only — Claude Code wires this into a typed `ProductManifest` in S4b. Source of truth for chamber copy is `docs/product-one-soulseed.md`.

Product key: **soulseed**
Manifest version: **1.0.0**
Chamber count: **6**
Terminal chamber: **living-invitation** (next = null)

---

## Manifest header

| Field | Value |
|---|---|
| productKey | soulseed |
| version | 1.0.0 |
| rootHolon.id | soulseed-root |
| rootHolon.type | product |
| rootHolon.title | SoulSeed Compass |

---

## Chamber order (linear)

| Order | Key | Title | Agent | Next |
|---|---|---|---|---|
| 1 | threshold | Threshold | rezzie | identity-seed |
| 2 | identity-seed | Identity Seed | rezzie | present-state |
| 3 | present-state | Present State | rezzie | memory-root |
| 4 | memory-root | Memory Root | rezzie | trajectory-branch |
| 5 | trajectory-branch | Trajectory Branch | rezzie | living-invitation |
| 6 | living-invitation | Living Invitation | coach | (null — terminal) |

---

## Chamber 1 — Threshold

| Field | Value |
|---|---|
| key | threshold |
| title | Threshold |
| agentKey | rezzie |
| next | identity-seed |
| entitlementsRequired | (none) |
| input.kind | text |
| input.label | What should I call you? |
| input.skippable | yes |

### Prompts

| Slot | Copy |
|---|---|
| intro | You look like you're between worlds. |
| question 1 | What should I call you? |

### Time-aware intro variants (REZZIE picks one)

| Time band | Variant |
|---|---|
| morning (05:00–11:59 local) | You look like you're between worlds — and the day hasn't decided yet either. |
| afternoon (12:00–17:59 local) | You look like you're between worlds. Right in the middle of the day, too. |
| evening (18:00–22:59 local) | You look like you're between worlds. The evening is good for that. |
| late night (23:00–04:59 local) | You look like you're between worlds. The late hours tell on us. |
| fallback | You look like you're between worlds. |

### Memory read scopes

| Scope | Why |
|---|---|
| profile | mostly empty on first run; non-empty on return |
| narrative | non-empty on return |
| trajectory | non-empty on return |
| artifact | non-empty on return (prior Snapshot) |

### Memory write scopes

| Scope | What gets written |
|---|---|
| profile | name (if given), time-of-arrival band |
| event | chamber.entered, intake.captured |

---

## Chamber 2 — Identity Seed (the Between-Place Gate)

| Field | Value |
|---|---|
| key | identity-seed |
| title | Identity Seed |
| agentKey | rezzie |
| next | present-state |
| entitlementsRequired | (none) |
| input.kind | single-choice card |
| input.required | yes |
| input.options | (see below) |

### Prompts

| Slot | Copy |
|---|---|
| intro | Pick the one that's closest, even if none of them is exactly right. |

### Between-Place options (the four cards)

| optionKey | Label | Stored as `state.arrivalVector` | Memory importance |
|---|---|---|---|
| lost | I lost something. | lost | 0.85 |
| building | I'm building something. | building | 0.85 |
| becoming | I'm becoming someone. | becoming | 0.85 |
| unknown | I don't know yet. | unknown | 0.85 |

### REZZIE mirror responses (one-line acknowledgments — no interrogation)

| arrivalVector | Mirror response |
|---|---|
| lost | Okay. Loss is its own kind of carrying. |
| building | Okay. Building is heavier than it looks. |
| becoming | Okay. Becoming is the slow one. |
| unknown | Okay. Not-knowing is allowed here. |

### Memory read scopes

| Scope |
|---|
| profile |
| narrative |

### Memory write scopes

| Scope | What gets written |
|---|---|
| narrative | the arrival vector as a 1-sentence narrative memory (importance 0.85) |
| state | the chosen frame on `sessions.state.arrivalVector` |
| event | choice.selected, chamber.entered |

---

## Chamber 3 — Present State

| Field | Value |
|---|---|
| key | present-state |
| title | Present State |
| agentKey | rezzie |
| next | memory-root |
| entitlementsRequired | (none) |
| input.kind | freeform text |
| input.required | no (skippable) |
| input.maxLength | 600 |

### Prompts

| Slot | Copy |
|---|---|
| intro | What's alive right now? |
| question (agent-selected by arrivalVector) | see table below |

### Agent-selected question by arrival vector

| arrivalVector | Question REZZIE asks |
|---|---|
| lost | What's still here that you didn't expect to keep? |
| building | What's the part you keep coming back to when no one is watching? |
| becoming | What's the version of you that's just-barely-showing-up these days? |
| unknown | If you had to name the weather of this week, what would you call it? |
| (fallback) | What's alive for you right now — not the loudest thing, the truest one? |

### Memory read scopes

| Scope |
|---|
| profile |
| narrative |
| state |

### Memory write scopes

| Scope | What gets written |
|---|---|
| state | the present texture (importance 0.50–0.70 depending on signal strength) |
| narrative | only if a strong arc emerges (importance ≥ 0.70) |
| event | intake.captured, chamber.entered |

---

## Chamber 4 — Memory Root

| Field | Value |
|---|---|
| key | memory-root |
| title | Memory Root |
| agentKey | rezzie |
| next | trajectory-branch |
| entitlementsRequired | (none) |
| input.kind | freeform text |
| input.required | no (skip affordance shown) |
| input.maxLength | 800 |

### Prompts

| Slot | Copy |
|---|---|
| intro | What keeps coming back? |
| question 1 | What is the thing that keeps coming back to you — not the loudest, the most repeated? |

### Skip affordance

| Field | Value |
|---|---|
| label | I want to skip this one. |
| writes event | skip.intent |
| writes memory | (none — silence is allowed) |

### Memory read scopes

| Scope |
|---|
| profile |
| narrative |
| state |

### Memory write scopes

| Scope | What gets written |
|---|---|
| narrative | the returning pattern (importance ≥ 0.80) |
| event | intake.captured |

---

## Chamber 5 — Trajectory Branch

| Field | Value |
|---|---|
| key | trajectory-branch |
| title | Trajectory Branch |
| agentKey | rezzie |
| next | living-invitation |
| entitlementsRequired (base layer) | (none — base is always shown) |
| input.kind | freeform text |
| input.required | no |
| input.maxLength | 800 |

### Prompts (base layer — always shown)

| Slot | Copy |
|---|---|
| intro | Where's the becoming pointing? |
| framing | Between-Place + I-Ching framing only in v1 base. Copy derived from prior three chambers by the agent. |
| question 1 | If this next year went better than you expect, what would be different — not in what you have, but in who you've become? |

### Add-on slot (entitlement-gated)

| Field | Value |
|---|---|
| slot | deeperTrajectoryLayer |
| entitlementKey | astro-addon |
| when owned (v1) | Render placeholder "deeper layer" panel. Copy frames it as "engine arriving v1.1 — your add-on unlocks it the moment it ships." |
| when owned (v1.1) | Render the real natal/ephemeris layer once the engine ships. |
| when not owned | Render an inline CTA: "Unlock the deeper trajectory layer ($X) — engine arrives v1.1, your access starts now." Tap → Stripe checkout for the `astro-addon`. |
| writes event | entitlement.checked, paywall.shown (if shown), paywall.tapped (if tapped) |

### Memory read scopes

| Scope |
|---|
| profile |
| narrative |
| state |
| trajectory |

### Memory write scopes

| Scope | What gets written |
|---|---|
| trajectory | the emerging direction (importance 0.70–0.90) |
| event | intake.captured, entitlement.checked, paywall.shown (conditional), paywall.tapped (conditional) |

---

## Chamber 6 — Living Invitation

| Field | Value |
|---|---|
| key | living-invitation |
| title | Living Invitation |
| agentKey | coach |
| next | (null — terminal) |
| entitlementsRequired | (none) |
| input.kind | email + confirm |
| input.required | email required to receive the Snapshot by email; export-on-screen works without it |

### Prompts

| Slot | Copy |
|---|---|
| intro | Here's what I'm seeing. |
| reveal lead-in | This is your SoulSeed Snapshot. Read it once before you decide what to do with it. |
| email ask | Where should I send your HURL so you can come back when something changes? |
| HURL frame | This is your permanent return address. It will remember you. |
| close (return seed) | Come back when something changes. I'll ask you what. |

### Outputs produced in this chamber

| Output | Where it goes |
|---|---|
| SoulSeed Snapshot (5 fields + HURL, optional `deeperTrajectoryTeaser` if user owns `astro-addon`) | `artifacts` table, row of type `soulseed-snapshot` |
| HURL minted/refreshed | `hurls` table; displayed to user |
| Email captured | `users.email` set on existing anonymous row (no row migration) |

### Snapshot field sources (so the artifact is reproducible, not hallucinated)

| Snapshot field | Derived from |
|---|---|
| identitySignal | top narrative-scope memories (importance desc) |
| presentState | top state-scope memories from chamber 3 |
| returningPattern | top narrative-scope memory written by chamber 4 |
| emergingTrajectory | top trajectory-scope memory written by chamber 5 |
| firstInvitation | COACH agent generates 1–2 sentence next-step from the four above |
| hurl | derived from sessionId + current state coordinate (no LLM) |
| deeperTrajectoryTeaser (optional) | only present if user owns `astro-addon`; placeholder copy in v1, real layer v1.1 |

### Payment slot inside this chamber (depends on Q2b)

| Q2b resolution | What this chamber shows after the Snapshot reveal |
|---|---|
| live at launch | Base $27 Stripe checkout offered after Snapshot reveal so value is felt first. |
| free beta | "Join the waitlist for the paid full version" CTA instead of checkout. |
| (default for build, until Brooks answers) | Build the slot as `payment-or-waitlist`, driven by an env flag `PAYMENT_MODE=live|beta`. No section is blocked. |

### Memory read scopes

| Scope |
|---|
| profile |
| narrative |
| state |
| trajectory |
| event |

### Memory write scopes

| Scope | What gets written |
|---|---|
| narrative | the crystallization COACH produces (importance 0.80–0.95) |
| artifact | pointer to the Snapshot row in `artifacts` |
| event | artifact.created, email.captured (if provided), chamber.entered, payment.intent (conditional), paywall.shown (conditional) |

---

## Cross-cutting copy rules (apply to every chamber)

| Rule | What it means |
|---|---|
| Never say "welcome back" | On return-mode threshold, REZZIE's opener is derived from `resumeContext`. See `docs/product-one-soulseed.md` → Return loop. |
| Mirror the user's frame, don't interrogate | Especially Chambers 2 and 3. One-line acknowledgments, not therapist-style probing. |
| Don't ask the LLM to remember | Identity statements derive from stored memories. The agent formats; it doesn't invent. |
| English-only in v1 | Localization is parked. |
| One question per chamber whenever possible | Chambers 3–5 are single-question. Threshold has the name ask only if frictionless. |

---

## Return-mode opener variants (used by Chamber 1 on return visits)

These are not part of the manifest itself — they live in REZZIE's prompt (S19). Drafting here for completeness so S19 has the data ready.

| Prior arrivalVector | Return-mode opener |
|---|---|
| lost | Last time, you were carrying something you hadn't put down. What's different now? |
| building | Last time, you were building. What did the build teach you? |
| becoming | Last time, you were becoming someone. Who showed up since? |
| unknown | Last time, you didn't know yet. Has anything quieted? |
| (fallback) | Last time you were between worlds. What changed? |

---

## What Code does with this next (S4b)

Wire this draft into `packages/product-manifests/src/soulseed-compass.manifest.ts` as a typed `ProductManifest` from `@holo/contracts`. Validate at module load with `ProductManifestSchema.parse()`. Confirm chamber order resolves `threshold → identity-seed → present-state → memory-root → trajectory-branch → living-invitation → null` via `getNextChamber`. The Between-Place options, agent-selected questions, add-on slot, and return-mode openers should all be data on the manifest object — not hardcoded in components or prompts.
