"use client";

import { useChamberStore } from "../lib/chamberStore";

const ASTRO_ADDON = "astro-addon";

/**
 * The entitlement-gated deeper-trajectory slot. NO astro engine here (v1.1) —
 * only the locked / unlocked-but-coming-soon UX. In free beta (payments off)
 * the layer is simply open.
 */
export function AstroAddon() {
  const loaded = useChamberStore((s) => s.entitlementsLoaded);
  const paymentsEnabled = useChamberStore((s) => s.paymentsEnabled);
  const owned = useChamberStore((s) => s.entitlements.includes(ASTRO_ADDON));
  const pending = useChamberStore((s) => s.checkoutPending);
  const buyAddon = useChamberStore((s) => s.buyAddon);

  if (!loaded) {
    return (
      <div className="glass rounded-2xl p-4 text-sm text-neutral-500">
        Checking the deeper layer…
      </div>
    );
  }

  // Unlocked (owned) or open (free beta): the reserved "engine arrives v1.1" state.
  if (owned || !paymentsEnabled) {
    return (
      <div className="glass rounded-2xl border-gold/25 p-4">
        <div className="mb-1 flex items-center gap-2 text-xs uppercase tracking-[0.22em] gold-text">
          <span className="h-1.5 w-1.5 rounded-full bg-gold animate-breathe" />
          Deeper trajectory · unlocked
        </div>
        <p className="text-sm leading-relaxed text-neutral-200">
          Your deeper trajectory layer is reserved. The engine arrives in v1.1 — your access
          begins now, the room opens then.
        </p>
      </div>
    );
  }

  // Locked: payments on, add-on not owned → the paywall CTA.
  return (
    <div className="glass rounded-2xl p-4">
      <div className="mb-1 text-xs uppercase tracking-[0.22em] text-neutral-500">
        Deeper trajectory · locked
      </div>
      <p className="mb-3 text-sm leading-relaxed text-neutral-300">
        A deeper reading of where you&apos;re heading. The engine ships in v1.1; the add-on
        reserves your access now.
      </p>
      <button
        type="button"
        disabled={pending}
        onClick={() => void buyAddon()}
        className="rounded-xl border border-gold/30 bg-gold/15 px-4 py-2 text-sm font-medium text-gold-soft transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
      >
        {pending ? "Unlocking…" : "Unlock the add-on"}
      </button>
    </div>
  );
}
