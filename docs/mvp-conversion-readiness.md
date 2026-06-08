# SoulSeed Compass — MVP Conversion Readiness

*Synthesis for Brooks + the engineer. Written 2026-06-05, after reading the live
build, the strategy docs, and the HOLOSCROLLY v0.4 experience prototype.*

This is the bridge between two questions the existing docs don't connect:
**"is the engineer on track?"** (an engineering question, mostly answered) and
**"will the MVP convert?"** (a product/psychology question, not yet answered).
The gap between *functional* and *converts* is where products with beautiful
posters die. This memo names that gap concretely and orders the cuts to close it.

---

## 1. What is actually built (verified in code, not claims)

The hard machinery exists and the central loop is real:

| Capability | Evidence | Status |
|---|---|---|
| Return-by-HURL recognition + "what changed?" | `components/ReturnChamber.tsx`, `HoloscrollyShell.tsx` (`isReturnVisit` branch) | ✅ built + surfaced |
| Paywall renders **inside the scroll**, not a pricing page | `components/AstroAddon.tsx` gates the Trajectory chamber via entitlements | ✅ architecture correct |
| A named withheld thing (conversion seam) | `snapshot.deeperTrajectoryTeaser` field in `SoulSeedArtifact.tsx` | ✅ seam exists |
| Memory-derived Snapshot (reproducible, not invented) | HOLO Core memory lattice; `v0.01-what-exists.md` | ✅ proven |
| Identity + HURL minting, anonymous-first, email-merge | `app/v1/hurl/*`, `app/v1/users/*` | ✅ built |
| Stripe checkout + entitlements (behind a flag) | `app/v1/checkout/route.ts`, `app/v1/stripe/webhook/route.ts` | ✅ built, payments-off |

**On-track verdict — machinery:** Yes. The thing most "quiz that emails you a
result" products never have — it remembers, and remembering is the wedge — is
real and reproducible. The in-scroll paywall (Brooks's #1 worry) is already
wired correctly: the user pays *from inside the experience*, not from a
separate pricing surface.

---

## 2. The three gaps that decide whether it converts

Conversion is **not** blocked by missing machinery. It is blocked by three
delivery/design items, in priority order:

### Gap 1 — No thread back (delivery)
`EmailCapture` exists, but **no email provider is wired**, so nothing actually
sends the user their HURL. The return loop — the actual product — is
*unreachable* for anyone who closes the tab. **Effort: ~½ day** (add provider +
one send at the export step). This is the door; without it the loop cannot be
demonstrated to anyone.

### Gap 2 — The return doesn't show the delta (design — highest leverage)
On return, `ReturnChamber` regenerates the **same** five-field
`SoulSeedArtifact`. It does not visibly show *"here is what moved since last
time."* The first felt return **is** the unpaid trial of the paid product. If
return #1 looks like the same snapshot, "evolves with you" reads as hollow and
the paid tier has no proof. The plumbing (return appendix + prior-snapshot
memory) supports a delta; the UI must **surface a before→after**, not just
re-render. With little data, the delta is constructed by reflecting the change
in the user's *own words* on re-ask — not from trend charts (those need v2 data).

### Gap 3 — The paid tier currently sells empty air (product)
Today's only paid hook is the astrology add-on, whose engine is parked to v1.1.
That means charging for *"reserved access, room opens later"* — a weak tier-B
offer. The poster and the ResonantBrand Soul Tree infographic point at the real
answer: **the paid tier should be a branch journey** that delivers value *now*.

---

## 3. The MVP shape that converts

Free and paid are **two turns of one loop**, not two products. The loop only
converts if the free turn ends with a *felt gap* the paid turn fills.

### FREE — "Your Snapshot + your first return" (the intrigue engine)
- The 6-chamber REZZIE → COACH Snapshot. Keep it; six good questions + a
  grounded mirror is a legitimate product.
- Ends with, in order: (1) the Snapshot — satisfying, theirs, shareable;
  (2) the HURL, issued visibly as "your coordinate"; (3) **the export email**
  (Gap 1) so they leave holding a thread back; (4) one **named, withheld
  horizon** — `deeperTrajectoryTeaser` — *"there's a next coherent step from
  here; I can show you its shape."*
- Free tier's job: **clarity delivered + one real return felt + one horizon
  glimpsed.** The return (Gap 2) must work on the free tier — that is the demo.

### PAID TIER 1 — a branch journey, sold in-scroll at the HURL
- **Recommend ResonantBrand Soul Tree as the first paid branch** (the third
  infographic already illustrates it end-to-end; the HOLOSCROLLY canon already
  names the branches: `brand-tree`, `wholeness-journey`, `leadership-journey`).
- Sold **at the conversion seam inside the HOLOSCROLLY at the HURL** — the user
  pays at the moment of felt gap, where the want is live, not on a pricing page.
- It **evolves**: more data in (connectors, reflections), more coherence
  resolved, more of the field navigable. The poster's "evolves with you"
  becomes the actual upgrade ladder.
- The astrology add-on becomes a *secondary* hook, not the load-bearing tier.

---

## 4. Build cuts, in order

1. **Wire the export email** (Gap 1). Unblocks everything; ~½ day.
2. **Surface the felt-delta on return** (Gap 2). Highest conversion leverage;
   show before→after in the user's words on return #1.
3. **Make the Snapshot shareable** (download image / copy text). Free
   distribution + ownership.
4. **Design + build the ResonantBrand branch journey as Paid Tier 1** (Gap 3),
   sold in-scroll at the HURL, evolving with data.
5. *(Parallel, optional)* Decide the role of **HOLOSCROLLY v0.4** — fold its 3D
   HOLOTORUS / move registry / holonic recursion into the production app as the
   richer visual layer the poster promises, or keep it a lab. The production app
   already has `HolotorusVisual` + `HoloscrollyShell`, so v0.4 is an enrichment
   path, not a rebuild.

---

## 5. Three questions for the engineer (the build doc doesn't answer these)

1. **Where does the paywall render?** *(Verified: in-scroll via `AstroAddon` —
   on track. Keep it there for the branch-journey tier too.)*
2. **What does the first return show a user who's been away two weeks with no
   new data?** If the honest answer is "the same Snapshot," Gap 2 is unbuilt and
   the return loop is not yet paid-worthy.
3. **What is the single withheld thing the free tier names but doesn't
   deliver?** *(Field exists: `deeperTrajectoryTeaser`. Make it concrete and
   make it point at the branch journey, not at parked astrology.)*

---

## Net

He is **on track on machinery** and **not yet demonstrably on track on
conversion** — because nothing yet delivers the thread (email), shows the delta
(felt return), or sells a tier with a real present-tense payoff (branch
journey). None of those are new systems; they are finishing cuts and product
decisions. Close those three and the MVP stops *functioning* and starts
*converting*.
