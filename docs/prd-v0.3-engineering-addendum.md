# PRD v0.3 Engineering Addendum — SoulSeed Compass

> **Sits beneath:** `docs/doctrine-the-cohering-is-the-product.md` (Doctrine v0.1). This addendum reconciles the PRD with the codebase; the doctrine names what the architecture is for.

Prepared as a reconciliation layer between `docs/prd-v0.3-soulseed-compass.md`,
the current codebase, and the 2026-06-08 executive summary.

## 0. Purpose

This addendum preserves the strategic correction in PRD v0.3:

SoulSeed Compass is the universal upstream HOLOSCROLLY intake for identity DNA,
Octopus intelligence mapping, ANG3L-readiness, memory consent, and HURL continuity.

It also reconciles the PRD with the actual repository architecture so engineering
does not accidentally introduce breaking changes or duplicate platform logic.

## 1. Strategic Correction Remains Accepted

PRD v0.3 supersedes the earlier ResonantBrand-first positioning.

SoulSeed Compass v1 is not a ResonantBrand funnel, HealingQuest intake, paid branch
journey, or astrology add-on. It is the first universal HOLOSCROLLY: the living
document through which the human becomes legible to themselves, memorable to the
system, and constructively meetable by future ANG3Ls.

Downstream products remain downstream:

- ResonantBrand
- HOLO HealingQuest
- Big Brain Big Heart
- ScaleHOLO / ResonantFamily
- Powered Couple
- Future ANG3L products

The branch infrastructure should be preserved, but not made load-bearing for v1.

## 2. HURL Contract: Additive Evolution Only

### Current shipped contract

The current `Hurl` interface is:

```ts
export interface Hurl {
  protocol: "hurl";
  realm: string;
  chamber: string;
  stage: number;
  branch: string;
  coherence: number;
  revision: number;
}
```

The current route shape is:

```txt
/h/:realm/:chamber/:stage/:branch
```

### PRD v0.3 issue

PRD v0.3 proposed:

```txt
/h/:realm/:document/:version/:chamber/:resonance
```

This would be a breaking change. It adds `document` and `version`, drops or obscures
`stage` and `branch`, and requires parser/serializer, hook, route, and migration work.

### Decision

Do not hard-cut HURL shape in v1.

Use additive evolution.

Recommended v1-compatible extension:

```ts
export interface Hurl {
  protocol: "hurl";
  realm: string;
  chamber: string;
  stage: number;
  branch: string;
  coherence: number;
  revision: number;

  // Additive optional fields for SoulSeed / HOLOSCROLLY evolution
  document?: string;
  version?: number;
  resonance?: string;
}
```

Preserve route compatibility:

```txt
/h/:realm/:chamber/:stage/:branch
```

Optional query or encoded metadata may carry additive values initially:

```txt
/h/soulseed/origin/1/root?document=compass&version=1&resonance=9f3a21bc
```

Later, after minted HURLs and downstream routes are migrated, a richer canonical route
can be considered.

### Acceptance criteria

- Existing minted HURLs continue to resolve.
- Existing `branch` behavior is preserved.
- New SoulSeed metadata can be attached without route breakage.
- HURL parser/serializer remains backward compatible.
- Tests cover old and new HURL forms.

## 3. API Architecture: Core Owns Product Logic

### Existing architecture principle

The repository's operating principle is:

```txt
apps are thin shells; HOLO Core owns everything that matters
```

The existing API surface already includes generic Core-owned concepts such as:

```txt
/v1/sessions/*
/v1/agents/run
/v1/memory/*
/v1/orchestrations/next
/v1/hurl/*
```

### PRD v0.3 issue

PRD v0.3 proposed product-specific endpoints such as:

```txt
/v1/soulseed/session
/v1/soulseed/session/:sessionId/octopus
/v1/soulseed/session/:sessionId/generate
/v1/soulseed/profile/:profileId/angel-handshake
```

This risks duplicating session, orchestration, and memory logic outside Core.

### Decision

Do not create a parallel product-specific API surface unless absolutely necessary.

Implement SoulSeed specifics through:

- product manifest data
- chamber definitions
- memory scopes
- orchestration recipes
- agent prompt manifests
- Core-owned generic endpoints

Where new capabilities are needed, implement them as Core services invoked through
generic orchestration, not product-owned app logic.

### Preferred pattern

Instead of:

```txt
POST /v1/soulseed/session/:sessionId/octopus
```

Use:

```txt
POST /v1/sessions/:sessionId/chambers/:chamberId
```

or existing equivalent session/chamber endpoint, with manifest metadata:

```ts
{
  product: "soulseed-compass",
  chamberId: "octopus-mental",
  memoryScope: "soulseed.octopus.mental",
  scoringRecipe: "octopus-domain-v1"
}
```

Instead of:

```txt
POST /v1/soulseed/profile/:profileId/angel-handshake
```

Use:

```txt
POST /v1/agents/run
```

with an agent/prompt recipe:

```ts
{
  agentId: "angel-handshake-v1",
  product: "soulseed-compass",
  memoryScopes: [
    "soulseed.identity_dna",
    "soulseed.octopus",
    "soulseed.angel_relationship_profile"
  ]
}
```

### Acceptance criteria

- App remains a thin shell.
- SoulSeed flow is driven by manifest/chambers.
- Core owns memory, orchestration, scoring, synthesis, and handoff.
- No duplicate session model is created in the app layer.
- New endpoints are only added when generic Core endpoints cannot serve the use case.

## 4. Octopus Test: Chambers-as-Data, Not Hardcoded Module

### Issue

PRD v0.3 correctly adds the Octopus Test, but it describes it too much like a bespoke
module.

The repo already treats chamber flow as manifest-driven. The Octopus Test should follow
this pattern.

### Decision

Implement the Octopus Test as manifest-defined chambers or one reusable chamber type
with an eight-domain loop.

Recommended options:

### Option A — Eight explicit chambers

```txt
octopus-mental
octopus-emotional
octopus-relational
octopus-spiritual
octopus-financial
octopus-professional
octopus-ecological
octopus-physical
```

Best for analytics, memory scopes, and per-domain return history.

### Option B — One reusable chamber with domain loop

```txt
octopus-domain-scan
```

The manifest defines the domain sequence and prompt set.

Best for speed and UI simplicity.

### Recommendation

Use Option B for MVP, but store results per domain so Option A remains possible.

### Manifest sketch

```ts
{
  id: "octopus-domain-scan",
  type: "domain-loop",
  product: "soulseed-compass",
  memoryScope: "soulseed.octopus",
  domains: [
    "mental",
    "emotional",
    "relational",
    "spiritual",
    "financial",
    "professional",
    "ecological",
    "physical"
  ],
  scoring: {
    recipe: "octopus-intelligence-agency-v1",
    outputs: [
      "intelligenceScore",
      "agencyScore",
      "confidence",
      "latentGift",
      "activeConstraint",
      "nextActivation"
    ]
  }
}
```

### Acceptance criteria

- Octopus prompts live in manifest/config, not hardcoded component logic.
- Adding/reordering domains does not require app architecture changes.
- Results persist per domain.
- Octopus output feeds the ANG3L Relationship Profile.
- Return events can compare domain movement over time.

## 5. Scope Reality: This Is a Bigger Build Than the Executive Summary

The executive summary correctly identified three near-term finishing cuts:

1. Wire export email / HURL thread-back.
2. Surface felt delta on return.
3. Make the Snapshot shareable.

It also framed ResonantBrand branch monetization as the near-term conversion path.

PRD v0.3 changes the product architecture. It adds:

- IdentityDNA schema refinement
- OctopusProfile
- ANG3LRelationshipProfile
- MemoryConsent
- ReturnEvent enrichment
- Octopus Test UI/scoring
- ANG3L synthesis
- Consent UX
- Handshake A/B demo
- Branch-neutral readiness

Therefore, this is no longer merely a "three finishing cuts" job.

### Decision

Treat the work as two tracks:

### Track A — Immediate Loop Hardening

Goal: make the existing SoulSeed HOLOSCROLLY feel real and returnable.

Expected duration: days.

Includes:

- reframe copy from ResonantBrand-specific to universal SoulSeed
- wire Resend + React Email
- email HURL
- resolve return-by-HURL
- ask "What changed?"
- show visible delta
- make Snapshot shareable

### Track B — Universal Personalization Build

Goal: build the full upstream SoulSeed profile and ANG3L-readiness layer.

Expected duration: likely weeks, depending on existing Core abstractions.

Includes:

- Octopus Test
- ANG3L Relationship Profile
- memory consent system
- handshake A/B demo
- branch-neutral readiness
- richer return intelligence

### Acceptance criteria

- Team does not estimate Track B as a half-day finishing pass.
- Track A ships first.
- Track B begins once the returnable document loop is working.

## 6. Sequencing Update

PRD v0.3 phase order should be revised.

### Original phase order

1. Reframe existing build
2. Build Octopus Test
3. Generate ANG3L Relationship Profile
4. Wire email thread back
5. Return event processing
6. ANG3L handshake demo
7. Branch readiness

### Revised phase order

1. Reframe existing build as universal SoulSeed HOLOSCROLLY.
2. Wire email thread-back with Resend + React Email.
3. Surface visible return delta.
4. Make Snapshot shareable.
5. Add Octopus Test as manifest-driven chamber loop.
6. Generate ANG3L Relationship Profile.
7. Add memory consent.
8. Add ANG3L handshake A/B demo.
9. Add branch-neutral readiness panel.
10. Revisit paid branch activation later.

### Rationale

Email and return delta are cheap, high-leverage, and already identified as primary gaps.
They make the existing product feel alive before larger profile-building work begins.

## 7. ResonantBrand Pricing Is Deferred

Earlier executive summary recommendations included:

- free SoulSeed
- ResonantBrand Tier 1 branch
- $97 one-time price
- AstroAddon secondary

PRD v0.3 supersedes this for v1.

### Decision

Do not require a ResonantBrand price decision for SoulSeed Compass v1.

Move the $97 decision to the future moment when a paid ResonantBrand branch is
intentionally activated.

For v1:

- SoulSeed Compass is upstream and branch-neutral.
- Commerce infrastructure remains preserved.
- In-scroll gates remain available.
- No paid branch is load-bearing.
- Branch recommendations may appear as non-coercive next pathways.

## 8. Updated Engineer Checklist

### Track A — Immediate Loop Hardening

```txt
[ ] Reframe root copy as universal SoulSeed / first HOLOSCROLLY
[ ] Remove or soften ResonantBrand-specific root-flow language
[ ] Preserve branch infrastructure but hide paid branch as load-bearing CTA
[ ] Confirm existing HURL parser/serializer behavior
[ ] Add optional HURL metadata additively only
[ ] Wire Resend
[ ] Add React Email template
[ ] Connect EmailCapture to HURL email send
[ ] Log hurl_email_sent / hurl_email_failed
[ ] Ensure HURL resolves after email click
[ ] Improve ReturnChamber: ask "What changed?"
[ ] Generate and display visible delta
[ ] Persist return event
[ ] Make Snapshot shareable as copyable text
[ ] Add tests for HURL backward compatibility, email send, return delta
```

### Track B — Universal Personalization Build

```txt
[ ] Add IdentityDNA schema refinements in packages/contracts
[ ] Add OctopusProfile schema
[ ] Add AngelRelationshipProfile schema
[ ] Add MemoryConsent schema
[ ] Add ReturnEvent enrichment schema
[ ] Model Octopus Test in product manifest
[ ] Build reusable domain-loop chamber UI
[ ] Add octopus-intelligence-agency-v1 scoring recipe in Core
[ ] Persist Octopus results per domain
[ ] Generate ANG3L Relationship Profile via Core orchestration
[ ] Generate systemPromptFragment
[ ] Generate downstreamHandoffSummary
[ ] Add user correction/confirmation pass
[ ] Add memory consent UI and persistence
[ ] Add ANG3L handshake A/B demo
[ ] Add Constructive ANG3L Fit Score capture
[ ] Add branch-neutral readiness panel
[ ] Add analytics events
[ ] Add tests for manifest flow, scoring, synthesis, consent, handoff
```

## 9. Final Engineering Directive

Build SoulSeed Compass as the first HOLOSCROLLY, but do it in the grain of the repo.

Do not:

- break the current HURL shape
- create a parallel product API
- hardcode the Octopus Test
- move orchestration into the app
- make ResonantBrand pricing a v1 blocker

Do:

- evolve HURL additively
- keep Core as the owner of orchestration and memory
- express SoulSeed through manifests, chambers, memory scopes, and agent recipes
- ship email + return delta first
- build Octopus and ANG3L Profile as the deeper universal personalization layer
