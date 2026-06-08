"use client";

import { create } from "zustand";
import type { ChamberKey, ReturnView, SessionState, SoulSeedSnapshot } from "@holo/contracts";
import { getNextChamber } from "@holo/hdom";
import { soulseedCompassManifest } from "@holo/product-manifests";
import { holo } from "./holo";

const PRODUCT_KEY = "soulseed" as const;

/** Between-Place cards map to arrival-vector keys by index (manifest order). */
export const ARRIVAL_VECTORS = ["lost", "building", "becoming", "unknown"] as const;

const MANIFEST = soulseedCompassManifest;
const FIRST_CHAMBER: ChamberKey = MANIFEST.chambers[0]?.key ?? "threshold";

function agentKeyFor(chamber: ChamberKey) {
  return MANIFEST.chambers.find((c) => c.key === chamber)?.agentKey ?? "rezzie";
}

// --- session persistence (so a mid-journey reload resumes, not restarts) ---
const STORAGE_KEY = "holo.soulseed.session";
interface StoredSession {
  userId: string;
  sessionId: string;
}
function readStoredSession(): StoredSession | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const value = JSON.parse(raw) as StoredSession;
    return value?.sessionId ? value : null;
  } catch {
    return null;
  }
}
function writeStoredSession(value: StoredSession): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota / privacy-mode errors */
  }
}
function clearStoredSession(): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

type Phase = "loading" | "ready" | "error";

interface ChamberStore {
  phase: Phase;
  error: string | null;
  started: boolean;

  userId: string | null;
  sessionId: string | null;
  currentChamber: ChamberKey; // the chamber shown in the UI
  sessionState: SessionState | null; // authoritative Core state
  visited: ChamberKey[];
  hurl: string | null;

  // per-turn UI
  thinking: boolean;
  reflection: string | null; // REZZIE's message for the current chamber
  turnComplete: boolean;
  pendingNext: ChamberKey | null;
  turnError: string | null;

  // local inputs
  draft: string; // name (threshold) or freeform text
  arrivalVector: string | null;

  // chamber 6 artifact
  artifactStatus: "idle" | "generating" | "done" | "error";
  snapshot: SoulSeedSnapshot | null;
  returnView: ReturnView | null; // "what moved" diff, present only on a return visit
  artifactError: string | null;

  // email capture (export chamber)
  emailStatus: "idle" | "saving" | "saved" | "error";
  emailCaptured: string | null;

  // entitlements / paywall (S27)
  paymentsEnabled: boolean;
  entitlements: string[];
  entitlementsLoaded: boolean;
  checkoutPending: boolean;

  // return visit (the moat)
  isReturnVisit: boolean;
  returnArrivalVector: string | null;
  returnOpener: string | null;
  returnAnswered: boolean;
  returnReflection: string | null;

  init: () => Promise<void>;
  restart: () => Promise<void>;
  captureEmail: (email: string) => Promise<void>;
  setDraft: (value: string) => void;
  submitTurn: (input: { message?: string; formData?: Record<string, unknown> }) => Promise<void>;
  chooseArrivalVector: (index: number) => Promise<void>;
  advance: () => void;
  generateArtifact: () => Promise<void>;
  enterByHurl: (path: string) => Promise<void>;
  submitReturn: (message: string) => Promise<void>;
  loadEntitlements: () => Promise<void>;
  buyAddon: () => Promise<void>;
}

export const useChamberStore = create<ChamberStore>((set, get) => ({
  phase: "loading",
  error: null,
  started: false,

  userId: null,
  sessionId: null,
  currentChamber: FIRST_CHAMBER,
  sessionState: null,
  visited: [FIRST_CHAMBER],
  hurl: null,

  thinking: false,
  reflection: null,
  turnComplete: false,
  pendingNext: null,
  turnError: null,

  draft: "",
  arrivalVector: null,

  artifactStatus: "idle",
  snapshot: null,
  returnView: null,
  artifactError: null,

  emailStatus: "idle",
  emailCaptured: null,

  paymentsEnabled: false,
  entitlements: [],
  entitlementsLoaded: false,
  checkoutPending: false,

  isReturnVisit: false,
  returnArrivalVector: null,
  returnOpener: null,
  returnAnswered: false,
  returnReflection: null,

  init: async () => {
    if (get().started) return; // guard against React strict-mode double-invoke
    set({ started: true, phase: "loading", error: null });

    // Return-by-HURL takes precedence (works in a fresh browser, no localStorage).
    if (typeof window !== "undefined") {
      const hurlParam = new URLSearchParams(window.location.search).get("hurl");
      if (hurlParam) {
        await get().enterByHurl(hurlParam);
        return;
      }
    }

    // Resume a prior session if one is stored (survives a page reload).
    const stored = readStoredSession();
    if (stored) {
      try {
        const session = await holo.sessions.get(stored.sessionId);
        set({
          phase: "ready",
          userId: session.userId,
          sessionId: session.sessionId,
          currentChamber: session.state.currentChamber,
          sessionState: session.state,
          visited:
            session.state.chambersVisited.length > 0
              ? session.state.chambersVisited
              : [session.state.currentChamber],
          hurl: session.hurl ?? null,
        });
        return;
      } catch {
        clearStoredSession(); // stale/invalid id — fall through to a fresh start
      }
    }

    try {
      const session = await holo.sessions.start({ productKey: PRODUCT_KEY });
      writeStoredSession({ userId: session.userId, sessionId: session.sessionId });
      set({
        phase: "ready",
        userId: session.userId,
        sessionId: session.sessionId,
        currentChamber: session.state.currentChamber,
        sessionState: session.state,
        visited: [session.state.currentChamber],
      });
    } catch (err) {
      set({ phase: "error", error: err instanceof Error ? err.message : "Could not reach Core." });
    }
  },

  restart: async () => {
    clearStoredSession();
    set({
      started: false,
      reflection: null,
      turnComplete: false,
      pendingNext: null,
      turnError: null,
      draft: "",
      arrivalVector: null,
      hurl: null,
      sessionId: null,
      userId: null,
      sessionState: null,
      artifactStatus: "idle",
      snapshot: null,
      returnView: null,
      artifactError: null,
      emailStatus: "idle",
      emailCaptured: null,
      entitlements: [],
      entitlementsLoaded: false,
      checkoutPending: false,
      isReturnVisit: false,
      returnArrivalVector: null,
      returnOpener: null,
      returnAnswered: false,
      returnReflection: null,
    });
    await get().init();
  },

  captureEmail: async (email) => {
    const { userId, emailStatus } = get();
    if (!userId || emailStatus === "saving") return;
    set({ emailStatus: "saving" });
    try {
      const result = await holo.users.setEmail({ userId, email });
      set({ emailStatus: "saved", emailCaptured: result.email });
    } catch {
      set({ emailStatus: "error" });
    }
  },

  loadEntitlements: async () => {
    const { userId } = get();
    if (!userId) return;
    try {
      const res = await holo.entitlements.check(userId);
      set({
        entitlements: res.entitlements.map((e) => e.key),
        paymentsEnabled: res.paymentsEnabled,
        entitlementsLoaded: true,
      });
    } catch {
      set({ entitlementsLoaded: true });
    }
  },

  buyAddon: async () => {
    const { userId, checkoutPending } = get();
    if (!userId || checkoutPending) return;
    set({ checkoutPending: true });
    try {
      const res = await holo.commerce.createCheckout({ userId, item: "astro-addon" });
      if (res.mode === "live" && res.checkoutUrl) {
        window.location.href = res.checkoutUrl; // real Stripe; webhook grants on return
        return;
      }
      // mock (granted) or free-beta (open) → just refresh entitlements
      await get().loadEntitlements();
    } finally {
      set({ checkoutPending: false });
    }
  },

  enterByHurl: async (path) => {
    set({ phase: "loading", error: null, isReturnVisit: true });
    try {
      const resolved = await holo.hurl.resolve(path);
      const resumed = await holo.sessions.resume({
        userId: resolved.userId,
        sessionId: resolved.sessionId,
      });
      const priorVector = resumed.state.custom?.["arrivalVector"];
      const arrivalVector = typeof priorVector === "string" ? priorVector : null;

      writeStoredSession({ userId: resolved.userId, sessionId: resolved.sessionId });
      set({
        phase: "ready",
        userId: resolved.userId,
        sessionId: resolved.sessionId,
        sessionState: resumed.state,
        returnArrivalVector: arrivalVector,
        hurl: path,
      });

      // REZZIE composes the "what changed?" opener (agent, not hardcoded UI).
      const opener = await holo.agents.run({
        userId: resolved.userId,
        sessionId: resolved.sessionId,
        productKey: PRODUCT_KEY,
        chamberKey: "threshold",
        agentKey: "rezzie",
        input: {},
        context: {
          returnContext: {
            arrivalVector: arrivalVector ?? "between worlds",
            lastChamber: resumed.resumeContext.lastChamber,
            lastSnapshotSummary: resumed.resumeContext.lastSnapshotSummary,
          },
        },
      });
      set({ returnOpener: opener.message });
    } catch (err) {
      set({ phase: "error", error: err instanceof Error ? err.message : "That HURL didn't resolve." });
    }
  },

  submitReturn: async (message) => {
    const { userId, sessionId, thinking, returnArrivalVector } = get();
    if (!userId || !sessionId || thinking) return;
    set({ thinking: true, turnError: null });
    try {
      await holo.events.write({
        userId,
        sessionId,
        productKey: PRODUCT_KEY,
        chamberKey: "threshold",
        eventType: "return.changed",
        payload: { message },
      });
      const output = await holo.agents.run({
        userId,
        sessionId,
        productKey: PRODUCT_KEY,
        chamberKey: "threshold",
        agentKey: "rezzie",
        input: { message },
        context: { returnContext: { arrivalVector: returnArrivalVector ?? "between worlds" } },
      });
      // persist the delta (memoryWrites + statePatch); terminal session stays put
      await holo.orchestration.next({ userId, sessionId, productKey: PRODUCT_KEY, agentOutput: output });
      // regenerate the snapshot from the now-evolved memory
      const artifact = await holo.artifacts.create({ userId, sessionId, productKey: PRODUCT_KEY });
      set({
        thinking: false,
        returnAnswered: true,
        returnReflection: output.message,
        snapshot: artifact.contentJson,
        returnView: artifact.returnView ?? null,
        artifactStatus: "done",
        hurl: artifact.hurl,
      });
    } catch (err) {
      set({
        thinking: false,
        turnError: err instanceof Error ? err.message : "Something went quiet. Try again.",
      });
    }
  },

  generateArtifact: async () => {
    const { userId, sessionId, artifactStatus } = get();
    if (!userId || !sessionId || artifactStatus === "generating" || artifactStatus === "done") {
      return;
    }
    set({ artifactStatus: "generating", artifactError: null });
    try {
      const result = await holo.artifacts.create({ userId, sessionId, productKey: PRODUCT_KEY });
      set({
        artifactStatus: "done",
        snapshot: result.contentJson,
        returnView: result.returnView ?? null,
        hurl: result.hurl,
      });
    } catch (err) {
      set({
        artifactStatus: "error",
        artifactError: err instanceof Error ? err.message : "Could not compose the Snapshot.",
      });
    }
  },

  setDraft: (value) => set({ draft: value }),

  submitTurn: async (input) => {
    const { userId, sessionId, currentChamber, thinking } = get();
    if (!userId || !sessionId || thinking) return;

    const agentKey = agentKeyFor(currentChamber);
    set({ thinking: true, turnError: null });
    try {
      const eventType = currentChamber === "identity-seed" ? "choice.selected" : "intake.captured";
      const payload = input.formData ?? (input.message ? { message: input.message } : {});

      // 1. record the interaction as an event
      await holo.events.write({
        userId,
        sessionId,
        productKey: PRODUCT_KEY,
        chamberKey: currentChamber,
        eventType,
        payload,
      });

      // 2. run the agent (mock by default) — returns a structured reflection
      const output = await holo.agents.run({
        userId,
        sessionId,
        productKey: PRODUCT_KEY,
        chamberKey: currentChamber,
        agentKey,
        input: { message: input.message, formData: input.formData },
      });

      // 3. orchestration persists memoryWrites + statePatch, advances, re-mints HURL
      const result = await holo.orchestration.next({
        userId,
        sessionId,
        productKey: PRODUCT_KEY,
        agentOutput: output,
      });

      set({
        thinking: false,
        reflection: output.message,
        turnComplete: true,
        sessionState: result.state,
        pendingNext: result.nextChamber,
        hurl: result.hurl ?? get().hurl,
      });
    } catch (err) {
      set({
        thinking: false,
        turnError: err instanceof Error ? err.message : "Something went quiet. Try again.",
      });
    }
  },

  chooseArrivalVector: async (index) => {
    if (get().turnComplete || get().thinking) return;
    const vector = ARRIVAL_VECTORS[index] ?? "unknown";
    set({ arrivalVector: vector });
    await get().submitTurn({ formData: { arrivalVector: vector } });
  },

  advance: () => {
    const { pendingNext, currentChamber, visited } = get();
    const next = pendingNext ?? getNextChamber(MANIFEST, currentChamber);
    if (!next) return; // terminal
    set({
      currentChamber: next,
      visited: visited.includes(next) ? visited : [...visited, next],
      reflection: null,
      turnComplete: false,
      pendingNext: null,
      turnError: null,
      draft: "",
      arrivalVector: null,
    });
  },
}));
