"use client";

import { DawnGlass, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Return Question (S89, screen 1 of the 3-screen return flow). REZZIE's
// return-mode rules are doctrine (rezzie.md / S25, preserved verbatim):
// NEVER "welcome back" — reference the prior arrivalVector and ask what changed.
const OPENERS: Record<string, string> = {
  lost: "Last time, you were carrying something you hadn't put down. What's different now?",
  building: "Last time, you were building. What did the build teach you?",
  becoming: "Last time, you were becoming someone. Who showed up since?",
  unknown: "Last time, you didn't know yet. Has anything quieted?",
};
const FALLBACK_OPENER = "Last time you were between worlds. What changed?";

export function ScreenReturnQuestion() {
  const returnArrivalVector = useSprint10Store((s) => s.returnArrivalVector);
  const returnAnswer = useSprint10Store((s) => s.returnAnswer);
  const setReturnAnswer = useSprint10Store((s) => s.setReturnAnswer);
  const submitReturnAnswer = useSprint10Store((s) => s.submitReturnAnswer);

  const opener = (returnArrivalVector && OPENERS[returnArrivalVector]) || FALLBACK_OPENER;
  const tooShort = returnAnswer.trim().length < 3;

  return (
    <SoulSeedScreenShell
      step={1}
      mode="return"
      backgroundSrc="/images/soulseed/seed-sprout-return.jpg"
    >
      <div className="mx-auto max-w-3xl">
        <DawnGlass className="p-8 md:p-12">
          <p className="mb-6 text-soulseed-honey">Return</p>
          <h1 className="ss-display text-4xl leading-[1.1] md:text-6xl">{opener}</h1>
          <textarea
            value={returnAnswer}
            onChange={(event) => setReturnAnswer(event.target.value)}
            rows={4}
            className="mt-8 min-h-36 w-full resize-none rounded-[24px] border border-white/20 bg-black/20 p-6 text-lg text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
            placeholder="Say what's true, even if it's small…"
            maxLength={600}
          />
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-soulseed-dawn/52">
              Private by design. You&apos;re in control.
            </p>
            <IridescentButton
              type="button"
              className="px-7 py-3"
              disabled={tooShort}
              onClick={() => void submitReturnAnswer()}
            >
              Continue →
            </IridescentButton>
          </div>
        </DawnGlass>
      </div>
    </SoulSeedScreenShell>
  );
}
