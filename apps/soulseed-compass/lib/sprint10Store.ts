"use client";

import { create } from "zustand";

// Sprint-10 nine-screen sequence state. Deliberately SEPARATE from chamberStore
// so the existing shell keeps working during the rebuild (cutover at S89).
// Pure navigation for now — no session/engine wiring lives here.

const TOTAL = 9;
const clamp = (n: number): number => Math.max(1, Math.min(TOTAL, n));

interface Sprint10Store {
  currentScreen: number;
  total: number;
  advance: () => void;
  back: () => void;
  goTo: (n: number) => void;
}

export const useSprint10Store = create<Sprint10Store>((set) => ({
  currentScreen: 1,
  total: TOTAL,
  advance: () => set((s) => ({ currentScreen: clamp(s.currentScreen + 1) })),
  back: () => set((s) => ({ currentScreen: clamp(s.currentScreen - 1) })),
  goTo: (n) => set({ currentScreen: clamp(n) }),
}));
