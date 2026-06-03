interface HurlCardProps {
  /** The minted HURL from Core, if a turn has produced one yet. */
  hurl?: string | null;
}

/** Displays the user's permanent HURL once Core mints it. */
export function HurlCard({ hurl }: HurlCardProps) {
  return (
    <div className="glass rounded-2xl border-dashed border-gold/20 p-4">
      <div className="mb-1 text-xs uppercase tracking-[0.25em] text-neutral-500">
        Your permanent address
      </div>
      <code className="break-all text-sm gold-text">{hurl ?? "hurl://soulseed/…"}</code>
      <p className="mt-2 text-xs italic text-neutral-500">This isn&apos;t a link. It&apos;s a continuation.</p>
    </div>
  );
}
