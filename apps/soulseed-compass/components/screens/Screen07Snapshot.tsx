"use client";

import { useEffect } from "react";
import type { SnapshotRow, SoulSeedSnapshotV2 } from "@holo/contracts";
import { DawnGlass, GhostButton, IridescentButton, SoulSeedScreenShell, Whorl } from "../dawn-glass";
import { WhatMovedV2 } from "../dawn-glass/WhatMovedV2";
import { useSprint10Store } from "../../lib/sprint10Store";

// Screen 7 — SoulSeed Snapshot (spec §12, schema per S86/audit item 4). Rows
// come from the composed SoulSeedSnapshotV2 (deterministic from cohering
// memories), never hardcoded. angelHandoffSummary + hurlSeedData stay in the
// payload for S87/S88 — not rendered here.

const ROW_META: { key: keyof SoulSeedSnapshotV2; label: string; icon: string; hint?: string }[] = [
  { key: "identityPattern", label: "Identity Pattern", icon: "◎", hint: "How you naturally show up" },
  { key: "currentNeed", label: "Current Need", icon: "♡" },
  { key: "supportStyle", label: "Support Style", icon: "◉" },
  { key: "whatAIShouldAvoid", label: "What AI Should Avoid", icon: "×" },
  { key: "whatMattersMost", label: "What Matters Most", icon: "✣" },
  { key: "nextCoherentStep", label: "Next Coherent Step", icon: "✦" },
];

export function Screen07Snapshot({ showDelta = false }: { showDelta?: boolean }) {
  const snapshot = useSprint10Store((s) => s.snapshot);
  const snapshotStatus = useSprint10Store((s) => s.snapshotStatus);
  const snapshotError = useSprint10Store((s) => s.snapshotError);
  const snapshotNeedsCohering = useSprint10Store((s) => s.snapshotNeedsCohering);
  const priorSnapshot = useSprint10Store((s) => s.priorSnapshot);
  const returnAnswer = useSprint10Store((s) => s.returnAnswer);
  const composeSnapshot = useSprint10Store((s) => s.composeSnapshot);
  const continueToHurl = useSprint10Store((s) => s.continueToHurl);
  const goTo = useSprint10Store((s) => s.goTo);

  useEffect(() => {
    if (snapshotStatus === "idle") void composeSnapshot();
  }, [snapshotStatus, composeSnapshot]);

  const ready = snapshotStatus === "ready" && snapshot !== null;
  const loading = snapshotStatus === "composing" || snapshotStatus === "idle";

  const rows = ready
    ? ROW_META.map((meta) => {
        const value = snapshot[meta.key] as SnapshotRow | undefined;
        return value && typeof value === "object" && "title" in value ? { meta, value } : null;
      }).filter((r): r is { meta: (typeof ROW_META)[number]; value: SnapshotRow } => r !== null)
    : [];

  const onErrorAction = () => {
    if (snapshotNeedsCohering) goTo(3);
    else void composeSnapshot();
  };

  return (
    <SoulSeedScreenShell
      step={showDelta ? 3 : 7}
      mode={showDelta ? "return" : "first"}
      backgroundSrc="/images/soulseed/seed-offering-close.jpg"
    >
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">{showDelta ? "Return" : "7 / 9"}</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Your SoulSeed Snapshot
        </h1>
        <p className="mt-6 text-xl text-soulseed-dawn/74">
          A living summary of you, right now. You can refine this anytime.
        </p>

        {showDelta && ready && priorSnapshot && snapshot && (
          <div className="mt-8">
            <WhatMovedV2
              prior={priorSnapshot}
              current={snapshot}
              whatChangedLine={returnAnswer.trim() || undefined}
            />
          </div>
        )}

        {snapshotStatus === "error" && (
          <DawnGlass className="mt-8 max-w-xl p-6">
            <p className="text-sm text-soulseed-coral">
              {snapshotError ?? "Something went quiet. Try again."}
            </p>
            <GhostButton type="button" className="mt-4" onClick={onErrorAction}>
              {snapshotNeedsCohering ? "Back to your answer" : "Try again"}
            </GhostButton>
          </DawnGlass>
        )}

        {loading && (
          <div className="mt-10 overflow-hidden rounded-[32px] border border-white/16 bg-black/20">
            <div className="flex items-center gap-4 p-6">
              <Whorl className="[--whorl-size:56px]" />
              <p className="text-soulseed-dawn/62">
                drawing your SoulSeed from what you&apos;ve told it…
              </p>
            </div>
            {Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="border-t border-white/10 p-6">
                <div className="h-4 w-40 rounded bg-white/10" />
                <div className="mt-3 h-6 w-3/4 rounded bg-white/8" />
              </div>
            ))}
          </div>
        )}

        {ready && (
          <div className="mt-10 overflow-hidden rounded-[32px] border border-white/16 bg-black/20">
            {rows.map(({ meta, value }) => (
              <div
                key={meta.key}
                className="grid gap-5 border-b border-white/10 p-6 last:border-b-0 md:grid-cols-[220px_1fr]"
              >
                <div className="flex items-start gap-4">
                  <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-soulseed-honey/40 text-xl text-soulseed-honey">
                    {meta.icon}
                  </div>
                  <div>
                    <h3 className="text-lg text-soulseed-honey">{meta.label}</h3>
                    <p className="text-sm text-soulseed-dawn/48">{meta.hint ?? ""}</p>
                  </div>
                </div>
                <div>
                  <p className="text-2xl text-soulseed-dawn">{value.title}</p>
                  <p className="mt-2 text-lg leading-8 text-soulseed-dawn/70">{value.description}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-soulseed-honey">This snapshot will evolve as you do.</p>
            <p className="mt-1 text-sm text-soulseed-dawn/52">
              This profile is what future ANG3Ls will see when they meet you.
            </p>
          </div>
          <IridescentButton type="button" disabled={!ready} onClick={continueToHurl}>
            {showDelta ? "Continue your SoulSeed →" : "Reveal My HURL →"}
          </IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
