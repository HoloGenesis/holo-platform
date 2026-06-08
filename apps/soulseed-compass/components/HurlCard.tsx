"use client";

import { useState } from "react";

interface HurlCardProps {
  /** The minted HURL from Core, if a turn has produced one yet. */
  hurl?: string | null;
}

/**
 * The user's permanent HURL — explained in human terms, with a one-click
 * "return link" that actually opens (https://…/?hurl=…), since the bare
 * hurl:// string is an identifier, not a URL a browser can open.
 */
export function HurlCard({ hurl }: HurlCardProps) {
  const [copied, setCopied] = useState(false);

  const returnLink =
    hurl && typeof window !== "undefined"
      ? `${window.location.origin}/?hurl=${encodeURIComponent(hurl)}`
      : null;

  const copy = async () => {
    if (!returnLink) return;
    try {
      await navigator.clipboard.writeText(returnLink);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // clipboard blocked — the link stays visible below to copy by hand
    }
  };

  return (
    <div className="glass rounded-2xl border-dashed border-gold/20 p-4">
      <div className="mb-1 text-xs uppercase tracking-[0.25em] text-neutral-500">
        Your permanent address
      </div>
      <code className="break-all text-sm gold-text">{hurl ?? "hurl://soulseed/…"}</code>
      <p className="mt-2 text-xs leading-relaxed text-neutral-400">
        This is your continuation address — not a web page you open, but how the document finds{" "}
        <em>you</em> again. Come back with the link below, even months from now, on any device, and
        the SoulSeed picks up where you left off and shows what&apos;s changed since.
      </p>

      {returnLink && (
        <div className="mt-3 flex flex-col gap-2">
          <button
            type="button"
            onClick={() => void copy()}
            className="self-start rounded-xl border border-gold/30 bg-gold/15 px-4 py-2 text-sm font-medium text-gold-soft transition-all hover:bg-gold/25"
          >
            {copied ? "Copied — keep it safe ✓" : "Copy my return link"}
          </button>
          <code className="break-all text-[11px] text-neutral-600">{returnLink}</code>
        </div>
      )}
    </div>
  );
}
