"use client";

import { useChamberStore } from "../lib/chamberStore";
import { EmailCapture } from "./EmailCapture";
import { HurlCard } from "./HurlCard";
import { RezziePanel } from "./RezziePanel";
import { SoulSeedArtifact } from "./SoulSeedArtifact";

/** The return-visit threshold: recognition + the single "what changed?" question. */
export function ReturnChamber() {
  const opener = useChamberStore((s) => s.returnOpener);
  const answered = useChamberStore((s) => s.returnAnswered);
  const reflection = useChamberStore((s) => s.returnReflection);
  const thinking = useChamberStore((s) => s.thinking);
  const draft = useChamberStore((s) => s.draft);
  const setDraft = useChamberStore((s) => s.setDraft);
  const turnError = useChamberStore((s) => s.turnError);
  const snapshot = useChamberStore((s) => s.snapshot);
  const hurl = useChamberStore((s) => s.hurl);

  return (
    <section className="flex w-full max-w-xl flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-gold/60">Return</p>
      </header>

      <RezziePanel
        agentKey="rezzie"
        intro={opener ?? "…"}
        reflection={answered ? reflection : null}
        thinking={thinking && !answered}
      />

      {turnError && <p className="text-sm text-amber-400">{turnError}</p>}

      {!answered ? (
        <textarea
          value={draft}
          disabled={thinking}
          onChange={(event) => setDraft(event.target.value)}
          rows={3}
          placeholder="What changed?"
          className="glass w-full resize-none rounded-xl px-4 py-3 text-neutral-100 outline-none placeholder:text-neutral-600 focus:!border-gold/50 disabled:opacity-50"
        />
      ) : (
        <div className="flex flex-col gap-4">
          <SoulSeedArtifact snapshot={snapshot} status="done" />
          <HurlCard hurl={hurl} />
          <EmailCapture />
        </div>
      )}
    </section>
  );
}
