"use client";

import { useState } from "react";
import { useChamberStore } from "../lib/chamberStore";

/** Optional email capture at the export chamber. Sets email on the existing
 * anonymous user — no signup, no new account. */
export function EmailCapture() {
  const status = useChamberStore((s) => s.emailStatus);
  const captured = useChamberStore((s) => s.emailCaptured);
  const captureEmail = useChamberStore((s) => s.captureEmail);
  const [email, setEmail] = useState("");

  if (status === "saved" && captured) {
    return (
      <div className="glass rounded-2xl p-4">
        <p className="text-sm text-neutral-300">
          Saved to <span className="gold-text">{captured}</span>. To come back, use your return link
          below — that&apos;s what reopens this.
        </p>
      </div>
    );
  }

  const valid = /.+@.+\..+/.test(email);

  return (
    <div className="glass rounded-2xl p-4">
      <label className="mb-2 block text-xs uppercase tracking-[0.25em] text-neutral-500">
        Save my SoulSeed
      </label>
      <p className="mb-3 text-xs text-neutral-500">
        Optional. Your return link below works without it — this just keeps your SoulSeed on file.
      </p>
      <div className="flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          disabled={status === "saving"}
          placeholder="you@somewhere"
          className="glass flex-1 rounded-xl px-4 py-2.5 text-neutral-100 outline-none placeholder:text-neutral-600 focus:!border-gold/50 disabled:opacity-50"
        />
        <button
          type="button"
          disabled={!valid || status === "saving"}
          onClick={() => void captureEmail(email)}
          className="rounded-xl border border-gold/30 bg-gold/15 px-4 py-2.5 text-sm font-medium text-gold-soft transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40"
        >
          {status === "saving" ? "Saving…" : "Save my HURL"}
        </button>
      </div>
      {status === "error" && <p className="mt-2 text-xs text-amber-400">Couldn&apos;t save. Try again.</p>}
    </div>
  );
}
