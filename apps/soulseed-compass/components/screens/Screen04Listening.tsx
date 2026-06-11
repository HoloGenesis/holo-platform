"use client";

import { useEffect } from "react";
import { DawnGlass, GhostButton, SoulSeedScreenShell, Whorl } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 4 — Listening / Pattern Forming (spec §9). A transition state: no user
// input. Auto-advances once the cohering call resolves; shows an error card
// with a retry if it failed. Reused verbatim by the return flow (S89) with
// variant="return": same visual, return-cohering wiring, 3-dot rail.
export function Screen04Listening({ variant = "first" }: { variant?: "first" | "return" }) {
  const isReturn = variant === "return";
  const firstStatus = useSprint10Store((s) => s.coheringStatus);
  const returnStatus = useSprint10Store((s) => s.returnRecognitionStatus);
  const coheringError = useSprint10Store((s) => s.coheringError);
  const goTo = useSprint10Store((s) => s.goTo);
  const runCohering = useSprint10Store((s) => s.runCohering);
  const submitReturnAnswer = useSprint10Store((s) => s.submitReturnAnswer);

  const status = isReturn ? returnStatus : firstStatus;
  const retry = isReturn ? submitReturnAnswer : runCohering;

  useEffect(() => {
    if (status === "ready") goTo(isReturn ? "RETURN_SNAPSHOT" : 5);
  }, [status, goTo, isReturn]);

  return (
    <SoulSeedScreenShell
      step={isReturn ? 2 : 4}
      mode={variant}
      backgroundSrc="/images/soulseed/seed-offering-close.jpg"
    >
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-6 text-soulseed-honey">{isReturn ? "Return" : "4 / 9"}</p>
            <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">
              Listening for how
              <br />
              you want to be met…
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-9 text-soulseed-dawn/78">
              Every word, every nuance, every intention helps your SoulSeed form a clearer picture of
              who you are and what you need.
            </p>
            <DawnGlass className="mt-10 max-w-md p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-soulseed-honey/50 text-soulseed-honey">
                  ◎
                </div>
                <div>
                  <h3 className="text-lg text-soulseed-honey">A pattern is forming.</h3>
                  <p className="mt-1 text-sm leading-6 text-soulseed-dawn/68">
                    We&apos;re connecting your insights, experiences, and intent into something
                    meaningful.
                  </p>
                </div>
              </div>
            </DawnGlass>
          </div>
          <div className="flex flex-col items-center justify-center gap-6">
            <Whorl className="[--whorl-size:360px]" />
            {status === "error" && (
              <DawnGlass className="max-w-sm p-6 text-center">
                <p className="text-sm text-soulseed-coral">
                  {coheringError ?? "Something went quiet. Try again."}
                </p>
                <GhostButton type="button" className="mt-4" onClick={() => void retry()}>
                  Try again
                </GhostButton>
              </DawnGlass>
            )}
          </div>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
