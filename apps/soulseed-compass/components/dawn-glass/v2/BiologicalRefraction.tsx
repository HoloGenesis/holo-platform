"use client";

import { useEffect, useRef } from "react";
import {
  DEFAULT_HOLOGLISTEN_STATE,
  HOLOGLISTEN_CONFIG,
  type HologListenState,
} from "./hologListen";

interface Props {
  state?: HologListenState;
  /** Override the default filter id (rarely needed — the id is a singleton in practice). */
  id?: string;
}

/**
 * TIER 2 of Brooks's three-tier material physics (S92): an SVG biological
 * refraction filter — the slight wobble of light through living glass.
 * Ported verbatim from docs/dawn-glass-v0.2-material-physics.html
 * (<filter id="biologicalRefraction">). Renders as a zero-size <svg> defs
 * block; consumed via CSS `filter: url(#…)` on wrappers (see OsmoticManifold).
 *
 * The feDisplacementMap's `scale` is updated imperatively on HOLOGLISTEN
 * change — never a React re-render of the SVG tree (re-mounting flickers).
 * prefers-reduced-motion drops the <animate> child: the filter still works
 * (static displacement at the current scale) but doesn't breathe.
 */
export function BiologicalRefraction({
  state = DEFAULT_HOLOGLISTEN_STATE,
  id = "biologicalRefraction",
}: Props) {
  const dispRef = useRef<SVGFEDisplacementMapElement>(null);

  // Imperative scale update (avoids React re-rendering the SVG).
  useEffect(() => {
    const target = dispRef.current;
    if (!target) return;
    const ripple = HOLOGLISTEN_CONFIG[state].svgRipple;
    target.setAttribute("scale", String(ripple));
  }, [state]);

  // Respect prefers-reduced-motion: drop the <animate> child.
  const prefersReduced =
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  return (
    <svg
      aria-hidden="true"
      style={{
        position: "fixed",
        width: 0,
        height: 0,
        pointerEvents: "none",
      }}
    >
      <defs>
        {/* x/y/width/height extension gives the displacement room at the
            edges so refraction near the bounds isn't clipped. */}
        <filter id={id} x="-10%" y="-10%" width="120%" height="120%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.015"
            numOctaves={2}
            seed={5}
            result="noise"
          >
            {!prefersReduced && (
              <animate
                attributeName="baseFrequency"
                values="0.015;0.018;0.015"
                dur="10s"
                repeatCount="indefinite"
              />
            )}
          </feTurbulence>
          <feDisplacementMap
            ref={dispRef}
            in="SourceGraphic"
            in2="noise"
            scale={HOLOGLISTEN_CONFIG[state].svgRipple}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>
      </defs>
    </svg>
  );
}
