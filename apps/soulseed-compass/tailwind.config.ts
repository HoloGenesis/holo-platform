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
      },
      boxShadow: {
        glass: "0 1px 0 rgba(255,255,255,0.04) inset, 0 20px 60px -30px rgba(0,0,0,0.85)",
        gold: "0 0 28px -8px rgba(232,193,106,0.5)",
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
