# PRD v0.3 — SoulSeed Compass™ as the Initial HOLOSCROLLY

> **Sits beneath:** `docs/doctrine-the-cohering-is-the-product.md` (Doctrine v0.1 — what HOLO categorically *is*). This PRD specifies; the doctrine explains *why*.

## Pulse

This PRD reframes the existing build correctly:

> **SoulSeed Compass is the first HOLOSCROLLY: a universal living intake document that establishes a person's innate identity DNA, full-spectrum intelligence profile, ANG3L relationship preferences, memory consent, and HURL-based continuity before any downstream HOLO product begins.**

The executive summary confirms the core machinery is already built: Next.js front end, HOLO Core API, HURL minting, return-by-HURL, memory lattice, anonymous-first identity, email-merge paths, and commerce infrastructure. The main unfinished work is not rebuilding the platform; it is correcting the product architecture and finishing the initial living-document loop.

---

# 1. Product Overview

## 1.1 Product Name

**SoulSeed Compass™**

## 1.2 Product Category

Initial HOLOSCROLLY / Universal ANG3L Intake / Living Identity Document

## 1.3 Core Definition

SoulSeed Compass is the first living HOLOSCROLLY experience. It captures a user's innate identity DNA, maps their eight-domain intelligence and agency pattern through the Octopus Test, generates an ANG3L Relationship Profile, mints a HURL continuation token, and creates a living document that can be recalled, evolved, and used by downstream HOLO ANG3Ls.

## 1.4 Product Thesis

Most AI onboarding starts with tasks.

SoulSeed starts with the human.

Before a person enters ResonantBrand, HealingQuest, Big Brain Big Heart, ScaleHOLO, Powered Couple, or any future HOLO product, the SoulSeed Compass establishes:

```txt
Who is this person?
What is trying to become through them?
What forms of intelligence are active, latent, overburdened, or underdeveloped?
How should an ANG3L relate to them constructively?
What may be remembered?
What should future ANG3Ls know before beginning?
```

---

# 2. Current Build Context

## 2.1 Existing Repository

The current repository is:

```txt
HoloGenesis/holo-platform
```

The executive summary describes it as a private pnpm/Turborepo monorepo with:

```txt
apps/soulseed-compass
services/holo-core-api
packages/contracts
packages/sdk
packages/hdom
packages/product-manifests
packages/agent-prompts
packages/ui
```

The live demo is listed as `soulseed-compass.vercel.app`, currently running mock REZZIE and payments off by design.

## 2.2 Verified Existing Capabilities

According to the build evaluation, the following are already built or proven:

| Capability                                  |            Status |
| ------------------------------------------- | ----------------: |
| 6-chamber REZZIE → COACH Snapshot           |      Built / live |
| Return-by-HURL recognition                  |  Built / surfaced |
| In-scroll gating / entitlement architecture |             Built |
| Stripe checkout + webhook + entitlements    | Built behind flag |
| Anonymous-first identity                    |             Built |
| HURL minting                                |             Built |
| Email merge path                            |             Built |
| Cross-product memory foundation             |            Proven |

The key conclusion from the executive summary is that the "hard machinery is built and proven," while the product still needs finishing and positioning correction.

---

# 3. Strategic Correction

## 3.1 What This PRD Changes

The executive summary frames the MVP path as free SoulSeed leading into a paid ResonantBrand branch journey. That may remain useful later, but it should **not** define the initial SoulSeed Compass architecture.

The corrected architecture is:

```txt
SoulSeed Compass
= universal identity + intelligence + ANG3L-readiness intake

Downstream Products
= later product-specific journeys that inherit the SoulSeed
```

## 3.2 Downstream Products Are Not the Root

SoulSeed Compass must remain upstream of:

```txt
ResonantBrand
HOLO HealingQuest
Big Brain Big Heart
ScaleHOLO / ResonantFamily
Powered Couple
Future ANG3L products
```

These products may use the SoulSeed profile, but they do not define it.

## 3.3 New North Star

The north star is not immediate monetization.

The north star is:

> **Constructive ANG3L Fit:** does the SoulSeed allow a future ANG3L to meet the person more accurately, respectfully, safely, and usefully?

---

# 4. Goals and Non-Goals

## 4.1 Goals

SoulSeed Compass v1 must:

1. Create the first living HOLOSCROLLY for a user.
2. Capture innate identity DNA through guided conversation.
3. Run an Octopus Test across eight domains of intelligence and agency.
4. Generate an ANG3L Relationship Profile.
5. Generate a memory and consent profile.
6. Mint a HURL continuation token.
7. Email the user their HURL.
8. Allow return-by-HURL.
9. Ask "What changed?" on return.
10. Update the living SoulSeed document.
11. Produce a portable personalization seed for downstream ANG3Ls.

## 4.2 Non-Goals for v1

SoulSeed Compass v1 should **not**:

1. Be a ResonantBrand funnel.
2. Be a HealingQuest intake form.
3. Be a paid branch product.
4. Be an astrology product.
5. Be a static PDF report.
6. Be a personality quiz.
7. Be a dashboard-first experience.
8. Force the user into a downstream offer before their SoulSeed is established.

---

# 5. User Journey

## 5.1 First-Time User Flow

```txt
1. Arrival
2. Orientation into living HOLOSCROLLY
3. SoulSeed Conversation
4. Octopus Test
5. Pattern Intelligence synthesis
6. SoulSeed Profile generation
7. ANG3L Relationship Profile generation
8. Memory consent capture
9. HURL minting
10. HURL email delivery
11. First personalized ANG3L handshake
```

## 5.2 Returning User Flow

```txt
1. User opens HURL
2. System resolves living SoulSeed document
3. System recognizes return state
4. User answers "What changed?"
5. Pattern Intelligence compares previous and current state
6. SoulSeed evolves
7. Updated HURL/version is saved
8. User sees updated orientation
9. Optional branch recommendations appear
```

The executive summary already notes that return-by-HURL is built and asks "what changed?", but also identifies that the return does not yet visibly show what moved. That delta display remains critical.

---

# 6. Core Product Modules

## 6.1 Module 1 — Threshold / Orientation

### Purpose

Introduce the user to the SoulSeed Compass as a living document, not a quiz.

### User-facing message

```txt
Before an ANG3L guides you, SoulSeed helps it learn how to meet you.
This is your first living HOLOSCROLLY: a document that remembers, evolves, and orients your becoming.
```

### Requirements

| ID   | Requirement                                          |
| ---- | ---------------------------------------------------- |
| M1-1 | Explain SoulSeed in plain language                   |
| M1-2 | Explain that the user can return by HURL             |
| M1-3 | Explain that the user controls memory consent        |
| M1-4 | Avoid product-specific CTAs on the first screen      |
| M1-5 | Begin session anonymously unless user provides email |

---

## 6.2 Module 2 — SoulSeed Conversation

### Purpose

Capture narrative identity DNA.

### Core Question

```txt
What is trying to become through you right now?
```

### Prompt Areas

The conversation should gather:

```txt
Essence
Values
Gifts
Longings
Tensions
Current threshold
Emerging identity
Old identity dissolving
Creative orientation
Decision style
Relational needs
Support preferences
```

### Requirements

| ID   | Requirement                                             |
| ---- | ------------------------------------------------------- |
| M2-1 | Use existing 6-chamber REZZIE/COACH flow where possible |
| M2-2 | Store raw user responses                                |
| M2-3 | Store AI-extracted structured fields                    |
| M2-4 | Allow user correction after synthesis                   |
| M2-5 | Avoid forcing downstream product language               |

The existing build already has a 6-chamber REZZIE → COACH Snapshot flow, so the engineer should adapt that machinery rather than invent a new intake system.

---

## 6.3 Module 3 — Octopus Test

> **Engineering note:** implement the Octopus Test as manifest-driven chamber
> data, preferably a reusable domain-loop chamber for MVP, not a hardcoded app
> module. See `docs/prd-v0.3-engineering-addendum.md` §4.

### Purpose

Map eight domains of intelligence and agency.

### Domains

Use the operational eight at the data layer:

```txt
mental
emotional
relational
spiritual
financial
professional
ecological
physical
```

The executive summary notes that the code already commits to the operational eight through the `HoloBaguaDomain` type, while symbolic domains should remain a display/theme overlay rather than a forced 1:1 equivalence.

### Scoring Model

Each domain receives:

```txt
intelligenceScore: 0–10
agencyScore: 0–10
confidence: 0–1
```

### Prompt Pattern Per Domain

Each domain should include:

```txt
1 self-rating
1 scenario question
1 free-text reflection
1 AI-inferred pattern
1 user confirmation/correction
```

### Example Prompt Set

| Domain       | Example Prompt                                                                        |
| ------------ | ------------------------------------------------------------------------------------- |
| Mental       | When life becomes complex, do you clarify, overthink, avoid, or simplify too quickly? |
| Emotional    | How quickly do you notice what you are feeling before it drives behavior?             |
| Relational   | In conflict, do you move toward, withdraw, appease, control, or clarify?              |
| Spiritual    | What gives your life meaning beyond achievement?                                      |
| Financial    | What emotion comes up first when you think about money?                               |
| Professional | Where do people naturally trust your competence?                                      |
| Ecological   | What kinds of environments help you become more yourself?                             |
| Physical     | How well do you hear your body before it forces you to listen?                        |

### Requirements

| ID   | Requirement                                         |
| ---- | --------------------------------------------------- |
| M3-1 | Render eight-domain Octopus Test                    |
| M3-2 | Capture self-ratings                                |
| M3-3 | Capture text responses                              |
| M3-4 | Generate AI-inferred domain scores                  |
| M3-5 | Allow user to confirm or correct scores             |
| M3-6 | Persist final OctopusProfile                        |
| M3-7 | Feed OctopusProfile into ANG3L Relationship Profile |

---

## 6.4 Module 4 — Pattern Intelligence Layer

### Purpose

Combine narrative responses, Octopus scores, memory state, and return events into a living interpretation.

### Pattern Intelligence Should Detect

```txt
Dominant strengths
Underfed domains
Overburdened domains
Latent gifts
Current becoming vector
Stuck loops
Acceleration signals
Contradictions
Growth edges
Recommended ANG3L interaction style
```

### Requirements

| ID   | Requirement                                        |
| ---- | -------------------------------------------------- |
| M4-1 | Generate first SoulSeed synthesis                  |
| M4-2 | Compare current and previous state on return       |
| M4-3 | Generate a visible delta summary                   |
| M4-4 | Store pattern history                              |
| M4-5 | Avoid presenting inferred scores as clinical truth |
| M4-6 | Include evidence snippets from user input          |

---

## 6.5 Module 5 — ANG3L Relationship Profile

### Purpose

Generate instructions for how future ANG3Ls should interact with the user.

### Output Fields

```ts
type AngelRelationshipProfile = {
  preferredTone: "gentle" | "clear" | "mythic" | "direct" | "technical" | "hybrid"
  pacing: "slow_reflective" | "balanced" | "fast_action"
  challengeLevel: "low" | "medium" | "high"
  structurePreference: "structured" | "emergent" | "hybrid"
  languageMode: "plain" | "poetic" | "technical" | "mythic" | "hybrid"
  bestSupportStyles: string[]
  avoidStyles: string[]
  groundingNeeds: string[]
  accountabilityNeeds: string[]
  memoryGuidance: string
  downstreamHandoffSummary: string
}
```

### Requirements

| ID   | Requirement                                                        |
| ---- | ------------------------------------------------------------------ |
| M5-1 | Generate ANG3L Relationship Profile from SoulSeed + OctopusProfile |
| M5-2 | Show user a readable version                                       |
| M5-3 | Generate system-prompt-ready version                               |
| M5-4 | Allow user to edit/correct                                         |
| M5-5 | Store accepted version                                             |
| M5-6 | Make profile available to downstream products through HOLO Core    |

---

## 6.6 Module 6 — Memory Consent

### Purpose

Make personalization sovereign and explicit.

### Consent Categories

```txt
Can remember
Should not remember
Can share with downstream HOLO products
Requires fresh consent before downstream use
Can use anonymously for system improvement
Should expire after session
```

### Requirements

| ID   | Requirement                                 |
| ---- | ------------------------------------------- |
| M6-1 | Capture memory consent before HURL email    |
| M6-2 | Store consent version                       |
| M6-3 | Enforce consent in downstream handoff       |
| M6-4 | Allow user to revise consent later          |
| M6-5 | Display what is remembered in readable form |

---

## 6.7 Module 7 — HURL Minting and Return

### Purpose

Make the SoulSeed a living document that can be resumed and evolved.

### HURL Function

The HURL is not just a link. It is:

```txt
A continuation token
A living-document address
A versioned becoming path
A future ANG3L personalization reference
```

### Suggested HURL Shape

```txt
/h/:realm/:document/:version/:chamber/:resonance
```

Example:

```txt
/h/soulseed/compass/v1/origin/9f3a21bc
```

> **Engineering note:** the canonical shipped HURL contract remains
> `/h/:realm/:chamber/:stage/:branch` for v1. Do not hard-cut to the proposed
> richer shape. Evolve HURL additively only. See
> `docs/prd-v0.3-engineering-addendum.md` §2.

The executive summary notes that the current `Hurl` type already carries branch support and routing exists in the shape of `/h/:realm/:chamber/:stage/:branch`, so the engineer should preserve compatibility where possible.

### Requirements

| ID   | Requirement                                  |
| ---- | -------------------------------------------- |
| M7-1 | Mint HURL after first SoulSeed synthesis     |
| M7-2 | Resolve HURL to living document              |
| M7-3 | Recognize returning user                     |
| M7-4 | Ask "What changed?"                          |
| M7-5 | Update SoulSeed document on return           |
| M7-6 | Version the living document                  |
| M7-7 | Preserve anonymous-first identity            |
| M7-8 | Support email merge when user provides email |

---

## 6.8 Module 8 — Email Thread Back

### Purpose

Make the return loop reachable after the tab closes.

The executive summary identifies "no thread back" as a primary blocker: `EmailCapture` exists, but no provider is wired, so the user does not receive their HURL. It recommends Resend + React Email and defers SMS/Twilio post-MVP.

### Requirements

| ID   | Requirement                                |
| ---- | ------------------------------------------ |
| M8-1 | Wire Resend                                |
| M8-2 | Add React Email template                   |
| M8-3 | Send HURL after email capture              |
| M8-4 | Include readable SoulSeed summary in email |
| M8-5 | Include return CTA                         |
| M8-6 | Log email sent event                       |
| M8-7 | Handle bounce/error state                  |
| M8-8 | Do not require SMS for MVP                 |

### Email Subject

```txt
Your SoulSeed Compass is ready
```

### Email Body

```txt
Your SoulSeed has been created.

Return here whenever you want to continue:
{HURL}

Your living document remembers where you began and will evolve as you do.
```

---

## 6.9 Module 9 — First Personalized ANG3L Handshake

### Purpose

Demonstrate why the SoulSeed matters.

After the SoulSeed is generated, show the user a brief comparison:

```txt
Generic AI response
SoulSeed-attuned ANG3L response
```

### Requirements

| ID   | Requirement                                                           |
| ---- | --------------------------------------------------------------------- |
| M9-1 | Generate a generic response to user's stated becoming question        |
| M9-2 | Generate a SoulSeed-attuned response using ANG3L Relationship Profile |
| M9-3 | Ask user which felt more useful / respectful / accurate               |
| M9-4 | Store Constructive ANG3L Fit Score                                    |
| M9-5 | Use score to refine profile                                           |

---

## 6.10 Module 10 — Branch Readiness Panel

### Purpose

Suggest future coherent pathways without collapsing SoulSeed into any one downstream product.

### Branch Types

```txt
ResonantBrand
HealingQuest
Big Brain Big Heart
ScaleHOLO / ResonantFamily
Powered Couple
Integration / Reflection
Leadership
```

### Requirements

| ID    | Requirement                                                 |
| ----- | ----------------------------------------------------------- |
| M10-1 | Display branch recommendations only after SoulSeed creation |
| M10-2 | Make recommendations non-coercive                           |
| M10-3 | Use language of "possible next pathways," not "buy now"     |
| M10-4 | Preserve architecture for future paid branches              |
| M10-5 | Do not make ResonantBrand load-bearing in initial MVP       |

The existing build's in-scroll entitlement/paywall architecture can remain, but for this corrected PRD it should be treated as future branch infrastructure, not the root purpose of SoulSeed.

---

# 7. Data Models

## 7.1 SoulSeedProfile

```ts
export type SoulSeedProfile = {
  id: string
  userId?: string
  anonymousId: string
  hurl: string

  createdAt: string
  updatedAt: string
  version: number

  identityDNA: IdentityDNA
  octopusProfile: OctopusProfile
  angelRelationshipProfile: AngelRelationshipProfile
  memoryConsent: MemoryConsent
  currentState: CurrentBecomingState
  returnHistory: ReturnEvent[]
  downstreamReadiness: DownstreamReadiness
}
```

## 7.2 IdentityDNA

```ts
export type IdentityDNA = {
  essencePattern: string
  coreValues: string[]
  naturalGifts: string[]
  activeTensions: string[]
  coreLongings: string[]
  currentThreshold: string
  becomingVector: string
  oldIdentityDissolving?: string
  emergingIdentity?: string
  meaningMakingStyle: string
  creativeOrientation: string
  decisionStyle: string
  relationalNeeds: string[]
  evidence: EvidenceSnippet[]
}
```

## 7.3 OctopusProfile

```ts
export type OctopusDomain =
  | "mental"
  | "emotional"
  | "relational"
  | "spiritual"
  | "financial"
  | "professional"
  | "ecological"
  | "physical"

export type OctopusDomainScore = {
  domain: OctopusDomain
  intelligenceScore: number // 0-10
  agencyScore: number // 0-10
  confidence: number // 0-1
  selfRating?: number
  aiInferredRating?: number
  userConfirmedRating?: number
  latentGift: string
  activeConstraint: string
  nextActivation: string
  evidence: EvidenceSnippet[]
}

export type OctopusProfile = {
  scores: OctopusDomainScore[]
  strongestArms: OctopusDomain[]
  underfedArms: OctopusDomain[]
  overburdenedArms: OctopusDomain[]
  hiddenArms: OctopusDomain[]
  integrationPattern: string
  recommendedAngelStyle: string
}
```

## 7.4 AngelRelationshipProfile

```ts
export type AngelRelationshipProfile = {
  preferredTone: string
  pacing: "slow_reflective" | "balanced" | "fast_action"
  challengeLevel: "gentle" | "balanced" | "direct" | "intense"
  structurePreference: "structured" | "emergent" | "hybrid"
  languageMode: "plain" | "poetic" | "technical" | "mythic" | "hybrid"

  bestSupportStyles: string[]
  avoidStyles: string[]
  accountabilityNeeds: string[]
  groundingNeeds: string[]
  trustBuilders: string[]
  riskTriggers: string[]

  systemPromptFragment: string
  downstreamHandoffSummary: string
}
```

## 7.5 MemoryConsent

```ts
export type MemoryConsent = {
  consentVersion: string
  canRemember: string[]
  mustNotRemember: string[]
  shareWithDownstreamAngels: boolean
  requiresConsentForProductUse: boolean
  allowAnonymousImprovement: boolean
  expiresAt?: string
  updatedAt: string
}
```

## 7.6 ReturnEvent

```ts
export type ReturnEvent = {
  id: string
  soulSeedProfileId: string
  createdAt: string

  prompt: "What changed?"
  userReflection: string

  detectedChanges: string[]
  domainMovements: Partial<Record<OctopusDomain, number>>
  stuckLoops: string[]
  accelerationSignals: string[]
  updatedBecomingVector: string
  nextCoherentOrientation: string
}
```

## 7.7 EvidenceSnippet

```ts
export type EvidenceSnippet = {
  source: "conversation" | "octopus_test" | "return_event" | "user_correction"
  text: string
  field: string
  confidence: number
}
```

---

# 8. API Requirements

> **Engineering note:** these API shapes are conceptual capability descriptions,
> not a mandate to create product-specific `/v1/soulseed/*` endpoints. The
> implementation should preserve the repo principle that HOLO Core owns
> orchestration and apps remain thin shells. Prefer generic Core endpoints,
> manifests, chambers, memory scopes, and agent recipes. See
> `docs/prd-v0.3-engineering-addendum.md` §3.

## 8.1 Create SoulSeed Session

```txt
POST /v1/soulseed/session
```

Creates anonymous session.

### Response

```ts
{
  sessionId: string
  anonymousId: string
}
```

## 8.2 Submit Conversation Chamber

```txt
POST /v1/soulseed/session/:sessionId/chamber
```

### Payload

```ts
{
  chamberId: string
  userResponse: string
}
```

## 8.3 Submit Octopus Test

```txt
POST /v1/soulseed/session/:sessionId/octopus
```

### Payload

```ts
{
  responses: {
    domain: OctopusDomain
    selfRating: number
    scenarioResponse: string
    reflection: string
  }[]
}
```

## 8.4 Generate SoulSeed Profile

```txt
POST /v1/soulseed/session/:sessionId/generate
```

Generates:

```txt
IdentityDNA
OctopusProfile
ANG3LRelationshipProfile
CurrentBecomingState
```

## 8.5 Confirm / Correct Profile

```txt
PATCH /v1/soulseed/profile/:profileId
```

Allows user corrections.

## 8.6 Mint HURL

```txt
POST /v1/hurl/mint
```

Existing HURL infrastructure should be reused.

## 8.7 Send HURL Email

```txt
POST /v1/soulseed/profile/:profileId/email
```

Uses Resend + React Email.

## 8.8 Resolve HURL

```txt
GET /v1/hurl/resolve/:hurl
```

Returns living SoulSeed document state.

## 8.9 Submit Return Event

```txt
POST /v1/soulseed/profile/:profileId/return
```

### Payload

```ts
{
  reflection: string
}
```

## 8.10 Generate ANG3L Handshake

```txt
POST /v1/soulseed/profile/:profileId/angel-handshake
```

Returns:

```ts
{
  genericResponse: string
  soulSeedAttunedResponse: string
}
```

---

# 9. UI Requirements

## 9.1 Primary Screens

```txt
/                  Landing / Threshold
/soulseed/start    Begin living document
/soulseed/session  Conversation + Octopus Test
/soulseed/result   SoulSeed output
/h/:...            HURL return route
```

## 9.2 Result Page Sections

The result page should show:

```txt
1. Your SoulSeed Pattern
2. Your Octopus Intelligence Map
3. Your ANG3L Relationship Profile
4. Your HURL
5. Your Memory Consent Summary
6. Your First ANG3L Handshake
7. Possible Branch Paths
```

## 9.3 Return Page Sections

The return page should show:

```txt
1. Welcome back
2. What changed?
3. Detected movement
4. Updated SoulSeed orientation
5. Updated Octopus domain shifts
6. Updated ANG3L guidance
7. Branch readiness if relevant
```

---

# 10. Analytics

## 10.1 Events

```txt
soulseed_started
threshold_viewed
conversation_chamber_started
conversation_chamber_completed
octopus_started
octopus_domain_completed
octopus_completed
profile_generated
profile_corrected
memory_consent_saved
hurl_minted
email_captured
hurl_email_sent
hurl_email_failed
hurl_returned
return_reflection_submitted
delta_generated
angel_handshake_generated
angel_fit_score_submitted
branch_recommendation_viewed
snapshot_shared
```

## 10.2 Core Metrics

| Metric                                | Target |
| ------------------------------------- | -----: |
| Start → Profile generated             |   50%+ |
| Profile generated → Email captured    |   40%+ |
| Email captured → HURL return          |   20%+ |
| Return → Reflection submitted         |   50%+ |
| ANG3L handshake → Fit score submitted |   40%+ |
| Positive Constructive ANG3L Fit Score |   70%+ |

## 10.3 Constructive ANG3L Fit Score

Ask:

```txt
Did this feel accurate?
Did this feel respectful?
Did this feel useful?
Did this feel like the ANG3L knew how to meet you?
Would you want future HOLO ANG3Ls to use this SoulSeed?
```

Score each 1–5.

---

# 11. Implementation Plan

> **Engineering note:** execute in two tracks. Track A ships the immediate loop
> hardening first: universal reframe, Resend thread-back, return delta, and
> shareable Snapshot. Track B adds Octopus, ANG3L Relationship Profile, consent,
> handshake demo, and branch readiness. See
> `docs/prd-v0.3-engineering-addendum.md` §§5–6.

## Phase 1 — Reframe Existing Build

### Objective

Rename/reposition the current experience as the initial SoulSeed HOLOSCROLLY, not a ResonantBrand-specific funnel.

### Tasks

```txt
1. Audit current REZZIE/COACH Snapshot fields.
2. Map existing fields into IdentityDNA.
3. Remove or soften ResonantBrand-specific language from root flow.
4. Preserve downstream branch architecture for later.
5. Confirm operational HOLOBAGUA eight in contracts.
6. Add symbolic eight only as optional display layer.
```

### Acceptance Criteria

```txt
A first-time user can complete SoulSeed without encountering ResonantBrand-specific sales framing.
```

---

## Phase 2 — Build Octopus Test

### Objective

Add eight-domain intelligence and agency scan.

### Tasks

```txt
1. Add OctopusProfile schema to contracts.
2. Add Octopus Test UI.
3. Add scoring prompt/function.
4. Add user correction pass.
5. Persist final domain scores.
6. Render radar/spider map or eight-arm visual.
```

### Acceptance Criteria

```txt
User receives confirmed intelligenceScore and agencyScore for all eight domains.
```

---

## Phase 3 — Generate ANG3L Relationship Profile

### Objective

Turn SoulSeed + Octopus data into downstream personalization instructions.

### Tasks

```txt
1. Add AngelRelationshipProfile schema.
2. Add synthesis prompt.
3. Generate readable user-facing version.
4. Generate system-prompt-ready fragment.
5. Allow correction/editing.
6. Persist accepted version.
```

### Acceptance Criteria

```txt
System generates a reusable ANG3L handoff summary suitable for downstream products.
```

---

## Phase 4 — Wire Email Thread Back

### Objective

Make HURL return real.

### Tasks

```txt
1. Configure Resend.
2. Create React Email template.
3. Connect EmailCapture to provider.
4. Send HURL email.
5. Log email status.
6. Add error/retry state.
```

The executive summary identifies this as the first build cut and says it unblocks everything.

### Acceptance Criteria

```txt
User receives a working HURL by email and can return to the same living document.
```

---

## Phase 5 — Return Event Processing

### Objective

Make the HOLOSCROLLY evolve.

### Tasks

```txt
1. Resolve HURL.
2. Render return state.
3. Ask "What changed?"
4. Store return reflection.
5. Compare against previous SoulSeed state.
6. Generate visible delta.
7. Update document version.
```

The executive summary identifies the missing visible delta as one of the highest-leverage design gaps.

### Acceptance Criteria

```txt
Returning user sees a clear "what moved since last time" update.
```

---

## Phase 6 — First ANG3L Handshake Demo

### Objective

Prove SoulSeed improves human-AI interaction.

### Tasks

```txt
1. Generate generic response to user's becoming question.
2. Generate SoulSeed-attuned response.
3. Display comparison.
4. Ask user for Constructive ANG3L Fit Score.
5. Save fit score.
```

### Acceptance Criteria

```txt
User can directly feel the difference between generic AI and SoulSeed-attuned ANG3L.
```

---

## Phase 7 — Branch Readiness

### Objective

Suggest downstream paths without turning SoulSeed into a product-specific funnel.

### Tasks

```txt
1. Add generic branch readiness panel.
2. Support branch metadata.
3. Keep entitlement/payment infrastructure dormant or secondary.
4. Avoid paid CTA until product-specific journeys are intentionally activated.
```

### Acceptance Criteria

```txt
User sees possible next pathways, but SoulSeed remains complete without choosing one.
```

---

# 12. Engineering Notes

## 12.1 Reuse Existing Infrastructure

Engineer should reuse:

```txt
Current Next.js app
HOLO Core API
Existing HURL routes
Existing anonymous-first identity
Existing memory lattice
Existing contracts/Zod package
Existing manifest system
Existing return chamber components
Existing commerce/entitlement architecture, but not as MVP root
```

## 12.2 Do Not Block on Visual Perfection

The executive summary says HOLOSCROLLY v0.4 / 3D HoloTorusScene exists but should not block MVP. Treat advanced visuals as Phase 2 enrichment.

## 12.3 Keep Future Branch Compatibility

Do not remove:

```txt
branch field
entitlements
in-scroll gates
commerce hooks
manifest addOns
```

Just demote them from root flow to downstream branch infrastructure.

---

# 13. Acceptance Criteria for v1

SoulSeed Compass v1 is complete when:

```txt
1. A new user can start anonymously.
2. The user can complete SoulSeed Conversation.
3. The user can complete Octopus Test.
4. The system generates IdentityDNA.
5. The system generates OctopusProfile.
6. The system generates ANG3LRelationshipProfile.
7. The user can confirm/correct profile.
8. The system captures memory consent.
9. The system mints a HURL.
10. The system emails the HURL via Resend.
11. The user can return by HURL.
12. The return page asks "What changed?"
13. The system generates a visible delta.
14. The system updates the living document version.
15. The system demonstrates a SoulSeed-attuned ANG3L response.
16. The user can score ANG3L fit.
17. Branch recommendations are optional and downstream-neutral.
```

---

# 14. Risks and Mitigations

| Risk                                        | Mitigation                                                                 |
| ------------------------------------------- | -------------------------------------------------------------------------- |
| It feels like a personality quiz            | Lead with living document / becoming language                              |
| It becomes ResonantBrand too early          | Keep branches downstream-neutral in v1                                     |
| Octopus Test feels judgmental               | Use "intelligence + agency" as reflective map, not score of worth          |
| HURL feels abstract                         | Call it "your continuation link" in plain UI                               |
| Memory feels invasive                       | Add explicit memory consent and editable remembered fields                 |
| Visual ambition slows MVP                   | Ship text-first + simple field map before full 3D                          |
| Existing paywall architecture distorts flow | Preserve infrastructure but hide/soften paid conversion in root experience |

---

# 15. Engineer Build Checklist

```txt
[ ] Audit current SoulSeed fields
[ ] Create/extend SoulSeedProfile schema
[ ] Create IdentityDNA schema
[ ] Create OctopusProfile schema
[ ] Create AngelRelationshipProfile schema
[ ] Create MemoryConsent schema
[ ] Create ReturnEvent schema
[ ] Update root flow copy to universal intake
[ ] Add Octopus Test UI
[ ] Add Octopus scoring synthesis
[ ] Add user correction step
[ ] Add ANG3L relationship synthesis
[ ] Add memory consent UI
[ ] Wire Resend + React Email
[ ] Send HURL email
[ ] Confirm HURL return resolution
[ ] Add return delta generation
[ ] Add living document versioning
[ ] Add ANG3L handshake demo
[ ] Add Constructive ANG3L Fit Score
[ ] Add downstream-neutral branch readiness panel
[ ] Add analytics events
[ ] Add tests for HURL, email, profile generation, return event, domain scoring
```

---

# 16. Final Product Statement

> **SoulSeed Compass is the first HOLOSCROLLY: a living identity-intelligence document that helps a person become legible to themselves, memorable to the system, and constructively meetable by any future ANG3L.**

This is the instruction for the engineer:

```txt
Do not build a funnel.
Do not build a quiz.
Do not build a static report.

Build the first living document of the person.
Make it remember.
Make it return.
Make it evolve.
Make it useful to every ANG3L that comes after.
```

[RIFF]
SoulSeed is the root scroll. The Octopus Test gives it eight arms. The HURL gives it memory. The ANG3L profile gives it relationship. The downstream products are branches; the Compass is the living seed that knows how to grow.
