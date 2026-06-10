"use client";

import { useState } from "react";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 5 — Recognition / Confirmation (spec §10, paths per S84b item 5).
// The recognition + supporting lines come from the cohering output
// (reproducibility: not invented in the UI). Three paths:
//   (a) "Yes, that's me"           → proceed to Proof
//   (b) "Mostly, but there's more" → "What important part did I miss?" → augment
//   (c) "Not quite"                → "Thank you. Let's correct the signal." → regenerate
export function Screen05Recognition() {
  const recognition = useSprint10Store((s) => s.recognition);
  const confirmRecognition = useSprint10Store((s) => s.confirmRecognition);
  const augmentRecognition = useSprint10Store((s) => s.augmentRecognition);
  const correctRecognition = useSprint10Store((s) => s.correctRecognition);

  const [openPath, setOpenPath] = useState<"none" | "augment" | "correct">("none");
  const [text, setText] = useState("");

  const recognitionLine = recognition?.recognitionLine ?? "Here's how I'm meeting you.";
  const supportingLine =
    recognition?.supportingLine ?? "Meeting you on your own terms keeps the work honest.";

  const togglePath = (path: "augment" | "correct") => {
    setText("");
    setOpenPath((current) => (current === path ? "none" : path));
  };

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
              <GhostButton type="button" onClick={() => togglePath("augment")}>
                Mostly, but there&apos;s more
              </GhostButton>
              <GhostButton type="button" onClick={() => togglePath("correct")}>
                ✎ Not quite
              </GhostButton>
            </div>

            {openPath === "augment" && (
              <DawnGlass className="mt-8 p-6 text-left">
                <h4 className="text-xl text-soulseed-honey">What important part did I miss?</h4>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={3}
                  className="mt-4 w-full resize-none rounded-[20px] border border-white/20 bg-black/20 p-4 text-base text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
                  placeholder="Add what's missing in a sentence or two…"
                  maxLength={600}
                />
                <div className="mt-4 flex justify-end">
                  <IridescentButton
                    type="button"
                    className="px-7 py-3"
                    disabled={text.trim().length < 3}
                    onClick={() => void augmentRecognition(text.trim())}
                  >
                    Augment my recognition
                  </IridescentButton>
                </div>
              </DawnGlass>
            )}

            {openPath === "correct" && (
              <DawnGlass className="mt-8 p-6 text-left">
                <h4 className="text-xl text-soulseed-honey">
                  Thank you. Let&apos;s correct the signal.
                </h4>
                <p className="mt-1 text-soulseed-dawn/62">What would be more accurate?</p>
                <textarea
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  rows={3}
                  className="mt-4 w-full resize-none rounded-[20px] border border-white/20 bg-black/20 p-4 text-base text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
                  placeholder="Tell me what you'd say instead…"
                  maxLength={600}
                />
                <div className="mt-4 flex justify-end">
                  <IridescentButton
                    type="button"
                    className="px-7 py-3"
                    disabled={text.trim().length < 3}
                    onClick={() => void correctRecognition(text.trim())}
                  >
                    Try again
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
