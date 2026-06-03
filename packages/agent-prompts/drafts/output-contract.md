# output-contract.md — agent structured output spec (draft for S19)

Human-readable contract for the two v1 agent outputs: `SoulSeedAgentOutput` (REZZIE) and `CoachingAgentOutput` (COACH). Code wires these into `packages/contracts` as Zod schemas. This file is the human reference; the Zod schemas are the runtime truth.

Version: 1.0 · v1 scope

---

## Why this file exists

Both REZZIE and COACH return JSON, not prose. The prompt files (`rezzie.md`, `coach.md`) instruct the model to emit a specific shape; this file specifies that shape so:

- **`packages/contracts`** can encode it as Zod (S2).
- **`core/agents.run`** can validate the model's output against the schema before returning (S20).
- **`core/orchestration.next`** can persist `memoryWrites[]` and apply `statePatch` (S17).
- **`core/artifacts.create`** can pull the `snapshot` payload out of the COACH response and write it to the `artifacts` table (S23).
- **Mock mode** can hand-write valid responses per chamber so the walking skeleton runs without a live LLM.

If the model returns malformed JSON or an invalid shape, `core/agents.run` retries once with a "your last response did not match the schema; here's the schema; try again" follow-up. After the second failure it falls back to a safe canned response so the user is never left staring at an empty chamber.

---

## Shared types

Used by both outputs. These map 1:1 to existing types in `docs/api-contracts.md`.

```
ProductKey      = "soulseed" | "holobook" /* future */
ChamberKey      = "threshold" | "identity-seed" | "present-state" |
                  "memory-root" | "trajectory-branch" | "living-invitation"
AgentKey        = "rezzie" | "coach" | "ang3l" /* parked */
MemoryScope     = "profile" | "state" | "narrative" | "trajectory" |
                  "event"   | "product" | "artifact"
EntitlementKey  = "astro-addon" /* future: "coach-pro", ... */
HurlPath        = `hurl://${ProductKey}/${ChamberKey}/state-${number}/coherence-${number}`
```

### `MemoryWrite`

```
{
  scope: MemoryScope,
  content: string,                   // 1–3 sentences, grounded in user input
  contentJson: object | null,        // optional structured payload
  importance: number                 // 0.00–1.00 inclusive
}
```

Constraints:
- `content` non-empty, ≤ 600 chars.
- `importance` must be in `[0.00, 1.00]`.
- If `importance < 0.10`, the write is dropped silently by `core/memory.upsert` (don't write noise).

### `SessionStatePatch`

```
Partial<SessionState>
```

Where:

```
SessionState = {
  currentChamber:       ChamberKey,
  coherence:            number,             // float, 0..1
  emergencePressure:    number,             // float, 0..1
  chambersVisited:      ChamberKey[],
  arrivalVector?:       "lost" | "building" | "becoming" | "unknown",
  completedFlow?:       boolean,
  lastSnapshotAt?:      string,             // ISO
  custom:               Record<string, unknown>
}
```

The agent's `statePatch` is **shallow-merged** by `core/orchestration.next`. Arrays are replaced, not appended. The agent does not set `currentChamber` directly — the orchestration step computes the next chamber from `suggestedNextChamber` + the manifest. The agent does not set `chambersVisited` — the orchestration step appends.

---

## `SoulSeedAgentOutput` (REZZIE — chambers 1–5)

```
{
  message: string,                          // what REZZIE says to the user; 1–4 short sentences
  insight: string,                          // 1-line crystallization, third person, for memory
  detectedThemes: string[],                 // 0–4 lowercase snake_case tags
  coherenceDelta: number,                   // -0.20..+0.20 inclusive
  memoryWrites: MemoryWrite[],              // 0 or more
  statePatch: SessionStatePatch,            // shallow-merged
  suggestedNextQuestion: string | null,     // optional follow-up before advancing
  suggestedNextChamber: ChamberKey | null   // optional override of manifest's next
}
```

### Field-by-field

| Field | Type | Required | Constraints |
|---|---|---|---|
| `message` | string | yes | 1–4 sentences. Non-empty. ≤ 800 chars. UI renders verbatim. |
| `insight` | string | yes | Third person. ≤ 280 chars. Stored as a `narrative`-scope memory by orchestration if no explicit narrative write exists. |
| `detectedThemes` | string[] | yes | 0–4 entries. Each ≤ 32 chars, lowercase, snake_case (`/^[a-z][a-z0-9_]*$/`). |
| `coherenceDelta` | number | yes | `-0.20 ≤ x ≤ +0.20`. Default toward small magnitudes. |
| `memoryWrites` | MemoryWrite[] | yes | 0–6 entries. Each grounded in user input or memory snapshot. |
| `statePatch` | object | yes | Shallow-merge. May be `{}` (empty object). |
| `suggestedNextQuestion` | string \| null | yes | Use sparingly. ≤ 280 chars. |
| `suggestedNextChamber` | ChamberKey \| null | yes | If non-null, must be a valid `ChamberKey`. Orchestration may still override. |

### Validation rules (enforced by Zod / `core/agents.run`)

1. Strict object — no extra fields.
2. `coherenceDelta` clamped to `[-0.20, +0.20]`; out-of-range values are clamped and a warning is logged.
3. Each `memoryWrite.importance` clamped to `[0.00, 1.00]`.
4. `detectedThemes` deduplicated, lowercased.
5. `statePatch` keys filtered to known `SessionState` keys (unknown keys go to `custom`).
6. `suggestedNextChamber`, if non-null, must be in the manifest's chamber set.

### Example (chamber 2 — Identity Seed, user chose "building")

```
{
  "message": "Okay. Building is heavier than it looks.",
  "insight": "User arrived in the building frame; carrying load without naming it yet.",
  "detectedThemes": ["building", "founder", "liminal"],
  "coherenceDelta": 0.05,
  "memoryWrites": [
    {
      "scope": "narrative",
      "content": "User arrived as 'building' — making something they haven't fully named.",
      "contentJson": { "arrivalVector": "building" },
      "importance": 0.85
    },
    {
      "scope": "state",
      "content": "Current frame: building.",
      "contentJson": null,
      "importance": 0.70
    }
  ],
  "statePatch": { "arrivalVector": "building" },
  "suggestedNextQuestion": null,
  "suggestedNextChamber": null
}
```

---

## `CoachingAgentOutput` (COACH — chamber 6 only)

```
{
  message: string,                          // lead-in to the Snapshot; 1–3 short sentences
  snapshot: SoulSeedSnapshot,               // the artifact payload
  insight: string,                          // third person, for memory
  detectedThemes: string[],                 // 0–4 lowercase snake_case tags
  coherenceDelta: number,                   // +0.05..+0.25 typical at this chamber
  memoryWrites: MemoryWrite[],              // 1+ required (see below)
  statePatch: SessionStatePatch,            // at minimum { "completedFlow": true }
  returnSeed: string                        // 1 sentence; plants the next return
}
```

### `SoulSeedSnapshot`

```
{
  identitySignal:           string,         // 1 sentence
  presentState:             string,         // 1 sentence
  returningPattern:         string,         // 1 sentence
  emergingTrajectory:       string,         // 1 sentence
  firstInvitation:          string,         // 1–2 sentences; concrete next step
  hurl:                     HurlPath,       // copy from context.hurl verbatim
  deeperTrajectoryTeaser:   string | null   // only non-null if user owns "astro-addon"
}
```

### Field-by-field

| Field | Type | Required | Constraints |
|---|---|---|---|
| `message` | string | yes | 1–3 sentences. Lead-in only — do not restate the Snapshot in prose. ≤ 280 chars. |
| `snapshot.identitySignal` | string | yes | 1 sentence, ≤ 200 chars. Grounded in `narrative`-scope memories. |
| `snapshot.presentState` | string | yes | 1 sentence, ≤ 200 chars. Grounded in `state`-scope memories. |
| `snapshot.returningPattern` | string | yes | 1 sentence, ≤ 200 chars. Grounded in chamber-4 `narrative` memory. |
| `snapshot.emergingTrajectory` | string | yes | 1 sentence, ≤ 200 chars. Grounded in `trajectory`-scope memory. |
| `snapshot.firstInvitation` | string | yes | 1–2 sentences, ≤ 400 chars. Concrete; doable this week. |
| `snapshot.hurl` | HurlPath | yes | Copied verbatim from `context.hurl`. The agent does not invent HURLs. |
| `snapshot.deeperTrajectoryTeaser` | string \| null | yes | Non-null iff `context.entitlements` includes `"astro-addon"`. v1 string is the fixed teaser line in `coach.md`. |
| `insight` | string | yes | Third person. ≤ 280 chars. |
| `detectedThemes` | string[] | yes | 0–4 entries. Same rules as REZZIE. |
| `coherenceDelta` | number | yes | `+0.05 ≤ x ≤ +0.25` typical at chamber 6; hard bound `-0.20..+0.30`. |
| `memoryWrites` | MemoryWrite[] | yes | Must include at least one `narrative`-scope and one `artifact`-scope write (see `coach.md`). |
| `statePatch` | object | yes | Must include `completedFlow: true`. |
| `returnSeed` | string | yes | 1 sentence, ≤ 200 chars. Default: *"Come back when something changes. I'll ask you what."* |

### Validation rules (enforced by Zod / `core/agents.run`)

1. Strict object — no extra fields.
2. `snapshot.hurl` must equal `context.hurl` exactly. Mismatch → response is rejected and retried once.
3. `snapshot.deeperTrajectoryTeaser` must be `null` if `context.entitlements` does not include `"astro-addon"`. Non-null in that case → rejected and retried with a corrective system note.
4. `memoryWrites` must include at least one entry where `scope === "narrative"` with `importance ≥ 0.85`.
5. `statePatch.completedFlow` must be `true`.
6. All Snapshot string fields must be non-empty after trim.

### Example (chamber 6 — first-time user without astro-addon)

```
{
  "message": "Here's what I'm seeing. Read it once before you decide what to do with it.",
  "snapshot": {
    "identitySignal": "Someone in the slow part of becoming a builder.",
    "presentState": "Working a known role while a different life keeps tugging.",
    "returningPattern": "The pull toward making something, surfacing in quiet hours.",
    "emergingTrajectory": "Leaving the known role for a self-shaped one within the next year.",
    "firstInvitation": "This week, write the first twenty minutes of the day you'd want six months from now — including who hasn't texted you yet.",
    "hurl": "hurl://soulseed/living-invitation/state-37/coherence-082",
    "deeperTrajectoryTeaser": null
  },
  "insight": "User crystallized as a builder leaving a known role; pull toward making is the returning pattern; trajectory is a year-out exit toward a self-shaped role.",
  "detectedThemes": ["building", "founder", "exit", "becoming"],
  "coherenceDelta": 0.15,
  "memoryWrites": [
    {
      "scope": "narrative",
      "content": "User crystallized as a builder leaving a known role. Returning pattern: pull toward making. Trajectory: year-out exit to a self-shaped role.",
      "contentJson": null,
      "importance": 0.92
    },
    {
      "scope": "artifact",
      "content": "SoulSeed Snapshot generated on first run.",
      "contentJson": { "summary": "builder/exit/self-shaped role" },
      "importance": 0.70
    }
  ],
  "statePatch": { "completedFlow": true },
  "returnSeed": "Come back when something changes. I'll ask you what."
}
```

### Example (chamber 6 — return user with astro-addon)

```
{
  "message": "Here's the part of the picture that moved.",
  "snapshot": {
    "identitySignal": "A builder who's stopped pretending the exit isn't already happening.",
    "presentState": "Two weeks into the resignation conversation, even if the conversation hasn't happened yet.",
    "returningPattern": "The pull toward making, now louder than the case for staying.",
    "emergingTrajectory": "Enrolling in the music program in September; consulting income tapered through August.",
    "firstInvitation": "This week, write the resignation email you're not sending yet. Don't send it. Save it where you can find it Monday.",
    "hurl": "hurl://soulseed/living-invitation/state-58/coherence-091",
    "deeperTrajectoryTeaser": "Your deeper trajectory layer unlocks when the engine ships in v1.1. Your access starts now; the room opens then."
  },
  "insight": "Between Snapshot v1 and v2, the trajectory sharpened from 'leaving consulting' to a concrete September enrollment.",
  "detectedThemes": ["exit", "music", "trajectory_sharpened"],
  "coherenceDelta": 0.18,
  "memoryWrites": [
    {
      "scope": "narrative",
      "content": "Between Snapshot v1 and v2, trajectory sharpened from 'leaving consulting' to 'September music program enrollment'.",
      "contentJson": null,
      "importance": 0.90
    },
    {
      "scope": "artifact",
      "content": "SoulSeed Snapshot v2 generated.",
      "contentJson": { "summary": "music program, September, consulting taper" },
      "importance": 0.70
    }
  ],
  "statePatch": { "completedFlow": true },
  "returnSeed": "Come back when the resignation email is sent — or the day you decide it won't be."
}
```

---

## Failure modes and the retry policy

`core/agents.run` validates the response. If validation fails, it:

1. **Retry once** with a follow-up system message: *"Your previous response did not match the SoulSeedAgentOutput (or CoachingAgentOutput) schema. The exact schema is below. Re-emit a valid object. Do not include anything outside the JSON."* + the schema.
2. **If the second attempt also fails**, fall back to a canned safe response so the user is never blocked:
   - REZZIE fallback: `{ "message": "<chamber's manifest intro>", "insight": "Agent failure fallback for [chamberKey].", "detectedThemes": [], "coherenceDelta": 0, "memoryWrites": [{ "scope": "event", "content": "Agent fallback used in [chamberKey].", "contentJson": null, "importance": 0.05 }], "statePatch": {}, "suggestedNextQuestion": null, "suggestedNextChamber": null }`
   - COACH fallback: a Snapshot composed entirely of the "thin source" fallback lines from `coach.md`'s Step 2 table, with `deeperTrajectoryTeaser` set per entitlement, `returnSeed` set to the default line, and `insight: "Agent failure fallback for living-invitation."`.
3. **Log the failure** as an `event`-scope memory at importance 0.05 and emit a telemetry event so we can tune prompts.

---

## What Code does with this next (S2, S20, S23)

- **S2** — Encode `SoulSeedAgentOutputSchema`, `CoachingAgentOutputSchema`, `MemoryWriteSchema`, `SessionStatePatchSchema`, and `SoulSeedSnapshotSchema` in `packages/contracts/src`. Inferred types are `z.infer<...>`. Export from a clean index.
- **S20** — `core/agents.run` validates model output against the matching schema; implements the retry + fallback policy above. Mock mode returns hand-written valid responses per chamber.
- **S23** — `core/artifacts.create` reads the `snapshot` payload from `CoachingAgentOutput`, copies it into the `artifacts.content_json` row, and persists. The HURL in the Snapshot must match the row's stored HURL.

When in doubt about shape, this file is the human spec; the Zod schemas in `@holo/contracts` are the runtime truth.
