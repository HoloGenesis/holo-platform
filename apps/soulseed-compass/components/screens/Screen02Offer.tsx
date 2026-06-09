"use client";

import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 2 — The Offer (spec §7). The commit point: the primary CTA starts the
// SoulSeed session via the SDK (anonymous-first, no email) and advances to 3.
const outcomes: ReadonlyArray<readonly [string, string, string]> = [
  ["Identity Pattern", "Your core blueprint", "◎"],
  ["8-Domain Signal", "Your first signal across the 8 domains", "✣"],
  ["ANG3L Profile", "How AI meets you", "✦"],
  ["Return Link", "Your link back home", "↗"],
];

export function Screen02Offer() {
  const startStatus = useSprint10Store((s) => s.startStatus);
  const startError = useSprint10Store((s) => s.startError);
  const startSession = useSprint10Store((s) => s.startSession);
  const advance = useSprint10Store((s) => s.advance);

  const onBegin = async () => {
    const ok = await startSession();
    if (ok) advance();
  };

  return (
    <SoulSeedScreenShell step={2} backgroundSrc="/images/soulseed/seed-offering-hero.jpg">
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div>
            <p className="mb-6 text-soulseed-honey">2 / 9</p>
            <h1 className="ss-display text-5xl leading-[1.02] md:text-7xl">
              Create your
              <br />
              SoulSeed.
            </h1>
            <p className="mt-8 max-w-xl text-2xl leading-relaxed text-soulseed-dawn/90">
              The living profile that teaches AI how to meet you.
            </p>
            <p className="mt-8 max-w-md leading-8 text-soulseed-dawn/72">
              In a few minutes, you&apos;ll create a profile of your identity, intelligence, and
              support style — so future ANG3Ls understand you faster, guide you better, and remember
              what matters.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <IridescentButton
                type="button"
                onClick={() => void onBegin()}
                disabled={startStatus === "starting"}
              >
                {startStatus === "starting" ? "Starting…" : "Begin My SoulSeed →"}
              </IridescentButton>
              <GhostButton type="button">See what you&apos;ll receive</GhostButton>
            </div>
            {startStatus === "error" && (
              <p className="mt-3 text-sm text-soulseed-coral">
                {startError ?? "Something went quiet. Try again."}
              </p>
            )}
          </div>
          <div>
            <p className="mb-4 text-lg text-soulseed-dawn/90">You&apos;ll receive:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {outcomes.map(([title, subtitle, icon]) => (
                <DawnGlass key={title} className="p-6">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-soulseed-honey/40 text-2xl text-soulseed-honey shadow-ss-glow">
                    {icon}
                  </div>
                  <h3 className="text-lg font-semibold text-soulseed-dawn">{title}</h3>
                  <p className="mt-1 text-sm text-soulseed-dawn/62">{subtitle}</p>
                </DawnGlass>
              ))}
            </div>
            <p className="mt-8 text-center text-soulseed-honey">
              🔒 One living page. No funnel. Return anytime.
            </p>
          </div>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
