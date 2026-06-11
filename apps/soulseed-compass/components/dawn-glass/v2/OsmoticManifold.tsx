import type { CSSProperties, ReactNode } from "react";

interface Props {
  children: ReactNode;
  /** Override the filter id (must match BiologicalRefraction's id). */
  filterId?: string;
  className?: string;
  style?: CSSProperties;
}

/**
 * Wraps content with the biological refraction filter (S92). The filter
 * itself is rendered by <BiologicalRefraction />, which must be mounted
 * somewhere in the page tree (typically once at the layout level).
 *
 * Apply this around foreground glass surfaces — NOT around the
 * MorphogenicMembrane (the background should not refract itself), and keep
 * interactive controls outside (precise clicking through wobble feels weird).
 */
export function OsmoticManifold({
  children,
  filterId = "biologicalRefraction",
  className,
  style,
}: Props) {
  return (
    <div
      className={className}
      style={{
        filter: `url(#${filterId})`,
        // Establish a stacking context so children clip cleanly.
        isolation: "isolate",
        // Hint to the browser: the filter changes frequently (HOLOGLISTEN).
        willChange: "filter",
        // The filter doesn't capture pointer events itself; children should.
        pointerEvents: "auto",
        position: "relative",
        ...style,
      }}
    >
      {children}
    </div>
  );
}
