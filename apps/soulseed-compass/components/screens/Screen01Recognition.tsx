"use client";

import { IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 1 — Recognition (spec §6). Pre-session landing. The CTA advances to
// Screen 2 (the Offer); no session/engine work happens here.
export function Screen01Recognition() {
  const advance = useSprint10Store((s) => s.advance);

  return (
    <SoulSeedScreenShell step={1} backgroundSrc="/images/soulseed/seed-offering-hero.jpg">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="ss-display text-5xl leading-[1.05] text-soulseed-dawn md:text-7xl">
          Something in you
          <br />
          is ready to be recognized.
        </h1>
        <div className="mx-auto my-8 h-20 w-px bg-gradient-to-b from-soulseed-honey to-transparent" />
        <IridescentButton onClick={advance}>
          Begin My SoulSeed <span>→</span>
        </IridescentButton>
        <p className="mt-8 text-sm text-soulseed-dawn/60">Scroll to begin</p>
      </div>
    </SoulSeedScreenShell>
  );
}
