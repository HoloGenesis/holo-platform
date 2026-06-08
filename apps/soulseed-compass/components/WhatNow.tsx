interface WhatNowProps {
  /** The Snapshot's first invitation — the one concrete step for the user. */
  invitation?: string | null;
}

/** Closes the loop: turns the Snapshot into a next action + a reason to return. */
export function WhatNow({ invitation }: WhatNowProps) {
  return (
    <div className="glass rounded-2xl p-5">
      <div className="mb-3 text-xs uppercase tracking-[0.25em] gold-text">What now?</div>
      <ol className="space-y-3 text-sm leading-relaxed text-neutral-300">
        <li>
          <span className="text-gold/70">This week — </span>
          {invitation ? (
            <>
              take one small step toward your first invitation:{" "}
              <span className="text-neutral-100">“{invitation}”</span>
            </>
          ) : (
            "take one small, concrete step from your first invitation above."
          )}
        </li>
        <li>
          <span className="text-gold/70">When something shifts — </span>
          come back with your return link below. The SoulSeed remembers you and reflects what&apos;s
          changed since today. That continuity is the point — this isn&apos;t a one-time quiz,
          it&apos;s a living document you can return to.
        </li>
      </ol>
    </div>
  );
}
