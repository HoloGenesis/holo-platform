/**
 * Return Event memory.
 *
 * A HOLOSCROLLY becomes a *living relationship container* the moment it can
 * compare a prior visit to the present arrival. This module keeps a pure,
 * testable reducer at its core; localStorage is only touched at the edges.
 */

export interface ReturnMemory {
  visits: number;
  firstVisitAt: string;
  lastVisitAt: string;
  lastActiveNode: string | null;
  lastReflection: string | null;
  reflections: { at: string; node: string | null; text: string }[];
}

export type MemoryEvent =
  | { type: "ARRIVE"; at: string }
  | { type: "SET_ACTIVE_NODE"; nodeId: string }
  | { type: "REFLECT"; at: string; text: string };

export function emptyMemory(at: string): ReturnMemory {
  return {
    visits: 0,
    firstVisitAt: at,
    lastVisitAt: at,
    lastActiveNode: null,
    lastReflection: null,
    reflections: []
  };
}

/** Pure reducer — no side effects, fully unit-testable. */
export function memoryReducer(state: ReturnMemory, event: MemoryEvent): ReturnMemory {
  switch (event.type) {
    case "ARRIVE":
      return { ...state, visits: state.visits + 1, lastVisitAt: event.at };
    case "SET_ACTIVE_NODE":
      return { ...state, lastActiveNode: event.nodeId };
    case "REFLECT":
      return {
        ...state,
        lastReflection: event.text,
        reflections: [
          ...state.reflections,
          { at: event.at, node: state.lastActiveNode, text: event.text }
        ]
      };
    default:
      return state;
  }
}

/** True when this person has been here before — gates the Return Event prompt. */
export function isReturning(state: ReturnMemory): boolean {
  return state.visits > 1;
}

const KEY = "holoscrolly:return-memory:v1";

function hasStorage(): boolean {
  try {
    return typeof localStorage !== "undefined";
  } catch {
    return false;
  }
}

export function loadMemory(now: string = new Date().toISOString()): ReturnMemory {
  if (!hasStorage()) return emptyMemory(now);
  try {
    const raw = localStorage.getItem(KEY);
    if (!raw) return emptyMemory(now);
    return { ...emptyMemory(now), ...(JSON.parse(raw) as ReturnMemory) };
  } catch {
    return emptyMemory(now);
  }
}

export function saveMemory(state: ReturnMemory): void {
  if (!hasStorage()) return;
  try {
    localStorage.setItem(KEY, JSON.stringify(state));
  } catch {
    /* sovereign refusal: private mode, quota, or disabled storage — fail quiet */
  }
}

export const RETURN_PROMPT = "What changed since the last time you arrived here?";
