"use client";

import { useEffect, useState } from "react";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell } from "../dawn-glass";
import { EmailCaptureV2 } from "../dawn-glass/EmailCaptureV2";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 8 — HURL reveal (spec §13). Shows the SHAREABLE return URL (the same
// one S60's email carries; S25's resume-by-HURL honors it) — never the raw
// hurl:// canonical (doctrine: don't narrate the platform). Email is optional;
// "Open My HURL →" advances internally to Screen 9 (no redirect — that would
// resume this same session and loop).
export function Screen08Hurl() {
  const snapshot = useSprint10Store((s) => s.snapshot);
  const getReturnUrl = useSprint10Store((s) => s.getReturnUrl);
  const openMyHurl = useSprint10Store((s) => s.openMyHurl);
  const goTo = useSprint10Store((s) => s.goTo);

  // SSR guard: the URL depends on window.location.origin — render post-mount only.
  const [returnUrl, setReturnUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);

  useEffect(() => {
    setReturnUrl(getReturnUrl());
  }, [getReturnUrl, snapshot]);

  // edge case: landed here without a snapshot — bounce to Screen 7 (recomposes).
  useEffect(() => {
    if (snapshot === null) goTo(7);
  }, [snapshot, goTo]);

  if (snapshot === null) return null;

  const copy = async () => {
    if (!returnUrl) return;
    try {
      await navigator.clipboard.writeText(returnUrl);
      setCopied(true);
      setCopyFailed(false);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      setCopyFailed(true); // clipboard blocked — surface the URL for manual select
    }
  };

  return (
    <SoulSeedScreenShell step={8} backgroundSrc="/images/soulseed/seed-alone-glow.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">8 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Your Return Link is ready.
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-8 text-soulseed-dawn/74">
          This is your living link. It brings your ANG3L back to you and lets your SoulSeed remember
          where we left off.
        </p>
        <DawnGlass className="mt-10 p-8">
          <p className="mb-3 text-soulseed-honey">Your Return Link / HURL</p>
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/18 bg-black/24 p-4 md:flex-row md:items-center md:justify-between">
            <code className="ss-mono break-all text-lg text-soulseed-dawn/86">
              {returnUrl ?? "…"}
            </code>
            <GhostButton type="button" className="shrink-0 px-5 py-3" onClick={() => void copy()}>
              {copied ? "Copied — yours forever ✓" : "Copy"}
            </GhostButton>
          </div>
          {copyFailed && returnUrl && (
            <p className="mt-3 break-all text-sm text-soulseed-honey">
              Copy blocked by the browser — select it by hand: {returnUrl}
            </p>
          )}
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <p className="text-soulseed-dawn/68">🔒 Encrypted</p>
            <p className="text-soulseed-dawn/68">Private</p>
            <p className="text-soulseed-dawn/68">Yours alone</p>
          </div>
          <div className="my-6 h-px bg-soulseed-honey/20" />
          <EmailCaptureV2 />
        </DawnGlass>
        <div className="mt-10 text-center">
          <IridescentButton type="button" onClick={() => void openMyHurl()}>
            Open My HURL →
          </IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
