# SoulSeed Compass — Executive Summary & Build Evaluation

*Shareable status brief. Prepared 2026-06-08 from a direct read of the live build,
the strategy docs, and the HOLOSCROLLY v0.4 prototype. For Brooks + the team.*

---

## TL;DR

The hard machinery is **built and proven**; the product is **not yet converting**.
The gap between "functional" and "converts" comes down to **three finishing cuts**,
not new systems. The MVP path is a **free SoulSeed Compass** that ends with a *felt*
return, plus a **paid ResonantBrand branch journey** sold inside the scroll at the
HURL. Three decisions are needed to start building; the architecture already supports
all of them.

---

## 1. Current state of the build

**Repository:** `HoloGenesis/holo-platform` (private) — a pnpm/Turborepo monorepo.
- `apps/soulseed-compass` — Next.js front-end (the product, a thin "HOLOSCROLLY" skin)
- `services/holo-core-api` — **HOLO Core**: memory, agents, orchestration, HURL minting, commerce
- `packages/*` — contracts (Zod), SDK, HDOM, product-manifests, agent-prompts, UI
- Live demo: **soulseed-compass.vercel.app** (running on mock REZZIE, payments off — both by design, one switch from live)

**What is verified built (evidence in code):**

| Capability | Evidence | Status |
|---|---|---|
| 6-chamber REZZIE → COACH Snapshot, memory-derived (reproducible, not invented) | `packages/product-manifests`, HOLO Core memory lattice | ✅ live |
| Return-by-HURL: recognizes a returning visitor, asks "what changed?" | `components/ReturnChamber.tsx`, `HoloscrollyShell.tsx` | ✅ built + surfaced |
| Paywall renders **inside the scroll** (not a pricing page) | `components/AstroAddon.tsx` gates the trajectory chamber by entitlement | ✅ architecture correct |
| Stripe checkout + webhook + entitlements (behind a flag) | `services/holo-core-api/src/core/commerce.ts` | ✅ built, payments-off |
| Anonymous-first identity, HURL minting, email-merge | `app/v1/hurl/*`, `app/v1/users/*` | ✅ built |
| Cross-product memory (one brain, many doors) | HOLO Core; proven with a 2nd product stub | ✅ proven |

**On-track verdict:** **Yes on machinery, partially on conversion.** The thing most
"quiz that emails you a result" products never have — it remembers, and remembering is
the wedge — is real and reproducible.

---

## 2. The three gaps that decide conversion

Conversion is **not** blocked by missing machinery. It is blocked by three items:

1. **No thread back (delivery, ~½ day).** `EmailCapture` exists but no email provider
   is wired, so nothing sends the user their HURL. The return loop — the actual
   product — is unreachable for anyone who closes the tab.
2. **The return doesn't show the delta (design, highest leverage).** On return the app
   regenerates the *same* Snapshot; it must visibly show *"here's what moved since last
   time."* The first felt return **is** the unpaid trial of the paid product.
3. **The paid tier sells empty air (product).** The only current paid hook is the
   astrology add-on, whose engine is parked to v1.1. The real Tier 1 should be a
   **branch journey** that delivers value now.

---

## 3. The MVP shape

Free and paid are **two turns of one loop**, not two products. The loop converts only
if the free turn ends with a *felt gap* the paid turn fills.

- **FREE — "Your Snapshot + your first return":** the 6 chambers → Snapshot → HURL →
  **export email** (the thread) → on return, a **felt delta**. Job: *clarity delivered
  + one real return felt + one horizon glimpsed* (`deeperTrajectoryTeaser`).
- **PAID TIER 1 — ResonantBrand Soul Tree branch journey:** sold **at the conversion
  seam inside the HOLOSCROLLY at the HURL**. Grows the SoulSeed through the five Soul
  Tree holons, each a chamber producing a real artifact:

  | Chamber (holon) | Deliverable |
  |---|---|
  | Root — SoulSeed Essence | Wounds / gifts / longings / values / core vision (pulled from existing memory) |
  | Trunk — ResonantBrand Core | Core myth, promise, hero story, voice, audience field |
  | Branch — Story Field Engine | Content pillars, narrative nodes, visual metaphors, offer ladders |
  | Leaf — Expression Layer | Pomelli/Claude-ready prompt pack, brand book, visual direction |
  | Fruit — Legacy & Impact | Published Brand DNA + a branch HURL to return to as it evolves |

  The astrology add-on becomes a **secondary** hook, not load-bearing.

---

## 4. Evaluation — answers to the open questions

### Hard blockers

- **Q-A · ResonantBrand content + price.** Content = the five-holon journey above
  (Soul Tree map + Brand DNA + Pomelli-ready export + next-step pathways). Price:
  current code has only `base` $27 + `astro-addon` $9; a full Brand DNA is worth more.
  **Recommendation: $97 one-time** for `resonantbrand-branch`, with room for an evolving
  subscription later. *Final number = Brooks's call (anchor ≥ $97).*
- **Q-C · HOLOBAGUA reconciliation.** The code already commits to the **operational 8**
  (mental, emotional, relational, spiritual, professional, financial, ecological,
  physical) — enforced by the `HoloBaguaDomain` type. The **symbolic 8**
  (Light/Binding/Identity/Combination/Growth/Mobility/Dominion/Harmony) is the poster's
  poetic layer. **They are NOT a clean 1:1** (3 of 8 only map by force).
  **Recommendation: operational 8 = canonical at the engine/data layer; symbolic 8 =
  display/theme overlay**, without asserting equivalence. *Needs Brooks's ratification.*
- **Q-D · HOLOSCROLLY v0.4.** Already shared — committed at
  `BROOKS/HOLOSCROLLY/` on `main` (zip + extracted code). **Not required for the MVP**;
  it's a separate Vite/React lab. Cherry-pick the 3D `HoloTorusScene` and HDOM types
  post-MVP; don't block the MVP on porting the whole lab.

### Soft confirmations

- **Q-E · Pricing model.** ✅ Confirmed: free SoulSeed + paid ResonantBrand Tier 1 +
  AstroAddon secondary. Code consequence: `commerce.ts` `PRODUCTS` changes — `base`
  becomes free, add `resonantbrand-branch`, keep `astro-addon` at $9.
- **Q-F · Branch delivery shape.** ✅ Confirmed by the architecture: same scroll, same
  HURL, entitlement gates the branch entry chamber — **not** separate apps/URLs. The
  `Hurl` type carries a `branch` field; routing is `/h/:realm/:chamber/:stage/:branch`;
  the manifest already supports per-chamber `addOns`.
- **Q-B · Providers.** ✅ **Resend (+ React Email) confirmed** for email (load-bearing).
  ⚠️ **Defer Twilio/SMS to post-MVP** (A2P 10DLC, cost, opt-in overhead; not required to
  prove the loop). Confirm if SMS is wanted in MVP anyway.

---

## 5. Build cuts, in order

1. **Wire the export email** (Resend) — unblocks everything; ~½ day.
2. **Surface the felt-delta on return** — highest conversion leverage.
3. **Make the Snapshot shareable** (download image / copy text) — free distribution.
4. **Build the ResonantBrand branch journey as Paid Tier 1**, sold in-scroll at the HURL.
5. *(Parallel/optional)* Fold v0.4's 3D HOLOTORUS into the app as visual enrichment.

---

## 6. Decisions needed to start

1. **Lock ResonantBrand price** at $97 (or specify).
2. **Ratify HOLOBAGUA:** operational 8 canonical, symbolic 8 as skin.
3. **Confirm Resend now / Twilio later** (or request SMS in MVP).

> Open item: the **v0.5 PRD §8.8** referenced for the operational 8 is **not in the
> repo** — if it's the authority, it should be committed so the canon lives in one place.

Once these three are ratified, the work is finishing cuts + product decisions — not new
systems. Close them and the MVP stops *functioning* and starts *converting*.
