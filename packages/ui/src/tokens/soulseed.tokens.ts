// packages/ui/src/tokens/soulseed.tokens.ts
// Dawn Glass design tokens — verbatim from docs/dawn-glass-design-assets-v0.1.md §1.
export const soulSeedTokens = {
  color: {
    ink: "#071014",
    inkSoft: "#111820",
    dawnWhite: "#FFF8EF",
    warmIvory: "#F8EEDC",
    honey: "#E8A84C",
    honeyDeep: "#C97924",
    amber: "#FFB65C",
    roseGold: "#E8B7A1",
    coral: "#EE8F73",
    glassBlue: "#9FD8FF",
    glassViolet: "#A98DFF",
    glassCyan: "#7BE7F2",
    goldText: "#F5C878",
    mutedText: "rgba(255, 248, 239, 0.72)",
    faintText: "rgba(255, 248, 239, 0.48)",
    glassLight: "rgba(255, 248, 239, 0.12)",
    glassMid: "rgba(255, 248, 239, 0.18)",
    glassDark: "rgba(7, 16, 20, 0.56)",
    success: "#AEE58C",
    warning: "#F5C878",
    danger: "#FF9B7A",
  },
  radius: {
    sm: "12px",
    md: "20px",
    lg: "32px",
    xl: "44px",
    pill: "999px",
  },
  blur: {
    glass: "28px",
    heavy: "48px",
  },
  shadow: {
    glowGold: "0 0 42px rgba(232, 168, 76, 0.35)",
    glowBlue: "0 0 42px rgba(123, 231, 242, 0.26)",
    glass: "0 24px 80px rgba(0, 0, 0, 0.36)",
  },
  typography: {
    display: `"Libre Baskerville", "Cormorant Garamond", Georgia, serif`,
    ui: `"Montserrat", "Inter", system-ui, sans-serif`,
    mono: `"JetBrains Mono", ui-monospace, SFMono-Regular, monospace`,
  },
  motion: {
    ease: "cubic-bezier(0.22, 1, 0.36, 1)",
    slow: "900ms",
    medium: "520ms",
    fast: "240ms",
  },
} as const;
