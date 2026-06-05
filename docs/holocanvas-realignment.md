# HOLOCANVAS — Core / Skin / Instance realignment

Source of truth for the refactor that re-centers the build on the original vision:
a **standalone, skinnable SOULSEED COMPASS engine** — independent of any one
persona (REZZIE) or product line (RESONANTBRAND). Written from a static audit of
the live v0.01 codebase.

Version 1.0 · the "we lost the framing, not the architecture" correction.

---

## The drift, in one line

**REZZIE got promoted from input to protagonist.** "Flip REZZIE live" became the
hero milestone. It's backwards: the hero is the **Core engine (HOLOTORUS)**; REZZIE
is the **first skin**. The infographic is the spec, and it's unambiguous —
"REZZIE CONVERSATION" is *one of six inputs* feeding the field; the engine is the
Sacred Heart; the product is SOULSEED COMPASS.

The good news, confirmed by the audit: the **construct is sound**. The circulation
engine is genuinely persona-agnostic. The leak is in one layer (the agent harness),
and it's bounded.

---

## The three layers

| Layer | What it is | Persona/instance-aware? |
|---|---|---|
| **CORE ENGINE** (HOLOTORUS) | Memory lattice, HURL minting, snapshot derivation, the circulation (converse → extract → map → visualize → synthesize → continue), sessions/events/orchestration mechanics, identity + merge, payment mechanics, the DB, the SDK transport | **No.** Knows nothing of REZZIE or any product. |
| **SKIN / PERSONA** | The conductor's voice (REZZIE, COACH, QUEST, or a neutral guide), its system prompt, chamber copy, theme, which inputs are active, the agent's mode (mock/live) | **Yes — but as a manifest, not code.** |
| **PRODUCT INSTANCE** | Picks engine + skin + domain emphasis + paywall config (RESONANTBRAND, SCALEHOLO, RESONANTFAMILY, HOLOHEALINGQUEST…) | **Yes — config.** |

The rule: **if a persona's name, voice, or copy appears in CORE ENGINE code, that's
the leak.** Personas live entirely in the middle row, as data.

---

## Audit results (what the code actually is)

✅ **CLEAN — persona/instance-agnostic (the hard part, intact):**
`core/sessions`, `core/events`, `core/memory` (the lattice), `core/hurl` (minting),
the orchestration mechanics, `core/users` (merge), payment mechanics, the pg
adapter/DB, and the `@holo/sdk` transport. No persona references in any of this logic.

✅ **ALREADY IN THE RIGHT LAYER (data, not code):**
Chamber flow + chamber copy live in the `soulseed-compass` **manifest**. REZZIE/COACH
prompt text lives in `@holo/agent-prompts`. The *scroll content* seam is clean.

⚠️ **LEAKED — persona wired into the engine instead of declared by the skin:**
1. `@holo/contracts` hardcodes `AGENT_KEYS = ["rezzie","coach","ang3l"]` — the engine's type system enumerates personas.
2. `core/agents/registry.ts` hardcodes a `rezzie`/`coach` registry.
3. `core/agents/mock.ts` + `fallback.ts` contain REZZIE/COACH voice **and** SoulSeed chamber copy ("between worlds", `arrivalVector`) inside engine code.
4. Prompt assembly (`composePrompt`) selects a persona by literal `"rezzie"|"coach"`.

(Type names like `SoulSeedAgentOutput`/`SoulSeedSnapshot` name the **engine product's
output** — the SOULSEED COMPASS — not a persona, so they're legitimately engine-level.
An optional cosmetic rename to `AgentOutput`/`CompassSnapshot` is noted as a future
nicety, not part of this refactor.)

---

## The seam test (the one test that proves the vision)

> **Stand up a second skin on the same engine — changing only a manifest, zero engine code.**

- **Today: FAILS, narrowly.** Adding a persona (QUEST) needs ~3 engine touches: the `AgentKey` enum, a `registry` entry, and mock/fallback copy.
- **After this refactor: PASSES.** A new skin = a new manifest (its conductor, prompt, theme, active inputs, agent mode). No engine code.

This refactor exists to make that test pass — nothing more, nothing less.

---

## The de-persona refactor (ordered, bounded — engine circulation untouched)

1. **Open the persona vocabulary.** `agentKey` and `productKey` become free strings (validated against the active manifest), not closed enums of named personas/products.
2. **Manifest declares its agents.** Extend the manifest with `agents: { <key>: AgentSpec }` (role, `systemPrompt`, optional `returnPrompt`, `output` kind, `readScopes`). The chamber's `agentKey` resolves into this map.
3. **Registry reads the manifest.** `getAgent(manifest, key)` instead of a hardcoded `rezzie`/`coach` table.
4. **Generic mock + fallback.** The engine's dev mock and safe fallback derive a schema-valid output from the chamber's own copy + the user input — **no persona/instance strings in engine code**. Persona flavor comes from prompts (live) or from skin-provided copy.
5. **Prompts move to the skin.** REZZIE/COACH prompt text stays in `@holo/agent-prompts` but is **referenced by the manifest** (the skin owns its voice); the engine only reads `manifest.agents[key].systemPrompt`.
6. **Prove it.** Add a **neutral second skin** manifest (a persona-less "Guide") and a test that runs a full agent turn against it with zero engine changes. That green test *is* the seam test.

Everything in the ✅ CLEAN list above does not change.

---

## Corrected roadmap

1. **Seam test** ← the next milestone (this refactor + neutral second skin).
2. **Pick the lead instance/skin** to flesh out (REZZIE for RESONANTBRAND).
3. **Flip that skin's agent to live** (the manifest sets `mode: live` + its prompt). "Live AI" = one skin's slot filled, not "REZZIE the product goes live."
4. **Small instrumented beta** measuring HURL return rate. Downstream of the seam test, not parallel to it.

---

## How Brooks's product flow maps to the layers

> meeting (HOLOSCROLLY) → interview → the scroll evolves to an intriguing state →
> user gives birthdate/place/time + pays → deeper, richer SOULSEED COMPASS →
> hub of personas (talk to REZZIE / QUEST / COACH …) → REZZIE built first.

- **The interview + base compass** = the **engine's standalone product**, run by a **neutral conductor** (proves engine independence from REZZIE). This is also the "just a brilliant SoulSeed Compass standalone" option — same build.
- **The upsell** (birth data + payment → deeper compass) = the **astro-addon entitlement** already built; the natal **engine** is v1.1.
- **The persona hub** = the rich compass routes to **skins you talk to** (REZZIE/QUEST/COACH), each an agent on the **same brain + memory**.
- **REZZIE first** = the first fully-fleshed skin, after the seam is proven.

One path serves both of Brooks's options: build the neutral standalone compass → it *is* the seam test → then REZZIE becomes skin #1 + the hub.

---

## What Code does with this next

Implement steps 1–6 above (see `docs/skin-manifest-spec.md` for the exact manifest
schema). Keep the circulation engine and the live deployment working throughout;
ship behind the same manual deploy.
