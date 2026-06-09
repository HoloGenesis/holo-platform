"use client";

import { useEffect } from "react";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell, Whorl } from "../dawn-glass";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 6 — Proof / Handshake A/B (spec §11). Auto-runs proof-v1 on mount and
// renders two responses to the same question: dimmed generic vs gold-glow
// attuned (which cites what the user told us). The conversion-proof moment.
export function Screen06Proof() {
  const proof = useSprint10Store((s) => s.proof);
  const proofStatus = useSprint10Store((s) => s.proofStatus);
  const proofError = useSprint10Store((s) => s.proofError);
  const proofNeedsCohering = useSprint10Store((s) => s.proofNeedsCohering);
  const runProof = useSprint10Store((s) => s.runProof);
  const goTo = useSprint10Store((s) => s.goTo);
  const advance = useSprint10Store((s) => s.advance);

  useEffect(() => {
    if (proofStatus === "idle") void runProof();
  }, [proofStatus, runProof]);

  const loading = proofStatus === "running" || proofStatus === "idle";
  const ready = proofStatus === "ready";

  const onErrorAction = () => {
    if (proofNeedsCohering) goTo(3);
    else void runProof();
  };

  return (
    <SoulSeedScreenShell step={6} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">6 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Here&apos;s why SoulSeed matters.
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-8 text-soulseed-dawn/78">
          Generic AI can respond. An ANG3L attuned to your SoulSeed understands, remembers, and meets
          you where you are.
        </p>
        {proof?.demoQuestion && (
          <p className="mt-4 text-soulseed-dawn/56">
            Both answering: <span className="italic">&ldquo;{proof.demoQuestion}&rdquo;</span>
          </p>
        )}

        {proofStatus === "error" && (
          <DawnGlass className="mt-8 max-w-xl p-6">
            <p className="text-sm text-soulseed-coral">
              {proofError ?? "Something went quiet. Try again."}
            </p>
            <GhostButton type="button" className="mt-4" onClick={onErrorAction}>
              {proofNeedsCohering ? "Back to your answer" : "Try again"}
            </GhostButton>
          </DawnGlass>
        )}

        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          {/* Generic AI */}
          <DawnGlass className="p-8 opacity-75">
            <h2 className="text-2xl">Generic AI</h2>
            <p className="mt-1 text-soulseed-dawn/52">Same prompt. Generic response.</p>
            <ul className="mt-8 space-y-5 text-soulseed-dawn/72">
              <li>Surface-level advice</li>
              <li>Forgetting is the norm</li>
              <li>One-size-fits-all tone</li>
              <li>Generic next steps</li>
            </ul>
            <blockquote className="mt-8 rounded-[24px] bg-white/8 p-5 italic text-soulseed-dawn/62">
              {ready ? proof?.genericResponse : loading ? "connecting…" : "—"}
            </blockquote>
          </DawnGlass>
          {/* SoulSeed-attuned */}
          <DawnGlass className="border-soulseed-honey/60 p-8 shadow-ss-glow">
            <h2 className="text-2xl text-soulseed-honey">SoulSeed-attuned ANG3L</h2>
            <p className="mt-1 text-soulseed-dawn/62">Your SoulSeed. Your context. Your becoming.</p>
            <ul className="mt-8 space-y-5 text-soulseed-dawn/86">
              <li>
                <strong className="text-soulseed-honey">Deep, relevant understanding</strong>
                <br />
                Speaks to what&apos;s true for you, now.
              </li>
              <li>
                <strong className="text-soulseed-honey">Remembers what matters</strong>
                <br />
                Builds continuity across every return.
              </li>
              <li>
                <strong className="text-soulseed-honey">Adaptive tone and approach</strong>
                <br />
                Matches your energy and needs.
              </li>
            </ul>
            <blockquote className="mt-8 rounded-[24px] border border-soulseed-honey/30 bg-soulseed-honey/10 p-5 italic text-soulseed-honey">
              {ready ? (
                proof?.attunedResponse
              ) : loading ? (
                <span className="inline-flex items-center gap-3">
                  <Whorl className="[--whorl-size:28px]" /> drawing on what you told me…
                </span>
              ) : (
                "—"
              )}
            </blockquote>
          </DawnGlass>
        </div>

        <div className="mt-10 text-center">
          <IridescentButton type="button" disabled={!ready} onClick={advance}>
            Show my Snapshot →
          </IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
