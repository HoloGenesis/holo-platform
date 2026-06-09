import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    // Pick up Tailwind classes used by shared UI primitives.
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#08080c",
          soft: "#0e0e16",
        },
        gold: {
          DEFAULT: "#e8c16a",
          soft: "#f3dca0",
          deep: "#b8923f",
        },
        // Dawn Glass palette (spec §3) — additive; the new shell lands at S80+.
        soulseed: {
          ink: "#071014",
          "ink-soft": "#111820",
          dawn: "#FFF8EF",
          ivory: "#F8EEDC",
          honey: "#E8A84C",
          amber: "#FFB65C",
          "rose-gold": "#E8B7A1",
          coral: "#EE8F73",
          cyan: "#7BE7F2",
          violet: "#A98DFF",
        },
      },
      fontFamily: {
        ssDisplay: ['"Libre Baskerville"', '"Cormorant Garamond"', "Georgia", "serif"],
        ssUi: ['"Montserrat"', '"Inter"', "system-ui", "sans-serif"],
        ssMono: ['"JetBrains Mono"', "ui-monospace", "monospace"],
      },
      borderRadius: { glass: "32px", "glass-xl": "44px" },
      backdropBlur: { glass: "28px" },
      boxShadow: {
        glass: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.85)",
        gold: "0 0 28px -8px rgba(232,193,106,0.5)",
        "ss-glow": "0 0 42px rgba(232,168,76,0.35)",
        "ss-glass": "0 24px 80px rgba(0,0,0,0.36)",
      },
      keyframes: {
        breathe: {
          "0%, 100%": { transform: "scale(1)", opacity: "0.82" },
          "50%": { transform: "scale(1.07)", opacity: "1" },
        },
        caret: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
      },
      animation: {
        breathe: "breathe 4.2s ease-in-out infinite",
        caret: "caret 1s step-end infinite",
      },
    },
  },
  plugins: [],
};

export default config;
