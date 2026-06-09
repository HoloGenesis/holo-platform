"use client";

import { useState } from "react";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 5 — Recognition / Confirmation (spec §10). The recognition + supporting
// lines come from the cohering output (reproducibility: not invented in the UI).
export function Screen05Recognition() {
  const recognition = useSprint10Store((s) => s.recognition);
  const confirmRecognition = useSprint10Store((s) => s.confirmRecognition);
  const correctRecognition = useSprint10Store((s) => s.correctRecognition);
  const skipConfirmation = useSprint10Store((s) => s.skipConfirmation);

  const [showCorrection, setShowCorrection] = useState(false);
  const [correction, setCorrection] = useState("");

  const recognitionLine = recognition?.recognitionLine ?? "Here's how I'm meeting you.";
  const supportingLine =
    recognition?.supportingLine ?? "Meeting you on your own terms keeps the work honest.";

  return (
    <SoulSeedScreenShell step={5} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">5 / 9</p>
        <h1 className="ss-display max-w-4xl text-4xl leading-[1.08] text-soulseed-honey md:text-6xl">
          {recognitionLine}
        </h1>
        <DawnGlass className="mt-10 p-8">
          <h2 className="mb-4 text-2xl text-soulseed-honey">Why this matters</h2>
          <p className="max-w-3xl text-lg leading-8 text-soulseed-dawn/78">{supportingLine}</p>

          <div className="mt-10 text-center">
            <h3 className="text-2xl text-soulseed-honey">Does this feel right to you?</h3>
            <p className="mt-2 text-soulseed-dawn/62">
              Your feedback helps your SoulSeed get it right.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <IridescentButton type="button" onClick={() => void confirmRecognition()}>
                ✓ Yes, that&apos;s me
              </IridescentButton>
              <GhostButton type="button" onClick={() => setShowCorrection((v) => !v)}>
                ✎ Not quite
              </GhostButton>
              <GhostButton type="button" onClick={() => void skipConfirmation()}>
                I&apos;m not sure yet
              </GhostButton>
            </div>

            {showCorrection && (
              <DawnGlass className="mt-8 p-6 text-left">
                <label className="mb-3 block text-sm text-soulseed-dawn/72">
                  What would you say instead?
                </label>
                <textarea
                  value={correction}
                  onChange={(event) => setCorrection(event.target.value)}
                  rows={3}
                  className="w-full resize-none rounded-[20px] border border-white/20 bg-black/20 p-4 text-base text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
                  placeholder="Tell me what I missed…"
                  maxLength={600}
                />
                <div className="mt-4 flex justify-end">
                  <IridescentButton
                    type="button"
                    className="px-7 py-3"
                    disabled={correction.trim().length < 3}
                    onClick={() => void correctRecognition(correction.trim())}
                  >
                    Try again →
                  </IridescentButton>
                </div>
              </DawnGlass>
            )}
          </div>
        </DawnGlass>
        <p className="mt-8 text-center text-soulseed-honey">
          🔒 Private by design. You&apos;re in control of what&apos;s shared and remembered.
        </p>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
