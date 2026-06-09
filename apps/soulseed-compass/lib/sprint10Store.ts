"use client";

import { create } from "zustand";
import { holo } from "./holo";

// Sprint-10 nine-screen sequence state. Deliberately SEPARATE from chamberStore
// so the existing shell keeps working during the rebuild (cutover at S89).
// Session start (S83) uses the EXISTING SDK; anonymous-first, no email here.

const TOTAL = 9;
const PRODUCT_KEY = "soulseed" as const;
const clamp = (n: number): number => Math.max(1, Math.min(TOTAL, n));

type StartStatus = "idle" | "starting" | "ready" | "error";

interface Sprint10Store {
  currentScreen: number;
  total: number;
  // session (S83) — anonymous-first; email is captured on a later screen
  sessionId: string | null;
  userId: string | null;
  startStatus: StartStatus;
  startError: string | null;
  advance: () => void;
  back: () => void;
  goTo: (n: number) => void;
  /** Start (or reuse) the SoulSeed session via the SDK. Resolves true on success. */
  startSession: () => Promise<boolean>;
}

export const useSprint10Store = create<Sprint10Store>((set, get) => ({
  currentScreen: 1,
  total: TOTAL,
  sessionId: null,
  userId: null,
  startStatus: "idle",
  startError: null,

  advance: () => set((s) => ({ currentScreen: clamp(s.currentScreen + 1) })),
  back: () => set((s) => ({ currentScreen: clamp(s.currentScreen - 1) })),
  goTo: (n) => set({ currentScreen: clamp(n) }),

  startSession: async () => {
    const { startStatus, sessionId } = get();
    if (startStatus === "starting") return false; // in flight
    if (sessionId) return true; // already started — reuse, don't double-create

    set({ startStatus: "starting", startError: null });
    try {
      const res = await holo.sessions.start({ productKey: PRODUCT_KEY });
      // sprint10: prefix so it never collides with the old chamberStore keys
      if (typeof window !== "undefined") {
        window.localStorage.setItem("sprint10:userId", res.userId);
        window.localStorage.setItem("sprint10:sessionId", res.sessionId);
      }
      set({ userId: res.userId, sessionId: res.sessionId, startStatus: "ready" });
      return true;
    } catch (err) {
      set({
        startStatus: "error",
        startError: err instanceof Error ? err.message : "Couldn't start. Try again.",
      });
      return false;
    }
  },
}));
