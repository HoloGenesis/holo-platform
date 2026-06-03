"use client";

import type { ChamberKey, ChamberSlot } from "@holo/contracts";
import { calculateProgress } from "@holo/hdom";
import { soulseedCompassManifest } from "@holo/product-manifests";
import { useChamberStore } from "./chamberStore";

export interface ChamberView {
  currentChamber: ChamberKey;
  currentSlot: ChamberSlot | undefined;
  progress: number;
  isTerminal: boolean;
  railChambers: { key: ChamberKey; title: string }[];
}

/** Manifest-derived view model layered over the live store state. */
export function useChamberProgression(): ChamberView {
  const currentChamber = useChamberStore((s) => s.currentChamber);
  const manifest = soulseedCompassManifest;
  const currentSlot = manifest.chambers.find((c) => c.key === currentChamber);

  return {
    currentChamber,
    currentSlot,
    progress: calculateProgress(manifest, currentChamber),
    isTerminal: currentSlot ? currentSlot.next === null : false,
    railChambers: manifest.chambers.map((c) => ({ key: c.key, title: c.title })),
  };
}
