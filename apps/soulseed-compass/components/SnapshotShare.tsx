"use client";

import { useState } from "react";
import type { SoulSeedSnapshot } from "@holo/contracts";
import { useChamberStore } from "../lib/chamberStore";
import { holo } from "../lib/holo";
import { snapshotToText } from "../lib/snapshotText";

interface SnapshotShareProps {
  snapshot: SoulSeedSnapshot;
}

const BTN =
  "rounded-xl border border-gold/30 bg-gold/15 px-4 py-2 text-sm font-medium text-gold-soft transition-all hover:bg-gold/25 disabled:cursor-not-allowed disabled:opacity-40";

/** "Copy as text" + "Download as image" CTAs below the Snapshot. */
export function SnapshotShare({ snapshot }: SnapshotShareProps) {
  const userId = useChamberStore((s) => s.userId);
  const artifactId = useChamberStore((s) => s.artifactId);
  const recordShare = useChamberStore((s) => s.shareSnapshot);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(snapshotToText(snapshot));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
      void recordShare("copy");
    } catch {
      // clipboard blocked — nothing to do
    }
  };

  const download = async () => {
    if (!artifactId) return;
    setDownloading(true);
    try {
      // the GET emits snapshot_shared { method: "image" } server-side
      const res = await fetch(holo.artifacts.imageUrl(artifactId));
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `soulseed-${(userId ?? "anon").slice(0, 8)}-${artifactId.slice(0, 8)}.png`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    } catch {
      // network/render failure — silent; the Snapshot text is still copyable
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="mt-5 flex flex-wrap gap-2 border-t border-white/10 pt-4">
      <button type="button" onClick={() => void copy()} className={BTN}>
        {copied ? "Copied ✓" : "Copy as text"}
      </button>
      <button
        type="button"
        onClick={() => void download()}
        disabled={!artifactId || downloading}
        className={BTN}
      >
        {downloading ? "Preparing…" : "Download as image"}
      </button>
    </div>
  );
}
