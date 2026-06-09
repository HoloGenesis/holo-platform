"use client";

import { DawnGlass, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 3 — First Question (spec §8). One freeform answer. Continue starts the
// single cohering call (which advances to Screen 4 as a transition).
export function Screen03Question() {
  const answer = useSprint10Store((s) => s.answer);
  const setAnswer = useSprint10Store((s) => s.setAnswer);
  const runCohering = useSprint10Store((s) => s.runCohering);

  const tooShort = answer.trim().length < 3;

  return (
    <SoulSeedScreenShell step={3} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div className="pb-8">
          <p className="mb-6 text-soulseed-honey">3 / 9</p>
          <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">
            Let&apos;s begin with
            <br />
            what matters.
          </h1>
          <p className="mt-8 max-w-md text-2xl leading-relaxed text-soulseed-dawn/86">
            Your answers shape how your SoulSeed understands and supports you — right now.
          </p>
        </div>
        <DawnGlass className="p-8 md:p-10">
          <div className="mb-6 flex items-start gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-soulseed-honey/50 text-2xl text-soulseed-honey shadow-ss-glow">
              ✧
            </div>
            <div>
              <h2 className="ss-display text-3xl leading-tight">
                What would make this useful for you today?
              </h2>
              <p className="mt-3 text-soulseed-dawn/72">
                Your honest answer helps your SoulSeed meet you in the right way.
              </p>
            </div>
          </div>
          <textarea
            value={answer}
            onChange={(event) => setAnswer(event.target.value)}
            className="min-h-40 w-full resize-none rounded-[24px] border border-white/20 bg-black/20 p-6 text-lg text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
            placeholder="Share anything that's on your mind..."
            maxLength={600}
          />
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-soulseed-dawn/52">Private by design. You&apos;re in control.</p>
            <IridescentButton
              type="button"
              className="px-7 py-3"
              disabled={tooShort}
              onClick={() => void runCohering()}
            >
              Continue →
            </IridescentButton>
          </div>
        </DawnGlass>
      </div>
    </SoulSeedScreenShell>
  );
}
