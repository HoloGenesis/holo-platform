"use client";

import type { ChamberSlot } from "@holo/contracts";
import { useChamberStore } from "../lib/chamberStore";
import { AstroAddon } from "./AstroAddon";
import { BetweenPlaceChoices } from "./BetweenPlaceChoices";
import { EmailCapture } from "./EmailCapture";
import { HurlCard } from "./HurlCard";
import { RezziePanel } from "./RezziePanel";
import { SoulSeedArtifact } from "./SoulSeedArtifact";
import { WhatNow } from "./WhatNow";

interface ChamberProps {
  slot: ChamberSlot;
}

/** A single chamber. The same component renders all six — only the data differs. */
export function Chamber({ slot }: ChamberProps) {
  const draft = useChamberStore((s) => s.draft);
  const setDraft = useChamberStore((s) => s.setDraft);
  const reflection = useChamberStore((s) => s.reflection);
  const thinking = useChamberStore((s) => s.thinking);
  const turnComplete = useChamberStore((s) => s.turnComplete);
  const turnError = useChamberStore((s) => s.turnError);
  const hurl = useChamberStore((s) => s.hurl);
  const snapshot = useChamberStore((s) => s.snapshot);
  const artifactStatus = useChamberStore((s) => s.artifactStatus);
  const artifactError = useChamberStore((s) => s.artifactError);

  const isTerminal = slot.next === null;
  const isThreshold = slot.key === "threshold";
  const isIdentitySeed = slot.key === "identity-seed";
  const isFreeform = !isTerminal && !isThreshold && !isIdentitySeed;
  const inputsLocked = thinking || turnComplete;
  const [firstQuestion] = slot.prompts.questions;

  return (
    <section className="flex w-full max-w-xl flex-col gap-6">
      <header>
        <p className="text-xs uppercase tracking-[0.35em] text-gold/60">{slot.title}</p>
      </header>

      <RezziePanel
        agentKey={slot.agentKey}
        intro={slot.prompts.intro}
        reflection={reflection}
        thinking={thinking}
      />

      {turnError && <p className="text-sm text-amber-400">{turnError}</p>}

      {/* Threshold: optional name input. */}
      {isThreshold && (
        <label className="block">
          <span className="mb-2 block text-sm text-neutral-400">{firstQuestion}</span>
          <input
            type="text"
            value={draft}
            disabled={inputsLocked}
            onChange={(event) => setDraft(event.target.value)}
            placeholder="optional"
            className="glass w-full rounded-xl px-4 py-3 text-neutral-100 outline-none placeholder:text-neutral-600 focus:!border-gold/50 disabled:opacity-50"
          />
        </label>
      )}

      {/* Identity Seed: the four Between-Place options drive the turn. */}
      {isIdentitySeed && <BetweenPlaceChoices options={slot.prompts.questions} />}

      {/* Reflective chambers: manifest questions + a freeform input. */}
      {isFreeform && (
        <div className="flex flex-col gap-4">
          {slot.prompts.questions.map((question) => (
            <blockquote
              key={question}
              className="border-l-2 border-gold/40 pl-4 text-base text-neutral-300"
            >
              {question}
            </blockquote>
          ))}
          <textarea
            value={draft}
            disabled={inputsLocked}
            onChange={(event) => setDraft(event.target.value)}
            rows={3}
            placeholder="Say what's true, even if it's small."
            className="glass w-full resize-none rounded-xl px-4 py-3 text-neutral-100 outline-none placeholder:text-neutral-600 focus:!border-gold/50 disabled:opacity-50"
          />
          {slot.key === "trajectory-branch" && <AstroAddon />}
        </div>
      )}

      {/* Living Invitation (terminal): orientation → Snapshot → what now → HURL → save. */}
      {isTerminal && (
        <div className="flex flex-col gap-4">
          <p className="text-sm leading-relaxed text-neutral-400">
            You reached the end of the scroll. Here&apos;s your{" "}
            <span className="gold-text">SoulSeed Snapshot</span> — a reading of where you are right
            now, drawn entirely from what you told the compass. Nothing here was invented.
          </p>
          <SoulSeedArtifact snapshot={snapshot} status={artifactStatus} error={artifactError} />
          <WhatNow invitation={snapshot?.firstInvitation} />
          <HurlCard hurl={hurl} />
          <EmailCapture />
        </div>
      )}
    </section>
  );
}
