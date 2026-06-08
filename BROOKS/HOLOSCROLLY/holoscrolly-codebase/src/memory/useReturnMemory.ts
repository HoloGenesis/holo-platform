import { useCallback, useEffect, useRef, useState } from "react";
import {
  loadMemory,
  memoryReducer,
  saveMemory,
  type MemoryEvent,
  type ReturnMemory
} from "./returnMemory";

/**
 * React binding for Return Event memory. Records an ARRIVE exactly once per
 * mount, persists every transition to localStorage, and exposes a `dispatch`
 * so chambers can record the active node and the user's return reflection.
 */
export function useReturnMemory(): {
  memory: ReturnMemory;
  dispatch: (event: MemoryEvent) => void;
} {
  const [memory, setMemory] = useState<ReturnMemory>(() => loadMemory());
  const arrived = useRef(false);

  const dispatch = useCallback((event: MemoryEvent) => {
    setMemory((prev) => {
      const next = memoryReducer(prev, event);
      saveMemory(next);
      return next;
    });
  }, []);

  useEffect(() => {
    if (arrived.current) return;
    arrived.current = true;
    dispatch({ type: "ARRIVE", at: new Date().toISOString() });
  }, [dispatch]);

  return { memory, dispatch };
}
