import type { CSSProperties, ElementType, JSX, ReactNode } from "react";

type Size = "compact" | "standard" | "hero";
type Glow = "subtle" | "default" | "vivid";

interface Props {
  children: ReactNode;
  size?: Size; // default "standard"
  glow?: Glow; // default "default"
  className?: string;
  style?: CSSProperties;
  as?: keyof JSX.IntrinsicElements; // default "div" — allows "section", "article"
}

const PADDING: Record<Size, string> = {
  compact: "1.5rem 2rem", // tight
  standard: "2.5rem 3rem", // balanced
  hero: "4rem", // reference HTML's pearl card
};

const MAX_WIDTH: Record<Size, string> = {
  compact: "32rem",
  standard: "48rem",
  hero: "72rem", // 1200px-ish per reference
};

// Box-shadow stacks per glow intensity. The reference HTML's .pearl-card
// shadow is the "default"; vivid strengthens the prismatic accents; subtle
// drops them for nested use. "Hierarchy is read through refraction intensity."
const SHADOWS: Record<Glow, string> = {
  subtle: [
    "0 12px 40px rgba(84, 50, 24, 0.06)",
    "inset 0 1px 1px rgba(255, 255, 255, 0.7)",
  ].join(", "),
  default: [
    "0 30px 90px rgba(84, 50, 24, 0.10)",
    "inset 0 1px 2px rgba(255, 255, 255, 0.9)",
    "inset 0 -1px 10px rgba(103, 220, 255, 0.10)",
  ].join(", "),
  vivid: [
    "0 36px 110px rgba(84, 50, 24, 0.14)",
    "inset 0 1px 2px rgba(255, 255, 255, 1)",
    "inset 0 -1px 14px rgba(103, 220, 255, 0.18)",
    "inset 0 1px 18px rgba(255, 190, 96, 0.10)", // warm honey kiss
  ].join(", "),
};

/**
 * TIER 1 of Brooks's three-tier material physics (S93): the pearlescent glass
 * surface — the reference HTML's .pearl-card, byte-for-byte on the default
 * variant. Floats above the MorphogenicMembrane (S91) and refracts through an
 * ancestor OsmoticManifold (S92) — the card itself mounts neither.
 *
 * Visual contract: translucent white (0.10 — the membrane MUST show through),
 * 40px backdrop blur + saturate(180%) + brightness(1.02), iridescent inset
 * edge (cyan + warm tints), warm umber outer shadow, radius 50px, and
 * explicit color: var(--ink) — dark text never disappears on the bright
 * golden-hour membrane.
 */
export function PearlCard({
  children,
  size = "standard",
  glow = "default",
  className,
  style,
  as = "div",
}: Props) {
  const Tag = as as ElementType;

  return (
    <Tag
      className={className}
      style={{
        // Glass surface
        background: "rgba(255, 255, 255, 0.10)",
        backdropFilter: "blur(40px) saturate(180%) brightness(1.02)",
        WebkitBackdropFilter: "blur(40px) saturate(180%) brightness(1.02)",
        // Geometry
        borderRadius: "50px",
        border: "1px solid rgba(255, 255, 255, 0.5)",
        padding: PADDING[size],
        maxWidth: MAX_WIDTH[size],
        // Depth + iridescent edge
        boxShadow: SHADOWS[glow],
        // Layout
        position: "relative",
        overflow: "hidden",
        // Text readability on the golden-hour membrane
        color: "var(--ink)",
        // Pointer events (pearl cards are content surfaces; interactive)
        pointerEvents: "auto",
        ...style,
      }}
    >
      {children}
    </Tag>
  );
}
