import { useCallback, useEffect, useState } from "react";
import type { Hurl } from "../types/hdom";
import { CANONICAL_ROOT_HURL, hurlToRoute, parseHurlRoute } from "../utils/hurl";

/**
 * Tiny dependency-free router. Reads the current `/h/:realm/:chamber/:stage/:branch`
 * path into a HURL, falls back to the canonical root HURL when no route exists,
 * and exposes a `navigate` that pushes a new HURL into history.
 */
export function useHurlRoute(base: Hurl = CANONICAL_ROOT_HURL): {
  hurl: Hurl;
  navigate: (next: Hurl) => void;
  path: string;
} {
  const read = useCallback((): Hurl => {
    if (typeof window === "undefined") return base;
    return parseHurlRoute(window.location.pathname, base) ?? base;
  }, [base]);

  const [hurl, setHurl] = useState<Hurl>(read);

  useEffect(() => {
    const onPop = () => setHurl(read());
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [read]);

  const navigate = useCallback((next: Hurl) => {
    const path = hurlToRoute(next);
    if (typeof window !== "undefined") {
      window.history.pushState({ hurl: next }, "", path);
    }
    setHurl(next);
  }, []);

  return { hurl, navigate, path: hurlToRoute(hurl) };
}
