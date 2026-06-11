"use client";

import { useEffect } from "react";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 9 — Completion / Return Promise (spec §14). The exit point from the
// cohering event into the living document: "Enter My SoulSeed →" is the ONE
// Sprint-10 CTA that performs a real navigation (to the return URL → S25
// resume), so the user immediately FEELS what returning is like.
//
// Doctrine (Brooks's Q-O lock): "First run proves meetability. Returns deepen
// identity. The first SoulSeed is not the whole tree. It is the viable seed."

// The 4-quadrant "What happens next" panel — §14 verbatim.
const QUADRANTS: ReadonlyArray<readonly [string, string]> = [
  ["Personalized first meeting", "Your ANG3L prepares a conversation just for you."],
  ["Adaptive over time", "As you return, your SoulSeed remembers more and attunes better."],
  ["Guided becoming", "You'll receive the right support for your next coherent step."],
  ["You stay in control", "You choose what is saved, shared, or forgotten."],
];

export function Screen09Completion() {
  const completionStatus = useSprint10Store((s) => s.completionStatus);
  const completeFlow = useSprint10Store((s) => s.completeFlow);
  const enterMySoulSeed = useSprint10Store((s) => s.enterMySoulSeed);

  useEffect(() => {
    if (completionStatus === "idle") void completeFlow();
  }, [completionStatus, completeFlow]);

  const ready = completionStatus === "complete";

  return (
    <SoulSeedScreenShell step={9} backgroundSrc="/images/soulseed/seed-sprout-return.jpg">
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-6 text-soulseed-honey">9 / 9</p>
            <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">You&apos;re all set.</h1>
            <h2 className="mt-6 text-3xl text-soulseed-honey">Your SoulSeed is active.</h2>
            <p className="mt-8 max-w-xl text-xl leading-9 text-soulseed-dawn/76">
              Every time you return, your ANG3L will meet you here — with more context, more care,
              and more continuity.
            </p>
            <p className="mt-8 inline-flex rounded-full border border-soulseed-honey/30 bg-soulseed-honey/10 px-5 py-3 text-soulseed-honey">
              🔒 Private by design. You&apos;re in control.
            </p>

            {completionStatus === "error" && (
              <DawnGlass className="mt-6 max-w-md p-5">
                <p className="text-sm text-soulseed-coral">
                  Couldn&apos;t seal your SoulSeed. Try again.
                </p>
                <GhostButton type="button" className="mt-3" onClick={() => void completeFlow()}>
                  Try again
                </GhostButton>
              </DawnGlass>
            )}

            {/* Octopus tease — Brooks's Q-P lock, verbatim: the "returns deepen
                identity" half of the doctrine. A promise, not a feature; no
                shipping-date claims. */}
            <DawnGlass className="mt-8 max-w-md border-soulseed-honey/30 p-6">
              <p className="text-sm uppercase tracking-widest text-soulseed-honey">Coming next</p>
              <h3 className="ss-display mt-2 text-2xl">Full Octopus Map</h3>
              <p className="mt-2 leading-7 text-soulseed-dawn/70">
                Map your 8 domains of intelligence and agency.
              </p>
              <p className="mt-3 text-xs text-soulseed-honey/60">
                When you return, we&apos;ll go deeper.
              </p>
            </DawnGlass>
          </div>
          <DawnGlass className="p-8">
            <h3 className="text-2xl text-soulseed-honey">What happens next</h3>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {QUADRANTS.map(([title, detail]) => (
                <div key={title}>
                  <h4 className="text-lg text-soulseed-dawn">{title}</h4>
                  <p className="mt-2 text-soulseed-dawn/64">{detail}</p>
                </div>
              ))}
            </div>
            <div className="mt-10">
              <IridescentButton
                type="button"
                className="w-full"
                disabled={!ready}
                onClick={() => void enterMySoulSeed()}
              >
                Enter My SoulSeed →
              </IridescentButton>
            </div>
          </DawnGlass>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
