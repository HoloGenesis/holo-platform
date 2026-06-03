"use client";

import { useEffect, useState, type ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useChamberStore } from "../lib/chamberStore";
import { useChamberProgression } from "../lib/useChamberProgression";
import { Chamber } from "./Chamber";
import { HolotorusVisual } from "./HolotorusVisual";
import { ProgressRail } from "./ProgressRail";
import { ReturnChamber } from "./ReturnChamber";

// Cardiac scroll: a slow, heart-eased rise as one chamber yields to the next.
const SCENE = {
  initial: { opacity: 0, y: 28, scale: 0.985 },
  animate: { opacity: 1, y: 0, scale: 1 },
  exit: { opacity: 0, y: -28, scale: 0.985 },
  transition: { duration: 0.6, ease: [0.16, 1, 0.3, 1] as const },
};

function timeGreeting(): string {
  const h = new Date().getHours();
  if (h < 5) return "It's late. You're here anyway.";
  if (h < 12) return "Morning.";
  if (h < 18) return "Afternoon.";
  return "Evening.";
}

export function HoloscrollyShell() {
  const phase = useChamberStore((s) => s.phase);
  const error = useChamberStore((s) => s.error);
  const thinking = useChamberStore((s) => s.thinking);
  const turnComplete = useChamberStore((s) => s.turnComplete);
  const draft = useChamberStore((s) => s.draft);
  const init = useChamberStore((s) => s.init);
  const submitTurn = useChamberStore((s) => s.submitTurn);
  const advance = useChamberStore((s) => s.advance);
  const restart = useChamberStore((s) => s.restart);
  const generateArtifact = useChamberStore((s) => s.generateArtifact);
  const artifactStatus = useChamberStore((s) => s.artifactStatus);
  const sessionId = useChamberStore((s) => s.sessionId);
  const isReturnVisit = useChamberStore((s) => s.isReturnVisit);
  const returnAnswered = useChamberStore((s) => s.returnAnswered);
  const submitReturn = useChamberStore((s) => s.submitReturn);
  const entitlementsLoaded = useChamberStore((s) => s.entitlementsLoaded);
  const loadEntitlements = useChamberStore((s) => s.loadEntitlements);

  const { currentChamber, currentSlot, progress, isTerminal, railChambers } =
    useChamberProgression();

  // Client-only greeting (avoids SSR hour mismatch).
  const [greeting, setGreeting] = useState<string | null>(null);
  useEffect(() => setGreeting(timeGreeting()), []);

  useEffect(() => {
    void init();
  }, [init]);

  // At the terminal chamber (first journey only), ask Core to assemble the
  // Snapshot once. Return visits generate it via submitReturn instead.
  useEffect(() => {
    if (!isReturnVisit && phase === "ready" && isTerminal && sessionId && artifactStatus === "idle") {
      void generateArtifact();
    }
  }, [isReturnVisit, phase, isTerminal, sessionId, artifactStatus, generateArtifact]);

  // Load entitlements when the trajectory chamber needs to gate the deeper layer.
  useEffect(() => {
    if (phase === "ready" && sessionId && currentChamber === "trajectory-branch" && !entitlementsLoaded) {
      void loadEntitlements();
    }
  }, [phase, sessionId, currentChamber, entitlementsLoaded, loadEntitlements]);

  if (phase === "loading") {
    return (
      <>
        <HolotorusVisual />
        <Centered>
          <span className="text-sm tracking-wide text-neutral-400">Awakening the room…</span>
        </Centered>
      </>
    );
  }
  if (phase === "error") {
    return (
      <>
        <HolotorusVisual />
        <Centered>
          <p className="text-neutral-300">Couldn&apos;t reach HOLO Core.</p>
          <p className="mb-4 text-sm text-neutral-600">{error}</p>
          <PrimaryButton onClick={() => void init()}>Try again</PrimaryButton>
        </Centered>
      </>
    );
  }

  // --- Return visit: recognition + the single "what changed?" question ---
  if (isReturnVisit) {
    return (
      <>
        <HolotorusVisual />
        <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8">
          <header className="mb-10 flex items-baseline justify-between">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-200">SoulSeed Compass</h1>
            <span className="text-[10px] uppercase tracking-[0.25em] text-gold/50">return</span>
          </header>
          <main className="flex flex-1 items-start justify-center">
            <motion.div className="w-full" {...SCENE}>
              <ReturnChamber />
            </motion.div>
          </main>
          <footer className="mt-10 flex items-center justify-end gap-3">
            {thinking ? (
              <PrimaryButton disabled>Listening…</PrimaryButton>
            ) : returnAnswered ? (
              <PrimaryButton onClick={() => void restart()}>Begin again</PrimaryButton>
            ) : (
              <PrimaryButton onClick={() => void submitReturn(draft)}>Reflect</PrimaryButton>
            )}
          </footer>
        </div>
      </>
    );
  }

  const isThreshold = currentChamber === "threshold";
  const isIdentitySeed = currentChamber === "identity-seed";

  const onReflect = () => {
    void submitTurn({
      message: draft || undefined,
      formData: currentChamber === "threshold" && draft ? { name: draft } : undefined,
    });
  };

  return (
    <>
      <HolotorusVisual />
      <div className="mx-auto flex min-h-screen w-full max-w-2xl flex-col px-5 py-8">
        <header className="mb-10 flex flex-col gap-6">
          <div className="flex items-baseline justify-between">
            <h1 className="text-sm font-semibold tracking-tight text-neutral-200">SoulSeed Compass</h1>
            {isThreshold && greeting && (
              <span className="text-[11px] tracking-wide text-gold/50">{greeting}</span>
            )}
          </div>
          <ProgressRail chambers={railChambers} currentKey={currentChamber} progress={progress} />
        </header>

        <main className="flex flex-1 items-start justify-center">
          <AnimatePresence mode="wait">
            <motion.div key={currentChamber} className="w-full" {...SCENE}>
              {currentSlot ? (
                <Chamber slot={currentSlot} />
              ) : (
                <p className="text-neutral-500">No chamber found.</p>
              )}
            </motion.div>
          </AnimatePresence>
        </main>

        <footer className="mt-10 flex items-center justify-end gap-3">
          {thinking ? (
            <PrimaryButton disabled>Listening…</PrimaryButton>
          ) : isTerminal ? (
            <PrimaryButton onClick={() => void restart()}>Begin again</PrimaryButton>
          ) : turnComplete ? (
            <PrimaryButton onClick={advance}>Continue</PrimaryButton>
          ) : isIdentitySeed ? (
            <span className="text-sm text-neutral-500">Pick the one that&apos;s closest.</span>
          ) : (
            <PrimaryButton onClick={onReflect}>Reflect</PrimaryButton>
          )}
        </footer>
      </div>
    </>
  );
}

function Centered({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-2 px-5 text-center">
      {children}
    </div>
  );
}

function PrimaryButton({
  children,
  onClick,
  disabled,
}: {
  children: ReactNode;
  onClick?: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="rounded-xl border border-gold/30 bg-gold/15 px-5 py-2.5 text-sm font-medium text-gold-soft shadow-gold transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
    >
      {children}
    </button>
  );
}
