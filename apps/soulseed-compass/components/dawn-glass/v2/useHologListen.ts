import { DEFAULT_HOLOGLISTEN_STATE, type HologListenState } from "./hologListen";

/**
 * Resolve the active HOLOGLISTEN state. S97 wires this to sprint10Store:
 *   proofStatus === "running"      → THINKING
 *   snapshotStatus === "composing" → COHERING
 *   coheringStatus === "running"   → COHERING
 *   otherwise                      → LOCKED
 * For S91, the override prop is the only signal.
 */
export function useHologListen(override?: HologListenState): HologListenState {
  return override ?? DEFAULT_HOLOGLISTEN_STATE;
}
