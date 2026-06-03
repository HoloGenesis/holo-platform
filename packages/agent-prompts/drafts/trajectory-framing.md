# trajectory-framing.md — Trajectory chamber framing copy (draft for S24)

Narrative copy and UX strings for the Trajectory Branch chamber (chamber 5) of SoulSeed Compass. Two layers in v1: the **base framing** (always shown — Wanderer / Between-Place language, no compute) and the **astro-addon locked layer** (gated by the `astro-addon` entitlement; engine ships in v1.1).

Version: 1.0 · v1 scope

---

## How this file is used

This is registry content, the same shape as `rezzie.md` and `coach.md`:

- **Base framing** strings are pulled by REZZIE in chamber 5 as `prompts.framing` content, branched by `state.arrivalVector`. The agent composes the chamber's `message` using these as raw material — they are not literal output, they're the orientation language REZZIE braids with the user's prior signal.
- **Astro-addon copy + UX states** are rendered by the SoulSeed Compass frontend in chamber 5, gated by `entitlements/get`. These are literal UI strings.
- **Parked** content describes the v1.1 engine work and lives here only so v1 doesn't accidentally start building it.

REZZIE's voice rules (from `rezzie.md`) apply to every line in this file: gentle, present, perceptive, never salesy, never therapist-y, no praise filler, no "totally valid," no soothing, no congratulating. Mirror the shape, don't explain.

---

## The doctrine in one paragraph (v1)

The Trajectory chamber is not astrology. It is **orientation language**. The user has named where they came from (arrival vector), what's alive now, and the pattern that returns. Here we frame where the becoming is pointing — using the I-Ching's *Wanderer* (Lü / 旅, hexagram 56) as the borrowed vocabulary: the traveler in unfamiliar terrain, carrying little, attended to small kindnesses, taking the next step that is actually available. No charts, no houses, no ephemeris. The point is recognition, not reading. The base layer is for everyone. The astro-addon — a paid entitlement — declares that the user wants a deeper layer; in v1 we acknowledge that intent with a placeholder and reserve the real layer for v1.1 once the engine exists.

---

## Base framing copy (always shown)

These strings are the raw material REZZIE uses when composing chamber 5's `message`. They are *not* literal output. REZZIE braids them with the user's prior signal (arrival vector, present state, returning pattern). Output stays under four sentences per `rezzie.md`.

### Universal Wanderer/Between-Place orientation (used in every framing)

| Slot | Copy |
|---|---|
| frame-1 | You are in the Between-Place. The map you had no longer matches the ground. |
| frame-2 | The old vocabulary calls this *the Wanderer* — the one who travels light, attended to small kindnesses, taking the next step that's actually available. |
| frame-3 | The Wanderer doesn't know the destination. The Wanderer knows the next step. |
| frame-fallback | The direction is faintly drawn. Walk toward the part that's already true. |

REZZIE picks one or weaves two into a single line. Never recites all of them.

### Per-arrival-vector framing

REZZIE selects from these based on `state.arrivalVector`. Each is one or two short lines, written so the user feels named without being analyzed.

#### arrivalVector = **lost**

| Slot | Copy |
|---|---|
| line-1 | What you lost is part of the carrying. The Wanderer doesn't put it down — the Wanderer learns to walk with it. |
| line-2 | The next direction usually isn't a destination. It's a smaller bag. |
| line-3 | When you've lost the map, the next step is still a step. The terrain teaches the route. |

#### arrivalVector = **building**

| Slot | Copy |
|---|---|
| line-1 | What you're building is asking for a smaller hand than you've been using. |
| line-2 | The Wanderer builds by attending — one room, one beam, one true thing. |
| line-3 | The thing you keep coming back to when no one's watching: that's the build. Everything else is scaffolding. |

#### arrivalVector = **becoming**

| Slot | Copy |
|---|---|
| line-1 | Becoming is the slow one. The Wanderer doesn't arrive at the new self — the Wanderer keeps walking, and the self updates underneath. |
| line-2 | The person you're becoming is already making small choices. Notice which ones. |
| line-3 | The shape of who you're becoming is in the things you've stopped pretending to want. |

#### arrivalVector = **unknown**

| Slot | Copy |
|---|---|
| line-1 | Not-knowing is its own posture. The Wanderer doesn't fill the gap; the Wanderer waits inside it. |
| line-2 | The Between-Place doesn't owe you a direction yet. It owes you the next honest sentence. |
| line-3 | Sometimes the trajectory is *toward knowing* — which is its own slow weather. |

### The chamber's question (repeated for context; lives in the manifest)

> If this next year went better than you expect, what would be different — not in what you have, but in who you've become?

REZZIE asks this verbatim or with a small contextual lead-in drawn from the framing above. The question itself does not vary by arrival vector.

### Composition rules for REZZIE

1. Read `state.arrivalVector` and the top trajectory/narrative memories.
2. Pick **one** line from the Universal frame and **one** line from the matching arrival-vector frame. (Or one of each, paraphrased; the user shouldn't hear the seams.)
3. Pose the chamber's question.
4. Keep total `message` under four sentences. The framing chamber is the only place REZZIE is allowed slight prose; resist the temptation anyway.
5. **Do not name astrology, the I-Ching, hexagrams, or the Wanderer by name** in the user-facing `message`. The Wanderer is REZZIE's internal vocabulary; the user receives the texture, not the citation. *"You are in the Between-Place"* is allowed and intended. *"This is hexagram 56, the Wanderer"* is not allowed and would break voice.

---

## Astro-addon (v1.1) — locked deeper layer

In v1, the astrology *engine* doesn't exist. What exists is a paid entitlement (`astro-addon`) that signals the user wants the deeper layer. The chamber acknowledges that signal with a labelled placeholder. The engine ships in v1.1.

### UX states (rendered by the frontend in chamber 5)

The frontend reads `entitlements/get` for the user and renders one of three states inside the chamber, below REZZIE's base framing message.

#### State A — user does **not** own `astro-addon`

| Slot | Copy |
|---|---|
| header | A deeper trajectory layer |
| body | The Between-Place orientation above is the base layer. A deeper layer of trajectory work — natal patterning, transit timing, the slower currents underneath the choices — arrives as the engine in v1.1. The add-on holds your seat. |
| cta-primary | Unlock the deeper layer |
| cta-fineprint | Your access starts now. The deeper layer opens when the engine ships in v1.1. |
| cta-action | open Stripe checkout for `astro-addon` |
| event-on-show | `paywall.shown { slot: "deeperTrajectoryLayer" }` |
| event-on-tap | `paywall.tapped { slot: "deeperTrajectoryLayer" }` |

#### State B — user **owns** `astro-addon`, engine is **not yet** shipped (v1)

| Slot | Copy |
|---|---|
| header | Deeper trajectory layer — reserved |
| body | Your access is in place. The engine that draws this layer arrives in v1.1. When it ships, this room opens automatically — you won't be asked again. |
| sub-note | A note on the day it ships: this is the slower work. It will be quiet, and it will take more than one sitting. We're not in a hurry. |
| cta-primary | (none — informational state) |
| event-on-show | `entitlement.checked { key: "astro-addon", state: "reserved" }` |

#### State C — user owns `astro-addon`, engine **is** shipped (v1.1)

| Slot | Copy |
|---|---|
| header | Deeper trajectory layer |
| body | *(rendered by v1.1's engine — see "Parked" section below)* |
| event-on-show | `entitlement.checked { key: "astro-addon", state: "rendered" }` |

In v1, only states A and B can occur. State C exists in this file so the routing logic in S22/S24-frontend doesn't need to be rewritten when v1.1 ships — the slot is already shaped.

### Snapshot field tie-in (chamber 6)

Per `coach.md`, `SoulSeedSnapshot.deeperTrajectoryTeaser` is populated **only** if the user owns the entitlement at chamber 6. The v1 value is the fixed line:

> Your deeper trajectory layer unlocks when the engine ships in v1.1. Your access starts now; the room opens then.

When the engine ships in v1.1, this teaser is replaced with a real one-line excerpt from the engine's output. The replacement happens in `coach.md`, not here.

---

## What the user does not see

Three things stay out of the user-facing copy in v1:

1. **No naming of the I-Ching, the Wanderer, hexagram 56, or any system of divination.** The framing borrows the posture; the citation stays internal.
2. **No astrology vocabulary** (natal chart, transits, houses, planets, signs, ascendant, etc.) anywhere in the base layer. These words only appear in the **astro-addon** UX strings above, and even there only the abstract terms ("natal patterning," "transit timing") — no specific charts or claims.
3. **No promises about what the v1.1 engine will compute.** The locked-layer copy is intentionally vague about output to avoid setting an expectation v1.1 has to honor verbatim.

---

## Parked — needs ephemeris engine (do not build in v1)

Everything below is v1.1 work. In v1, the chamber renders states A and B above; nothing in this section is wired.

### The engine itself

- **Birth-time / timezone capture.** A small intake (date, time, place) collected only from users who own the entitlement and have advanced past chamber 5 of a prior run. Designed to feel like a quiet aside, not a form.
- **Ephemeris computation.** Library choice TBD. Likely candidates: Swiss Ephemeris (via a server-side binding), or a hosted API. Must be deterministic and reproducible across runs.
- **House system + ascendant.** Default to Placidus + topocentric ascendant unless we learn otherwise; the choice is a single config knob, not user-facing.
- **Transits to natal.** The "deeper trajectory layer" is *not* a static natal reading. It's the natal pattern in conversation with the current moment — a small set of active transits, written as one short paragraph in REZZIE's voice. The compute happens server-side; the prose is generated by an agent (likely a new `ASTRO` agent or COACH with an astro context) constrained to the engine's actual output.
- **No daily horoscopes, no compatibility, no predictions.** This is trajectory framing with sharper instruments, not a forecast service.

### The agent that consumes the engine

- A new prompt registry file (`astro.md`) will define the agent that takes engine output as structured `context.astro` and emits one short paragraph in voice. The agent does not invent astrological facts — every claim is grounded in the engine's structured output, same reproducibility rule as REZZIE/COACH.
- The agent will likely run **in chamber 5** for entitlement holders, replacing State B's informational copy with a real reading. The Snapshot's `deeperTrajectoryTeaser` (chamber 6) will then be a one-line distillation of that paragraph.

### UX work for v1.1

- Replace State B's "reserved" body with the engine's rendered paragraph.
- Add a small "the engine that drew this" disclosure for transparency.
- Decide whether the deeper layer is re-rendered on every return or only when transits meaningfully shift; this is a product question, not built in v1.

### Data shapes that v1.1 will add (not in v1 contracts)

- `NatalSnapshot` — the engine's structured output: positions, aspects, active transits at compute time.
- `AstroReadingContext` — the bundle passed to the astro agent (NatalSnapshot + relevant memories).
- A new endpoint `astro/compute` and a `core/astro.compute(...)` library function.

None of the above ships in v1. The entitlement exists, the slot exists, the placeholder copy exists — the engine does not.

---

## What Code does with this next (S22, S24-frontend, S27)

- **S22** wires `entitlements/get` into the chamber-progression hook so the frontend can render state A vs. state B at chamber 5.
- **S24-frontend** (already labelled S24 in the routing table — this Cowork section produces the copy; the matching Code section renders it) implements the three-state slot below REZZIE's base framing message. Only states A and B are reachable in v1.
- **S27** wires the Stripe checkout for `astro-addon` behind the State A `cta-primary` action, and the Stripe webhook → `entitlements/grant` flow that flips the user from state A to state B.
- **REZZIE prompt assembly (S20)** pulls this file's "Base framing copy" tables into the chamber-5 system message when `chamberKey === "trajectory-branch"`. The astro-addon UX strings are *not* passed to REZZIE — they're rendered by the frontend.
- **`coach.md`** already references the fixed `deeperTrajectoryTeaser` line; that string lives in `coach.md` and is repeated here in the "Snapshot field tie-in" section for consistency. Do not duplicate it a third time at code-time — pull it from one place.

If the framing copy needs to evolve, edit this file and the Code that consumes it picks it up automatically through the registry import. Never inline these strings into a component or route file.
