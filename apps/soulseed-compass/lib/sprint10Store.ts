"use client";

import { create } from "zustand";
import type { CoheringOutput, ProofOutput, SoulSeedSnapshotV2 } from "@holo/contracts";
import { holo } from "./holo";
import { returnUrlFromSnapshot } from "./hurl";

// Sprint-10 nine-screen sequence state. Deliberately SEPARATE from chamberStore
// so the existing shell keeps working during the rebuild (cutover at S89).
// Uses the EXISTING SDK; anonymous-first.

const TOTAL = 9;
const PRODUCT_KEY = "soulseed" as const;
const clamp = (n: number): number => Math.max(1, Math.min(TOTAL, n));
const ls = (k: string): string | null =>
  typeof window !== "undefined" ? window.localStorage.getItem(k) : null;

// Confusion interrupt (S84b, Brooks's non-negotiable). Deterministic substring
// check — no LLM judgment on whether the user is confused.
const CONFUSION_PHRASES = [
  "this is confusing",
  "what is this",
  "why am i doing this",
  "this makes no sense",
  "i don't get it",
  "i dont get it",
  "what's going on",
  "i'm confused",
  "im confused",
] as const;

export function isConfusionPhrase(text: string): boolean {
  const t = text.toLowerCase();
  return CONFUSION_PHRASES.some((phrase) => t.includes(phrase));
}

type StartStatus = "idle" | "starting" | "ready" | "error";
type CoheringStatus = "idle" | "running" | "ready" | "error";
type ConfirmStatus = "idle" | "confirmed" | "correcting";
type ProofStatus = "idle" | "running" | "ready" | "error";

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
  // confusion interrupt (S84b)
  confusionShown: boolean;
  // proof (S85)
  proof: ProofOutput | null;
  proofStatus: ProofStatus;
  proofError: string | null;
  proofNeedsCohering: boolean;
  // snapshot v2 (S86)
  snapshot: SoulSeedSnapshotV2 | null;
  snapshotStatus: "idle" | "composing" | "ready" | "error";
  snapshotError: string | null;
  snapshotNeedsCohering: boolean;
  // HURL reveal + optional email (S87)
  emailDraft: string;
  emailStatus: "idle" | "sending" | "sent" | "error";
  emailError: string | null;
  emailSentTo: string | null;
  // completion (S88)
  completionStatus: "idle" | "completing" | "complete" | "error";
  completedAt: string | null;

  advance: () => void;
  back: () => void;
  goTo: (n: number) => void;
  startSession: () => Promise<boolean>;
  setAnswer: (text: string) => void;
  runCohering: (opts?: { correctionOf?: string; addedContext?: string }) => Promise<void>;
  confirmRecognition: () => Promise<void>;
  /** Path (c) "Not quite": regenerate from the corrective signal. */
  correctRecognition: (correction: string) => Promise<void>;
  /** Path (b) "Mostly, but there's more": augment — both inputs stay valid signal. */
  augmentRecognition: (addition: string) => Promise<void>;
  triggerConfusionInterrupt: () => Promise<void>;
  dismissConfusionInterrupt: () => void;
  runProof: () => Promise<void>;
  composeSnapshot: () => Promise<void>;
  continueToHurl: () => void;
  /** Shareable return URL derived from the snapshot; null until one exists. Computed on demand. */
  getReturnUrl: () => string | null;
  setEmailDraft: (text: string) => void;
  /** Optional email send via the existing S60 setEmail → sendHurlInvitation chain. */
  sendHurlEmail: () => Promise<void>;
  resetEmailCapture: () => void;
  /** Record hurl.opened (analytic) and advance to Screen 9. Internal — never redirects. */
  openMyHurl: () => Promise<void>;
  /** Screen 9 mount: write flow.completed exactly once (re-entry guarded). */
  completeFlow: () => Promise<void>;
  /** The one hard navigation in Sprint-10: leave for the return URL (S25 resume). */
  enterMySoulSeed: () => Promise<void>;
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
  confusionShown: false,
  proof: null,
  proofStatus: "idle",
  proofError: null,
  proofNeedsCohering: false,
  snapshot: null,
  snapshotStatus: "idle",
  snapshotError: null,
  snapshotNeedsCohering: false,
  emailDraft: "",
  emailStatus: "idle",
  emailError: null,
  emailSentTo: null,
  completionStatus: "idle",
  completedAt: null,

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
  // Confusion gate (S84b): a confusion phrase NEVER reaches the LLM — hard
  // pause + explain + re-ask, no screen advance, no chamber memories.
  runCohering: async (opts) => {
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    const answer = get().answer.trim();
    if (!userId || !sessionId || answer.length < 1) return;

    if (isConfusionPhrase(answer)) {
      await get().triggerConfusionInterrupt();
      return;
    }

    set({ currentScreen: 4, coheringStatus: "running", coheringError: null });
    try {
      const out = await holo.cohering.run({
        userId,
        sessionId,
        answer,
        correctionOf: opts?.correctionOf,
        addedContext: opts?.addedContext,
      });
      set({ recognition: out, coheringStatus: "ready", confirmStatus: "idle" });
    } catch (err) {
      set({
        coheringStatus: "error",
        coheringError: err instanceof Error ? err.message : "Something went quiet. Try again.",
      });
    }
  },

  triggerConfusionInterrupt: async () => {
    set({ confusionShown: true });
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (userId && sessionId) {
      try {
        await holo.memory.upsert({
          userId,
          sessionId,
          sourceProduct: PRODUCT_KEY,
          scope: "event",
          content: "Confusion interrupt shown; product explained; user re-asked.",
          contentJson: { key: "cohering.confusion_interrupt" },
          importance: 0.1,
        });
      } catch {
        // best-effort — the interrupt itself never depends on the write
      }
    }
  },

  dismissConfusionInterrupt: () => {
    set({ confusionShown: false, answer: "" });
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
    await get().runCohering({ correctionOf: correction });
  },

  augmentRecognition: async (addition) => {
    set({ confirmStatus: "correcting" });
    await get().runCohering({ addedContext: addition });
  },

  runProof: async () => {
    // guard re-entry (React strict-mode double-invokes the mount effect; also
    // avoids racing the proof.shown upsert into duplicate rows)
    const status = get().proofStatus;
    if (status === "running" || status === "ready") return;
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (!userId || !sessionId) {
      set({
        proofStatus: "error",
        proofError: "Cohering signal missing — re-run from Screen 3.",
        proofNeedsCohering: true,
      });
      return;
    }
    set({ proofStatus: "running", proofError: null, proofNeedsCohering: false });
    try {
      const out = await holo.proof.run({ userId, sessionId });
      set({ proof: out, proofStatus: "ready" });
    } catch (err) {
      const code = (err as { code?: unknown })?.code;
      const needsCohering = code === "cohering_signal_missing";
      set({
        proofStatus: "error",
        proofError: needsCohering
          ? "Cohering signal missing — re-run from Screen 3."
          : err instanceof Error
            ? err.message
            : "Couldn't draw the comparison. Try again.",
        proofNeedsCohering: needsCohering,
      });
    }
  },

  composeSnapshot: async () => {
    // re-entry guard (React strict-mode double-invokes the mount effect)
    const status = get().snapshotStatus;
    if (status === "composing" || status === "ready") return;
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (!userId || !sessionId) {
      set({
        snapshotStatus: "error",
        snapshotError: "Cohering signal missing — re-run from Screen 3.",
        snapshotNeedsCohering: true,
      });
      return;
    }
    set({ snapshotStatus: "composing", snapshotError: null, snapshotNeedsCohering: false });
    try {
      const res = await holo.artifacts.composeSnapshotV2({ userId, sessionId });
      set({ snapshot: res.contentJson, snapshotStatus: "ready" });
    } catch (err) {
      const code = (err as { code?: unknown })?.code;
      const needsCohering = code === "cohering_signal_missing";
      set({
        snapshotStatus: "error",
        snapshotError: needsCohering
          ? "Cohering signal missing — re-run from Screen 3."
          : err instanceof Error
            ? err.message
            : "Couldn't compose your Snapshot. Try again.",
        snapshotNeedsCohering: needsCohering,
      });
    }
  },

  continueToHurl: () => set({ currentScreen: clamp(8) }),

  getReturnUrl: () => {
    const snapshot = get().snapshot;
    return snapshot ? returnUrlFromSnapshot(snapshot) : null;
  },

  setEmailDraft: (text) => set({ emailDraft: text }),

  sendHurlEmail: async () => {
    const { emailStatus, emailDraft } = get();
    if (emailStatus === "sending" || emailStatus === "sent") return;
    const userId = get().userId ?? ls("sprint10:userId");
    const email = emailDraft.trim();
    if (!userId || email.length === 0) return;
    set({ emailStatus: "sending", emailError: null });
    try {
      // existing S60 chain: setEmail stores the address + triggers the HURL
      // invitation send (idempotent server-side within 1h)
      await holo.users.setEmail({ userId, email });
      set({ emailStatus: "sent", emailSentTo: email, emailDraft: "" });
    } catch (err) {
      set({
        emailStatus: "error",
        emailError: err instanceof Error ? err.message : "Couldn't send. Try again.",
      });
    }
  },

  resetEmailCapture: () => set({ emailStatus: "idle", emailError: null, emailDraft: "" }),

  openMyHurl: async () => {
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
          contentJson: { key: "hurl.opened" },
          importance: 0.2,
        });
      } catch {
        // analytic signal only — never blocks the journey
      }
    }
    set({ currentScreen: clamp(9) });
  },

  // "First run proves meetability. Returns deepen identity. The first SoulSeed
  // is not the whole tree. It is the viable seed." — Brooks's Q-O lock. Screen 9
  // closes the cohering event; flow.completed is the durable record of the seed.
  completeFlow: async () => {
    const status = get().completionStatus;
    if (status === "completing" || status === "complete") return; // exactly-once guard
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (!userId || !sessionId) {
      set({ completionStatus: "error" });
      return;
    }
    set({ completionStatus: "completing" });
    const completedAt = new Date().toISOString();
    try {
      await holo.memory.upsert({
        userId,
        sessionId,
        sourceProduct: PRODUCT_KEY,
        scope: "state",
        content: "SoulSeed first run complete.",
        contentJson: { key: "flow.completed", completedAt },
        importance: 0.85,
      });
      set({ completionStatus: "complete", completedAt });
    } catch {
      set({ completionStatus: "error" });
    }
  },

  enterMySoulSeed: async () => {
    const returnUrl = get().getReturnUrl();
    if (!returnUrl) return;
    const userId = get().userId ?? ls("sprint10:userId");
    const sessionId = get().sessionId ?? ls("sprint10:sessionId");
    if (userId && sessionId) {
      try {
        // best-effort, written immediately before the navigation; never blocks it
        await holo.memory.upsert({
          userId,
          sessionId,
          sourceProduct: PRODUCT_KEY,
          scope: "state",
          content: "true",
          contentJson: { key: "flow.entered_my_soulseed" },
          importance: 0.3,
        });
      } catch {
        // fire-and-forget — navigation proceeds regardless
      }
    }
    if (typeof window !== "undefined") {
      window.location.assign(returnUrl); // the cohering event closes; the living document opens
    }
  },
}));
