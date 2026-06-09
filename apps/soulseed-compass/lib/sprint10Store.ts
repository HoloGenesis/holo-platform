"use client";

import { create } from "zustand";
import type { CoheringOutput } from "@holo/contracts";
import { holo } from "./holo";

// Sprint-10 nine-screen sequence state. Deliberately SEPARATE from chamberStore
// so the existing shell keeps working during the rebuild (cutover at S89).
// Uses the EXISTING SDK; anonymous-first.

const TOTAL = 9;
const PRODUCT_KEY = "soulseed" as const;
const clamp = (n: number): number => Math.max(1, Math.min(TOTAL, n));
const ls = (k: string): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem(k) : null;

type StartStatus = "idle" | "starting" | "ready" | "error";
type CoheringStatus = "idle" | "running" | "ready" | "error";
type ConfirmStatus = "idle" | "confirmed" | "correcting";

interface Sprint10Store {
  currentScreen: number;
  total: number;
  // session (S83)
  sessionId: string | null;
  userId: string | null;
  startStatus: StartStatus;
  startError: string | null;
  // cohering (S84)
  answer: string;
  recognition: CoheringOutput | null;
  coheringStatus: CoheringStatus;
  coheringError: string | null;
  confirmStatus: ConfirmStatus;

  advance: () => void;
  back: () => void;
  goTo: (n: number) => void;
  startSession: () => Promise<boolean>;
  setAnswer: (text: string) => void;
  runCohering: (correctionOf?: string) => Promise<void>;
  confirmRecognition: () => Promise<void>;
  correctRecognition: (correction: string) => Promise<void>;
  skipConfirmation: () => Promise<void>;
}

export const useSprint10Store = create<Sprint10Store>((set, get) => ({
  currentScreen: 1,
  total: TOTAL,
  sessionId: null,
  userId: null,
  startStatus: "idle",
  startError: null,
  answer: "",
  recognition: null,
  coheringStatus: "idle",
  coheringError: null,
  confirmStatus: "idle",

  advance: () => set((s) => ({ currentScreen: clamp(s.currentScreen + 1) })),
  back: () => set((s) => ({ currentScreen: clamp(s.currentScreen - 1) })),
  goTo: (n) => set({ currentScreen: clamp(n) }),

  startSession: async () => {
    const { startStatus, sessionId } = get();
    if (startStatus === "starting") return false;
    if (sessionId) return true;
    set({ startStatus: "starting", startError: null });
    try {
      const res = await holo.sessions.start({ productKey: PRODUCT_KEY });
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

  setAnswer: (text) => set({ answer: text }),

  // Single cohering call. Advances to Screen 4 (the listening transition)
  // immediately; Screen 4 auto-advances to Screen 5 when coheringStatus===ready.
  runCohering: async (correctionOf) => {
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    const answer = get().answer.trim();
    if (!userId || !sessionId || answer.length < 1) return;

    set({ currentScreen: 4, coheringStatus: "running", coheringError: null });
    try {
      const out = await holo.cohering.run({ userId, sessionId, answer, correctionOf });
      set({ recognition: out, coheringStatus: "ready", confirmStatus: "idle" });
    } catch (err) {
      set({
        coheringStatus: "error",
        coheringError: err instanceof Error ? err.message : "Something went quiet. Try again.",
      });
    }
  },

  confirmRecognition: async () => {
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (userId && sessionId) {
      try {
        await holo.memory.upsert({
          userId,
          sessionId,
          sourceProduct: PRODUCT_KEY,
          scope: "state",
          content: "true",
          contentJson: { key: "cohering.confirmed", value: true },
          importance: 0.8,
        });
      } catch {
        // best-effort — confirmation never blocks the journey
      }
    }
    set({ confirmStatus: "confirmed", currentScreen: clamp(6) });
  },

  correctRecognition: async (correction) => {
    set({ confirmStatus: "correcting" });
    await get().runCohering(correction);
  },

  skipConfirmation: async () => {
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (userId && sessionId) {
      try {
        await holo.memory.upsert({
          userId,
          sessionId,
          sourceProduct: PRODUCT_KEY,
          scope: "state",
          content: "uncertain",
          contentJson: { key: "cohering.confirmed", value: "uncertain" },
          importance: 0.8,
        });
      } catch {
        // best-effort
      }
    }
    set({ confirmStatus: "idle", currentScreen: clamp(6) });
  },
}));
