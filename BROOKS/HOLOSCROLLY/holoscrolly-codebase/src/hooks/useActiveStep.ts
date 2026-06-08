import { RefObject, useEffect, useState } from "react";

export function useActiveStep<T extends HTMLElement>(
  refs: RefObject<T>[],
  threshold = 0.55
): number {
  const [active, setActive] = useState(0);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

        if (!visible) return;
        const index = refs.findIndex((ref) => ref.current === visible.target);
        if (index >= 0) setActive(index);
      },
      { threshold }
    );

    refs.forEach((ref) => {
      if (ref.current) observer.observe(ref.current);
    });

    return () => observer.disconnect();
  }, [refs, threshold]);

  return active;
}
