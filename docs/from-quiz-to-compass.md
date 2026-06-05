# From a quiz to a compass — making SoulSeed Compass feel like a product

*For Brooks. Written 2026-06-05, after walking the live v0.01 as a first-time user.*

## The honest problem

Walked through the live product as a brand-new user: answer 5–6 questions → get a
summary → "Begin again." It reads as *"…that's it?"* The danger isn't the question
count — six good questions plus a grounded mirror is a legitimate product. The danger
is that **it ends like a quiz instead of opening like a relationship.**

## The one-sentence reframe

**The product is not the Snapshot. The product is the return.** A quiz gives you an
answer and is over. A *compass* is something you carry and check again when the terrain
changes. The [[HURL]] is the coordinate you come back to; everything in the experience
should serve "come back."

That single shift — from *output* to *ongoing mirror* — is what separates this from a
BuzzFeed quiz. And the good news: **most of the machinery for it is already built.**

## What already exists (we're closer than it feels)

| Capability | Status |
|---|---|
| REZZIE notices you across 5 chambers, on a real model | ✅ live |
| COACH synthesizes a grounded Snapshot (no invention) | ✅ live |
| Memory Lattice carries your answers across the journey | ✅ live |
| HURL = your permanent, reproducible coordinate | ✅ live |
| **Return loop** — resume by HURL, "here's what's *different*" | ✅ built, ⚠️ invisible |
| "Copy my return link" (real openable URL) | ✅ just shipped |
| Snapshot orientation + "What now?" next step | ✅ just shipped |

The return loop is the heart of "a product, not a quiz" — and it's **already coded**
(`ReturnChamber`, `resumeSession`, return-by-HURL, COACH's return appendix). It's just
not *delivered* or *surfaced* yet. So this is mostly finishing, not building.

## The fix, in scope order

### v1 — now (small, high-leverage; makes the loop real)

1. **Deliver the return link.** Today nothing emails the user — "your HURL will find you"
   wasn't true, so I removed it. The single biggest gap: wire **one transactional email at
   export** — *"Here's your SoulSeed + your link back."* This is the line between "I did a
   quiz once" and "I have an ongoing thing I can return to." *(Needs an email provider —
   ~half a day.)*
2. **Make the return *felt*.** The loop exists but a first-timer never learns it's there.
   On return, COACH should open explicitly: *"Last time your invitation was X. What
   happened?"* — then show **what moved** since the last Snapshot. The plumbing (return
   appendix + prior-snapshot memory) already supports this; it needs surfacing.
3. **Make the Snapshot shareable.** Let the user **save/share** the Snapshot (download as
   image or copy as text). Shareability is free distribution — and a reason to feel the
   artifact is *theirs*.

### v1.1 — next (deepen value + the paid hook)

4. **Astrology add-on as a real hook, not a dead paywall.** Right now it's an entitlement
   slot in the Trajectory chamber. Give it a *visible teaser payoff* so the upsell has pull
   (the natal engine itself stays parked — only the teaser + paywall are in scope).
5. **Light cadence.** An optional *"check back in two weeks"* nudge (email) turns one
   session into a habit loop. Depends on #1's email infra.

### Parked for v2 (do not build yet)

- Voice (Hume), agent grid / ANG3L, Compiled-Vector, second products, pgvector/Neo4j.
- Multi-session trend visualization ("your coherence over time") — lovely, but it needs
  several returns' worth of data to mean anything. Earn it later.

## If you do only one thing

**Wire the export email with the return link (v1 #1).** Without it, the return loop —
the actual product — is unreachable for anyone who closes the tab. With it, SoulSeed
Compass stops being a quiz the moment they finish: they leave holding a thread back in.

## What Code does with this next

Nothing here is a silent code decision — these are product calls for you, Brooks. Once
you pick, the work is mostly **finishing existing machinery**, not new systems:
- #1 email → add an email provider + one send at the export step.
- #2 return → surface the already-built `ReturnChamber` / return-appendix path.
- #3 share → a client-side export of the Snapshot artifact.
Tell us which of v1 #1–#3 to take first and we'll scope it tight.
