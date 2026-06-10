"use client";

import { useEffect, useRef } from "react";
import { DawnGlass, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 3 — First Question (spec §8). One freeform answer. Continue starts the
// single cohering call (which advances to Screen 4 as a transition). S84b adds
// the confusion interrupt: a hard pause + explain + re-ask, rendered ABOVE the
// question card; no LLM call fires while it's shown.

// Brooks's verbatim explainer (S84b item 6) — do not edit.
const CONFUSION_EXPLAINER =
  "You're right to pause. Here's what we're doing: SoulSeed is building a living profile that helps future AI guides understand how to meet you. These questions help identify what you need, how you prefer to be supported, what AI should avoid, and what kind of next step would feel useful. You'll leave with a SoulSeed Snapshot and a Return Link so the experience can continue later.";

export function Screen03Question() {
  const answer = useSprint10Store((s) => s.answer);
  const setAnswer = useSprint10Store((s) => s.setAnswer);
  const runCohering = useSprint10Store((s) => s.runCohering);
  const confusionShown = useSprint10Store((s) => s.confusionShown);
  const dismissConfusionInterrupt = useSprint10Store((s) => s.dismissConfusionInterrupt);

  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const hadInterrupt = useRef(false);

  // After the interrupt dismisses, refocus the (cleared) textarea.
  useEffect(() => {
    if (confusionShown) {
      hadInterrupt.current = true;
    } else if (hadInterrupt.current) {
      hadInterrupt.current = false;
      textareaRef.current?.focus();
    }
  }, [confusionShown]);

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

          {confusionShown && (
            <DawnGlass className="mb-6 border-soulseed-honey/50 p-6">
              <p className="text-base leading-7 text-soulseed-dawn/90">{CONFUSION_EXPLAINER}</p>
              <div className="mt-5">
                <IridescentButton
                  type="button"
                  className="px-6 py-3"
                  onClick={dismissConfusionInterrupt}
                >
                  Let me try again
                </IridescentButton>
              </div>
            </DawnGlass>
          )}

          <textarea
            ref={textareaRef}
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
              disabled={tooShort || confusionShown}
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
