# how-to-add-a-holoscrolly.md

The recipe for adding a new product to HOLO without touching Core. Reads in 5 minutes. The whole point is that product #3 should be cheap.

Worked example throughout: HOLOBOOK (see `packages/product-manifests/drafts/holobook.draft.md`).

Version: 1.0 · 2 June 2026

---

## Pre-flight (must already be true)

- [ ] HOLO Core is deployed (routes-in-monorepo for v1).
- [ ] `@holo/contracts`, `@holo/sdk`, `@holo/hdom`, `@holo/product-manifests`, `@holo/agent-prompts`, `@holo/ui` all build clean.
- [ ] You have read `docs/architecture.md` and `docs/api-contracts.md`. Non-optional.

If any of the above is false, stop. Fix that first.

---

## The recipe (6 steps)

### 1. Draft the manifest (Cowork)

- [ ] Create `packages/product-manifests/drafts/<product>.draft.md` as a plain data-table doc. Pattern: `soulseed-compass.draft.md` and `holobook.draft.md`.
- [ ] For each chamber declare: `key`, `title`, `agentKey`, `next`, `entitlementsRequired`, input shape, prompts (intro + question), `memoryReadScopes`, `memoryWriteScopes`, expected events.
- [ ] Declare cross-product memory reads explicitly. If chamber 1 should read SoulSeed memory, list which scopes. **This is where the moat shows up — don't skip it.**
- [ ] No code in this file. Tables only.

### 2. Wire the manifest as a typed object (Code)

- [ ] Create `packages/product-manifests/src/<product>.manifest.ts` exporting `<product>Manifest` typed as `ProductManifest` from `@holo/contracts`.
- [ ] Validate at module load: `ProductManifestSchema.parse(<product>Manifest)`.
- [ ] Widen `ProductKey` enum in `@holo/contracts` by adding the new key. Additive only.
- [ ] Add one Vitest: load the manifest, walk `getNextChamber` end-to-end, confirm it terminates at `null`.

### 3. Draft agent prompts (Cowork)

- [ ] Reuse existing agents (REZZIE / COACH) when the voice fits. Most products will.
- [ ] If a new agent is needed, create `packages/agent-prompts/drafts/<agent>.md` following `rezzie.md` / `coach.md`: system prompt + per-chamber appendix + structured-output contract.
- [ ] Add the agent's structured-output type to `output-contract.md` and to `@holo/contracts` (Zod schema) — same shape rules as `SoulSeedAgentOutput` / `CoachingAgentOutput`.
- [ ] Widen `AgentKey` enum in `@holo/contracts`. Additive only.
- [ ] Encode the reproducibility rule in the prompt: every identity claim must trace to memory or current input. Never invent.

### 4. Scaffold the thin app (Code)

- [ ] Create `apps/<product>/` as a Next.js App Router app (TypeScript strict, Tailwind, Framer Motion if scroll-styled).
- [ ] Copy the SoulSeed shell shape: `HoloscrollyShell`, `Chamber`, `RezziePanel` (or agent-panel equivalent), `ProgressRail`, `HurlCard`, an artifact component if the product produces one.
- [ ] `lib/useChamberProgression.ts` uses `@holo/hdom`'s `getNextChamber`. No hardcoded chamber order.
- [ ] All data flows through `@holo/sdk`. No Supabase client imported anywhere in `apps/<product>/`.
- [ ] Local UI state in Zustand; nothing else.

### 5. Declare entitlements (only if paid)

- [ ] Add the entitlement key (e.g. `<product>-pro`) to `EntitlementKey` in `@holo/contracts`. Additive.
- [ ] Reference the entitlement in the manifest where it gates a chamber slot (`entitlementsRequired` or `addOns[]`).
- [ ] Add the Stripe price ID to env and the checkout call to the SDK.
- [ ] The `entitlements/grant` Stripe webhook already handles new keys — no Core change.

### 6. Deploy to its own URL

- [ ] Vercel project pointing at `apps/<product>/`.
- [ ] Shared Supabase + shared HOLO Core API (same URL as SoulSeed).
- [ ] Set the SDK base URL to the existing Core endpoint. **No new backend deployment.**
- [ ] Add a smoke test: hit `sessions/start` with `productKey: "<product>"`, walk the manifest end-to-end with mocks, confirm an artifact (if any) writes.

---

## What NOT to do (the bright lines)

- ❌ **No direct DB access in any `apps/*` file.** Ever. If the SDK is missing something, add the Core endpoint + SDK method, don't bypass.
- ❌ **No inlined prompts in components or route files.** Agent prompts live in `packages/agent-prompts` only.
- ❌ **No per-product memory tables.** All memory rows go through `core/memory.upsert` into the shared `memories` table, scoped by `sourceProduct` + `scope`.
- ❌ **No hardcoded chamber flow in components.** Chamber order is always read from the manifest via `getNextChamber`.
- ❌ **No business logic in API route handlers.** Routes are thin: `parse → authorize → delegate to core/<name>.ts → return`.
- ❌ **No new database tables for the product.** If you're tempted to add one, the data probably belongs in `memories`, `events`, `artifacts`, or `entitlements`.
- ❌ **No new authentication system.** Same anonymous-first auth + `merge_user`. The product gets the user that walks in.
- ❌ **No copy-paste of SoulSeed's specific chambers.** Reuse the *shape*; rewrite the content. Each product earns its own voice.
- ❌ **No standalone deployment of Core for this product.** Single Core, many doors. The Core extraction (if it ever happens) is a separate decision driven by load, not by product count.
- ❌ **No skipping the manifest draft.** "I'll just hardcode it for now" is how the moat dies. Draft → wire → done.

---

## Validation (you've done it right when)

- [ ] `pnpm -w typecheck && pnpm -w lint && pnpm -w build` clean.
- [ ] `products/manifest?productKey=<new>` returns the manifest.
- [ ] A new user can walk the new product end-to-end (mock agents OK).
- [ ] A user who has run SoulSeed (or another existing product) opens the new product and **chamber 1 already knows them** — at minimum reads their `profile` + `narrative` scopes from prior products.
- [ ] `events`, `memories`, `hurls`, `artifacts` rows all carry `source_product = "<new>"`.
- [ ] Zero new files in `services/holo-core-api/app/api/` for this product. (If there's even one, you went off-track.)

---

## The 30-minute version (for prototypes)

Skip steps 5 and 6. Stub the manifest in Cowork (3 chambers max), wire it minimally in Code, alias the agent to REZZIE or COACH, run it locally with the existing Core dev server. You won't ship anything, but you'll know within an afternoon whether the product idea is real.

This is exactly what S29's HOLOBOOK stub does. Read it as the worked example.

---

## When this playbook needs an update

- A real second product ships and surfaces a gap not covered here.
- Core is extracted to a standalone service (the only step that changes is "set the SDK base URL").
- A new agent type is added that needs more than the registry pattern (unlikely — push back first).
- Cross-product memory permissions become non-trivial (i.e. the same-user-all-products default in v1 stops holding).

Until then, this is the recipe. Reuse it.
