# Skin Manifest spec

The schema that defines a **skin / instance** as data, so a persona is one
manifest and the **Core engine never names a persona**. This is what makes
"skin it for X" true rather than aspirational. It extends the existing
`ProductManifest` (S4b) with an `agents` declaration.

Version 1.0 · companion to `docs/holocanvas-realignment.md`.

---

## Why a manifest (not code)

The engine consumes a manifest and runs the circulation. A new skin (REZZIE,
QUEST, COACH, a neutral Guide) ships as a new manifest: its conductor voice, its
chamber copy, its theme, which agent runs each chamber, and whether that agent is
mock or live. The engine reads `manifest.agents[chamber.agentKey]` — it does not
know the names "rezzie" or "coach".

---

## Schema

```ts
ProductManifest = {
  productKey: string,           // instance id, e.g. "soulseed", "resonantbrand", "healingquest"
  name: string,
  version: string,
  theme?: string,               // visual skin key (e.g. "gold-void"); optional

  rootHolon: Holon,

  // The personas this skin can run. Keyed by agentKey; chambers reference these.
  agents: {
    [agentKey: string]: {
      role: string,             // human label, e.g. "Threshold conductor"
      systemPrompt: string,     // the persona's voice (the skin owns this)
      returnPrompt?: string,    // appended on return visits
      output: "agent" | "synthesis",   // which engine output shape it yields
      readScopes: MemoryScope[],        // default memory scopes for this agent
      mode?: "mock" | "live",   // per-agent override; else env AGENT_MODE
    }
  },

  // The scroll. Each chamber names which agent conducts it.
  chambers: Array<{
    key: string,
    title: string,
    agentKey: string,           // must exist in `agents`
    memoryReadScopes: MemoryScope[],
    memoryWriteScopes: MemoryScope[],
    next: string | null,
    prompts: { intro: string, questions: string[] },
    entitlementsRequired?: EntitlementKey[],
    addOns?: Array<{ entitlementKey: EntitlementKey, slot: string }>,
  }>,

  // --- reserved for later (documented now so the shape is stable) ---
  activeInputs?: string[],       // which of the six field inputs feed this skin
  domainWeights?: Record<string, number>,  // HOLOBAGUA 8-domain emphasis
}
```

**Engine outputs (engine-level, persona-agnostic):**
- `output: "agent"` → the conductor's structured reply (message, insight, detectedThemes, coherenceDelta, memoryWrites, statePatch, suggested next). Used by chambers 1–5.
- `output: "synthesis"` → the same plus the **Compass Snapshot** + return seed. Used by the final chamber.

The engine validates `chamber.agentKey ∈ keys(agents)` and `agent.output` against
the two known output shapes. Adding a skin never changes these.

---

## Example A — SoulSeed Compass (REZZIE skin)

```ts
{
  productKey: "soulseed",
  name: "SoulSeed Compass",
  theme: "gold-void",
  agents: {
    rezzie: {
      role: "Threshold conductor (chambers 1–5)",
      systemPrompt: REZZIE_SYSTEM_PROMPT,   // from @holo/agent-prompts
      returnPrompt: REZZIE_RETURN_APPENDIX,
      output: "agent",
      readScopes: ["profile","state","narrative","trajectory"],
    },
    coach: {
      role: "Synthesis at the Living Invitation",
      systemPrompt: COACH_SYSTEM_PROMPT,
      output: "synthesis",
      readScopes: ["profile","narrative","state","trajectory","event"],
    },
  },
  chambers: [ /* threshold→…→living-invitation, agentKey: rezzie×5, coach×1 */ ],
}
```

## Example B — a neutral "Guide" skin (the seam test)

Same engine, zero engine code — only this manifest:

```ts
{
  productKey: "guide",
  name: "SoulSeed Compass (neutral)",
  theme: "gold-void",
  agents: {
    guide: {
      role: "Neutral conductor",
      systemPrompt: "You are a calm, neutral guide. One observation, one question. No persona, no flourish.",
      output: "agent",
      readScopes: ["profile","state","narrative","trajectory"],
    },
    synthesizer: {
      role: "Neutral synthesis",
      systemPrompt: "Gather what was noticed and hand back a small, grounded map.",
      output: "synthesis",
      readScopes: ["profile","narrative","state","trajectory","event"],
    },
  },
  chambers: [ /* same six, agentKey: guide×5, synthesizer×1 */ ],
}
```

If Example B runs a full journey with **no engine change**, the Core is exactly the
skinnable engine we set out to build. That is the acceptance test for S31.

---

## How a new instance gets added (the whole recipe)

1. Write a manifest (copy an example, change `productKey`, `agents`, `chambers`, `theme`).
2. Register it in the manifests package (one export).
3. Point the app at it (`productKey`).
4. Optionally set each agent's `mode` to `live` and add a model key.

No engine edits. That's the contract.

---

## What Code does with this next

Implement per `docs/holocanvas-realignment.md` steps 1–6: open `agentKey`/`productKey`,
add `agents` to the manifest + the registry that reads it, generic mock/fallback,
and a neutral second skin proving the seam.
