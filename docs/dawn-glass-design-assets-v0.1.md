# SOULSEED COMPASS — Dawn Glass Design Asset Code v0.1

*Authored by Brooks Cole · Delivered 9 June 2026 · Saved to repo by Hiren.*

> **Sits beneath:** `docs/doctrine-the-cohering-is-the-product.md` (Doctrine v0.1). This is the build-ready design layer for the SoulSeed Compass HOLOSCROLLY.

This document is build-ready design asset code for the current SoulSeed Compass HOLOSCROLLY direction: one screen at a time, cinematic background, Dawn Glass panels, golden-hour warmth, iridescent CTA, whorl progress, and privacy/control cues. It is meant to give the engineer immediate implementation material, not another concept description.

**Engineer directive (canonical):** Implement this as **sequential HOLOSCROLLY states, not a dashboard**. One screen at a time. Do not show all modules at once. Do not collapse Snapshot, HURL, return, proof, and next steps into one dashboard. Use Dawn Glass cards over cinematic full-frame visuals.

**Layer order:** *Reality first. Glass second. Geometry third.*

---

## 1. Design Tokens

```ts
// packages/ui/src/tokens/soulseed.tokens.ts
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
```

---

## 2. Global CSS

```css
/* apps/soulseed-compass/src/styles/soulseed.css */
:root {
  --ss-ink: #071014;
  --ss-ink-soft: #111820;
  --ss-dawn-white: #fff8ef;
  --ss-warm-ivory: #f8eedc;
  --ss-honey: #e8a84c;
  --ss-honey-deep: #c97924;
  --ss-amber: #ffb65c;
  --ss-rose-gold: #e8b7a1;
  --ss-coral: #ee8f73;
  --ss-glass-blue: #9fd8ff;
  --ss-glass-violet: #a98dff;
  --ss-glass-cyan: #7be7f2;
  --ss-muted: rgba(255, 248, 239, 0.72);
  --ss-faint: rgba(255, 248, 239, 0.48);
  --ss-glass-light: rgba(255, 248, 239, 0.12);
  --ss-glass-mid: rgba(255, 248, 239, 0.18);
  --ss-glass-dark: rgba(7, 16, 20, 0.56);
  --ss-radius-lg: 32px;
  --ss-radius-xl: 44px;
  --ss-display: "Libre Baskerville", "Cormorant Garamond", Georgia, serif;
  --ss-ui: "Montserrat", "Inter", system-ui, sans-serif;
  --ss-mono: "JetBrains Mono", ui-monospace, SFMono-Regular, monospace;
  --ss-ease: cubic-bezier(0.22, 1, 0.36, 1);
}

html, body {
  margin: 0;
  min-height: 100%;
  background: var(--ss-ink);
  color: var(--ss-dawn-white);
  font-family: var(--ss-ui);
}
* { box-sizing: border-box; }

.soulseed-page {
  position: relative;
  min-height: 100svh;
  overflow: hidden;
  isolation: isolate;
  background:
    radial-gradient(circle at 70% 20%, rgba(232, 168, 76, 0.2), transparent 32%),
    linear-gradient(180deg, rgba(7, 16, 20, 0.12), rgba(7, 16, 20, 0.82));
}

.soulseed-bg {
  position: absolute;
  inset: 0;
  z-index: -3;
  overflow: hidden;
}

.soulseed-bg img,
.soulseed-bg video {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: saturate(1.08) contrast(1.04);
  transform: scale(1.02);
}

.soulseed-bg::after {
  content: "";
  position: absolute;
  inset: 0;
  z-index: 1;
  background:
    linear-gradient(90deg, rgba(7, 16, 20, 0.72), rgba(7, 16, 20, 0.18) 52%, rgba(7, 16, 20, 0.42)),
    linear-gradient(180deg, rgba(7, 16, 20, 0.08), rgba(7, 16, 20, 0.78));
}

.dawn-glass {
  position: relative;
  border: 1px solid rgba(255, 248, 239, 0.22);
  background:
    linear-gradient(135deg, rgba(255, 248, 239, 0.16), rgba(255, 248, 239, 0.06)),
    linear-gradient(180deg, rgba(7, 16, 20, 0.12), rgba(7, 16, 20, 0.42));
  backdrop-filter: blur(28px) saturate(1.25);
  -webkit-backdrop-filter: blur(28px) saturate(1.25);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.24),
    inset 0 -1px 0 rgba(232, 168, 76, 0.16),
    0 24px 80px rgba(0, 0, 0, 0.36);
}

.dawn-glass::before {
  content: "";
  pointer-events: none;
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  opacity: 0.72;
  background:
    linear-gradient(135deg, rgba(232, 168, 76, 0.52), transparent 28%),
    linear-gradient(315deg, rgba(123, 231, 242, 0.38), transparent 30%),
    linear-gradient(45deg, rgba(169, 141, 255, 0.24), transparent 32%);
  mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
  -webkit-mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
  padding: 1px;
  -webkit-mask-composite: xor;
  mask-composite: exclude;
}

.iridescent-button {
  border: 1px solid rgba(255, 248, 239, 0.32);
  border-radius: 999px;
  color: var(--ss-dawn-white);
  background:
    radial-gradient(circle at 22% 50%, rgba(255, 195, 102, 0.92), transparent 42%),
    radial-gradient(circle at 82% 52%, rgba(123, 216, 255, 0.78), transparent 38%),
    linear-gradient(90deg, rgba(201, 121, 36, 0.92), rgba(169, 141, 255, 0.66), rgba(77, 183, 224, 0.78));
  box-shadow:
    0 0 36px rgba(232, 168, 76, 0.35),
    inset 0 1px 0 rgba(255, 255, 255, 0.42);
  transition: transform 240ms var(--ss-ease), box-shadow 240ms var(--ss-ease);
}

.iridescent-button:hover {
  transform: translateY(-1px);
  box-shadow:
    0 0 52px rgba(232, 168, 76, 0.46),
    0 0 42px rgba(123, 216, 255, 0.22),
    inset 0 1px 0 rgba(255, 255, 255, 0.52);
}

.ghost-button {
  border: 1px solid rgba(255, 248, 239, 0.24);
  border-radius: 999px;
  color: var(--ss-dawn-white);
  background: rgba(255, 248, 239, 0.08);
  backdrop-filter: blur(18px);
  -webkit-backdrop-filter: blur(18px);
}

.ss-display { font-family: var(--ss-display); font-weight: 400; letter-spacing: -0.045em; }
.ss-ui { font-family: var(--ss-ui); }
.ss-mono { font-family: var(--ss-mono); }

.whorl {
  --whorl-size: 240px;
  position: relative;
  width: var(--whorl-size);
  height: var(--whorl-size);
  border-radius: 50%;
  opacity: 0.9;
  background:
    repeating-radial-gradient(
      circle at 50% 50%,
      rgba(232, 168, 76, 0.02) 0,
      rgba(232, 168, 76, 0.02) 9px,
      rgba(232, 168, 76, 0.26) 10px,
      rgba(232, 168, 76, 0.02) 11px
    );
  filter: drop-shadow(0 0 32px rgba(232, 168, 76, 0.38));
  animation: whorlBreathe 5.5s var(--ss-ease) infinite alternate;
}

.whorl::after {
  content: "";
  position: absolute;
  inset: 16%;
  border-radius: 50%;
  background:
    conic-gradient(
      from 90deg,
      transparent,
      rgba(232, 168, 76, 0.88),
      rgba(255, 248, 239, 0.2),
      transparent,
      rgba(123, 216, 255, 0.36),
      transparent
    );
  filter: blur(1px);
  animation: whorlTurn 16s linear infinite;
}

@keyframes whorlBreathe {
  from { transform: scale(0.96); opacity: 0.72; }
  to   { transform: scale(1.04); opacity: 1; }
}
@keyframes whorlTurn { to { transform: rotate(360deg); } }

.screen-enter { animation: screenEnter 700ms var(--ss-ease) both; }
@keyframes screenEnter {
  from { opacity: 0; transform: translateY(18px) scale(0.985); filter: blur(8px); }
  to   { opacity: 1; transform: translateY(0) scale(1); filter: blur(0); }
}
```

---

## 3. Tailwind Extension

```ts
// tailwind.config.ts
import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./apps/**/*.{ts,tsx}", "./packages/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
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
      boxShadow: {
        "ss-glow": "0 0 42px rgba(232,168,76,0.35)",
        "ss-glass": "0 24px 80px rgba(0,0,0,0.36)",
      },
      backdropBlur: { glass: "28px" },
    },
  },
  plugins: [],
};

export default config;
```

---

## 4. Base React Components

```tsx
// apps/soulseed-compass/src/components/DawnGlass.tsx
import * as React from "react";
import clsx from "clsx";

export function DawnGlass({ children, className }: {
  children: React.ReactNode; className?: string;
}) {
  return <div className={clsx("dawn-glass rounded-[32px]", className)}>{children}</div>;
}

export function IridescentButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "iridescent-button inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium",
        "focus:outline-none focus:ring-2 focus:ring-soulseed-honey/60 focus:ring-offset-2 focus:ring-offset-soulseed-ink",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function GhostButton({ children, className, ...props }: React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button
      className={clsx(
        "ghost-button inline-flex items-center justify-center gap-3 px-8 py-4 text-base font-medium",
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}

export function Whorl({ className }: { className?: string }) {
  return <div className={clsx("whorl", className)} aria-hidden="true" />;
}
```

---

## 5. One-Screen HOLOSCROLLY Shell

```tsx
// apps/soulseed-compass/src/components/SoulSeedScreenShell.tsx
import * as React from "react";
import clsx from "clsx";

type SoulSeedScreenShellProps = {
  step: number;
  total?: number;
  backgroundSrc: string;
  children: React.ReactNode;
  className?: string;
};

export function SoulSeedScreenShell({
  step, total = 9, backgroundSrc, children, className,
}: SoulSeedScreenShellProps) {
  return (
    <main className={clsx("soulseed-page min-h-svh screen-enter", className)}>
      <div className="soulseed-bg">
        <img src={backgroundSrc} alt="" />
      </div>
      <header className="fixed left-0 right-0 top-0 z-30 flex items-center justify-between px-8 py-6">
        <div className="flex items-center gap-3 text-soulseed-dawn">
          <span className="grid h-9 w-9 place-items-center rounded-full border border-soulseed-honey/60 text-soulseed-honey">◎</span>
          <span className="font-ssUi text-xl">SoulSeed Compass</span>
        </div>
        <div className="hidden items-center gap-2 md:flex">
          {Array.from({ length: total }).map((_, index) => (
            <span key={index}
              className={clsx(
                "h-2.5 w-2.5 rounded-full transition-all",
                index + 1 <= step ? "bg-soulseed-honey shadow-ss-glow" : "bg-white/20"
              )}
            />
          ))}
        </div>
        <button className="ghost-button px-5 py-3">← Back</button>
      </header>
      <section className="relative z-10 flex min-h-svh items-end px-6 pb-8 pt-28 md:px-12">
        <div className="mx-auto w-full max-w-6xl">{children}</div>
      </section>
    </main>
  );
}
```

---

## 6. Screen 1 — Recognition (Video / Hero only)

```tsx
// apps/soulseed-compass/src/screens/Screen01Recognition.tsx
import { IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen01Recognition() {
  return (
    <SoulSeedScreenShell step={1} backgroundSrc="/images/soulseed/seed-offering-hero.jpg">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="ss-display text-5xl leading-[1.05] text-soulseed-dawn md:text-7xl">
          Something in you<br />is ready to be recognized.
        </h1>
        <div className="mx-auto my-8 h-20 w-px bg-gradient-to-b from-soulseed-honey to-transparent" />
        <IridescentButton>Begin My SoulSeed <span>→</span></IridescentButton>
        <p className="mt-8 text-sm text-soulseed-dawn/60">Scroll to begin</p>
      </div>
    </SoulSeedScreenShell>
  );
}
```

---

## 7. Screen 2 — The Offer

```tsx
// apps/soulseed-compass/src/screens/Screen02Offer.tsx
import { DawnGlass, GhostButton, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

const outcomes = [
  ["Identity Pattern", "Your core blueprint", "◎"],
  ["Octopus Map", "How you think & relate", "✣"],
  ["ANG3L Profile", "How AI meets you", "✦"],
  ["Return Link", "Your link back home", "↗"],
];

export function Screen02Offer() {
  return (
    <SoulSeedScreenShell step={2} backgroundSrc="/images/soulseed/seed-offering-hero.jpg">
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 md:grid-cols-[0.95fr_1.05fr] md:items-end">
          <div>
            <p className="mb-6 text-soulseed-honey">2 / 9</p>
            <h1 className="ss-display text-5xl leading-[1.02] md:text-7xl">Create your<br />SoulSeed.</h1>
            <p className="mt-8 max-w-xl text-2xl leading-relaxed text-soulseed-dawn/90">
              The living profile that teaches AI how to meet you.
            </p>
            <p className="mt-8 max-w-md leading-8 text-soulseed-dawn/72">
              In a few minutes, you'll create a profile of your identity, intelligence, and support style —
              so future ANG3Ls understand you faster, guide you better, and remember what matters.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <IridescentButton>Begin My SoulSeed →</IridescentButton>
              <GhostButton>See what you'll receive</GhostButton>
            </div>
          </div>
          <div>
            <p className="mb-4 text-lg text-soulseed-dawn/90">You'll receive:</p>
            <div className="grid gap-4 sm:grid-cols-2">
              {outcomes.map(([title, subtitle, icon]) => (
                <DawnGlass key={title} className="p-6">
                  <div className="mb-5 grid h-12 w-12 place-items-center rounded-full border border-soulseed-honey/40 text-2xl text-soulseed-honey shadow-ss-glow">
                    {icon}
                  </div>
                  <h3 className="text-lg font-semibold text-soulseed-dawn">{title}</h3>
                  <p className="mt-1 text-sm text-soulseed-dawn/62">{subtitle}</p>
                </DawnGlass>
              ))}
            </div>
            <p className="mt-8 text-center text-soulseed-honey">
              🔒 One living page. No funnel. Return anytime.
            </p>
          </div>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 8. Screen 3 — First Question

```tsx
// apps/soulseed-compass/src/screens/Screen03Question.tsx
import { DawnGlass, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen03Question() {
  return (
    <SoulSeedScreenShell step={3} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <div className="grid gap-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-end">
        <div className="pb-8">
          <p className="mb-6 text-soulseed-honey">3 / 9</p>
          <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">
            Let's begin with<br />what matters.
          </h1>
          <p className="mt-8 max-w-md text-2xl leading-relaxed text-soulseed-dawn/86">
            Your answers shape how your SoulSeed understands and supports you — right now.
          </p>
        </div>
        <DawnGlass className="p-8 md:p-10">
          <div className="mb-6 flex items-start gap-5">
            <div className="grid h-16 w-16 shrink-0 place-items-center rounded-full border border-soulseed-honey/50 text-2xl text-soulseed-honey shadow-ss-glow">✧</div>
            <div>
              <h2 className="ss-display text-3xl leading-tight">
                What would make this useful for you today?
              </h2>
              <p className="mt-3 text-soulseed-dawn/72">
                Your honest answer helps your SoulSeed meet you in the right way.
              </p>
            </div>
          </div>
          <textarea
            className="min-h-40 w-full resize-none rounded-[24px] border border-white/20 bg-black/20 p-6 text-lg text-soulseed-dawn outline-none placeholder:text-soulseed-dawn/42 focus:border-soulseed-honey/60"
            placeholder="Share anything that's on your mind..."
            maxLength={600}
          />
          <div className="mt-6 flex items-center justify-between">
            <p className="text-sm text-soulseed-dawn/52">Private by design. You're in control.</p>
            <IridescentButton className="px-7 py-3">Continue →</IridescentButton>
          </div>
        </DawnGlass>
      </div>
    </SoulSeedScreenShell>
  );
}
```

---

## 9. Screen 4 — Listening / Pattern Forming

```tsx
// apps/soulseed-compass/src/screens/Screen04Listening.tsx
import { DawnGlass, Whorl } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen04Listening() {
  return (
    <SoulSeedScreenShell step={4} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[1fr_0.9fr] lg:items-center">
          <div>
            <p className="mb-6 text-soulseed-honey">4 / 9</p>
            <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">
              Listening for how<br />you want to be met…
            </h1>
            <p className="mt-8 max-w-xl text-xl leading-9 text-soulseed-dawn/78">
              Every word, every nuance, every intention helps your SoulSeed form a clearer picture of who you are and what you need.
            </p>
            <DawnGlass className="mt-10 max-w-md p-6">
              <div className="flex items-center gap-4">
                <div className="grid h-14 w-14 place-items-center rounded-full border border-soulseed-honey/50 text-soulseed-honey">◎</div>
                <div>
                  <h3 className="text-lg text-soulseed-honey">A pattern is forming.</h3>
                  <p className="mt-1 text-sm leading-6 text-soulseed-dawn/68">
                    We're connecting your insights, experiences, and intent into something meaningful.
                  </p>
                </div>
              </div>
            </DawnGlass>
          </div>
          <div className="flex justify-center">
            <Whorl className="[--whorl-size:360px]" />
          </div>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 10. Screen 5 — Recognition / Confirmation

```tsx
// apps/soulseed-compass/src/screens/Screen05Recognition.tsx
import { DawnGlass, GhostButton, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen05Recognition() {
  return (
    <SoulSeedScreenShell step={5} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">5 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          You seem to need <span className="text-soulseed-honey">clarity before depth.</span>
        </h1>
        <p className="mt-8 max-w-2xl text-2xl leading-relaxed text-soulseed-dawn/86">
          You want the experience to prove why it matters before it becomes symbolic.
        </p>
        <DawnGlass className="mt-10 p-8">
          <h2 className="mb-4 text-2xl text-soulseed-honey">Why this matters</h2>
          <p className="max-w-3xl text-lg leading-8 text-soulseed-dawn/78">
            Starting with clarity helps you build trust in the process and keep your momentum.
            You value honesty, practical steps, and real-world relevance.
          </p>
          <div className="mt-10 text-center">
            <h3 className="text-2xl text-soulseed-honey">Does this feel right to you?</h3>
            <p className="mt-2 text-soulseed-dawn/62">Your feedback helps your SoulSeed get it right.</p>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              <IridescentButton>✓ Yes, that's me</IridescentButton>
              <GhostButton>✎ Not quite</GhostButton>
              <GhostButton>I'm not sure yet</GhostButton>
            </div>
          </div>
        </DawnGlass>
        <p className="mt-8 text-center text-soulseed-honey">
          🔒 Private by design. You're in control of what's shared and remembered.
        </p>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 11. Screen 6 — Proof Moment (Generic AI vs SoulSeed-attuned ANG3L)

```tsx
// apps/soulseed-compass/src/screens/Screen06Proof.tsx
import { DawnGlass, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen06Proof() {
  return (
    <SoulSeedScreenShell step={6} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">6 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Here's why SoulSeed matters.
        </h1>
        <p className="mt-8 max-w-2xl text-xl leading-8 text-soulseed-dawn/78">
          Generic AI can respond. An ANG3L attuned to your SoulSeed understands, remembers, and meets you where you are.
        </p>
        <div className="mt-12 grid gap-6 lg:grid-cols-2">
          <DawnGlass className="p-8 opacity-75">
            <h2 className="text-2xl">Generic AI</h2>
            <p className="mt-1 text-soulseed-dawn/52">Same prompt. Generic response.</p>
            <ul className="mt-8 space-y-5 text-soulseed-dawn/72">
              <li>Surface-level advice</li>
              <li>Forgetting is the norm</li>
              <li>One-size-fits-all tone</li>
              <li>Generic next steps</li>
            </ul>
            <blockquote className="mt-8 rounded-[24px] bg-white/8 p-5 italic text-soulseed-dawn/62">
              "Here are some tips that might help you…"
            </blockquote>
          </DawnGlass>
          <DawnGlass className="border-soulseed-honey/60 p-8 shadow-ss-glow">
            <h2 className="text-2xl text-soulseed-honey">SoulSeed-attuned ANG3L</h2>
            <p className="mt-1 text-soulseed-dawn/62">Your SoulSeed. Your context. Your becoming.</p>
            <ul className="mt-8 space-y-5 text-soulseed-dawn/86">
              <li>
                <strong className="text-soulseed-honey">Deep, relevant understanding</strong><br />
                Speaks to what's true for you, now.
              </li>
              <li>
                <strong className="text-soulseed-honey">Remembers what matters</strong><br />
                Builds continuity across every return.
              </li>
              <li>
                <strong className="text-soulseed-honey">Adaptive tone and approach</strong><br />
                Matches your energy and needs.
              </li>
            </ul>
            <blockquote className="mt-8 rounded-[24px] border border-soulseed-honey/30 bg-soulseed-honey/10 p-5 italic text-soulseed-honey">
              "Because you value clarity before depth, here's what I'd suggest next…"
            </blockquote>
          </DawnGlass>
        </div>
        <div className="mt-10 text-center">
          <IridescentButton>Show my Snapshot →</IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 12. Screen 7 — Snapshot

```tsx
// apps/soulseed-compass/src/screens/Screen07Snapshot.tsx
import { DawnGlass, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

const rows = [
  ["Identity Pattern", "Independent, systems-aware, and meaning-driven.",
    "You connect dots others miss and turn ideas into impact.", "◎"],
  ["Current Need", "Clarity before depth.",
    "You need alignment, not more complexity.", "♡"],
  ["Support Style", "Direct, thoughtful, and concise.",
    "Challenge assumptions gently. Give frameworks and next steps.", "◉"],
  ["What AI Should Avoid", "Overly generic advice. Fluff. False positivity.",
    "No long-winded explanations without clear application.", "×"],
  ["Next Coherent Step", "Choose one priority and define what enough looks like.",
    "Then map the smallest meaningful step forward.", "✦"],
];

export function Screen07Snapshot() {
  return (
    <SoulSeedScreenShell step={7} backgroundSrc="/images/soulseed/seed-offering-close.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">7 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Your SoulSeed Snapshot
        </h1>
        <p className="mt-6 text-xl text-soulseed-dawn/74">
          A living summary of you, right now. You can refine this anytime.
        </p>
        <div className="mt-10 overflow-hidden rounded-[32px] border border-white/16 bg-black/20">
          {rows.map(([label, value, detail, icon], index) => (
            <div key={label} className="grid gap-5 border-b border-white/10 p-6 last:border-b-0 md:grid-cols-[220px_1fr]">
              <div className="flex items-start gap-4">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-full border border-soulseed-honey/40 text-xl text-soulseed-honey">{icon}</div>
                <div>
                  <h3 className="text-lg text-soulseed-honey">{label}</h3>
                  <p className="text-sm text-soulseed-dawn/48">
                    {index === 0 ? "How you naturally show up" : ""}
                  </p>
                </div>
              </div>
              <div>
                <p className="text-2xl text-soulseed-dawn">{value}</p>
                <p className="mt-2 text-lg leading-8 text-soulseed-dawn/70">{detail}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="mt-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <p className="text-soulseed-honey">This snapshot will evolve as you do.</p>
          <IridescentButton>Reveal My HURL →</IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 13. Screen 8 — HURL / Return Link

```tsx
// apps/soulseed-compass/src/screens/Screen08Hurl.tsx
import { DawnGlass, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen08Hurl() {
  return (
    <SoulSeedScreenShell step={8} backgroundSrc="/images/soulseed/seed-alone-glow.jpg">
      <DawnGlass className="p-8 md:p-12">
        <p className="mb-6 text-soulseed-honey">8 / 9</p>
        <h1 className="ss-display max-w-4xl text-5xl leading-[1.04] md:text-7xl">
          Your Return Link is ready.
        </h1>
        <p className="mt-6 max-w-2xl text-xl leading-8 text-soulseed-dawn/74">
          This is your living link. It brings your ANG3L back to you and lets your SoulSeed remember where we left off.
        </p>
        <DawnGlass className="mt-10 p-8">
          <p className="mb-3 text-soulseed-honey">Your Return Link / HURL</p>
          <div className="flex flex-col gap-4 rounded-[28px] border border-white/18 bg-black/24 p-4 md:flex-row md:items-center md:justify-between">
            <code className="ss-mono text-lg text-soulseed-dawn/86">soulseed.com/hurl/amber-7xk9</code>
            <button className="ghost-button px-5 py-3">Copy</button>
          </div>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            <p className="text-soulseed-dawn/68">🔒 Encrypted</p>
            <p className="text-soulseed-dawn/68">Private</p>
            <p className="text-soulseed-dawn/68">Yours alone</p>
          </div>
        </DawnGlass>
        <div className="mt-10 text-center">
          <IridescentButton>Open My HURL →</IridescentButton>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 14. Screen 9 — Completion / Return Promise

```tsx
// apps/soulseed-compass/src/screens/Screen09Completion.tsx
import { DawnGlass, IridescentButton } from "../components/DawnGlass";
import { SoulSeedScreenShell } from "../components/SoulSeedScreenShell";

export function Screen09Completion() {
  return (
    <SoulSeedScreenShell step={9} backgroundSrc="/images/soulseed/seed-sprout-return.jpg">
      <DawnGlass className="p-8 md:p-12">
        <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
          <div>
            <p className="mb-6 text-soulseed-honey">9 / 9</p>
            <h1 className="ss-display text-5xl leading-[1.04] md:text-7xl">You're all set.</h1>
            <h2 className="mt-6 text-3xl text-soulseed-honey">Your SoulSeed is active.</h2>
            <p className="mt-8 max-w-xl text-xl leading-9 text-soulseed-dawn/76">
              Every time you return, your ANG3L will meet you here — with more context, more care, and more continuity.
            </p>
            <p className="mt-8 inline-flex rounded-full border border-soulseed-honey/30 bg-soulseed-honey/10 px-5 py-3 text-soulseed-honey">
              🔒 Private by design. You're in control.
            </p>
          </div>
          <DawnGlass className="p-8">
            <h3 className="text-2xl text-soulseed-honey">What happens next</h3>
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              <div>
                <h4 className="text-lg text-soulseed-dawn">Personalized first meeting</h4>
                <p className="mt-2 text-soulseed-dawn/64">Your ANG3L prepares a conversation just for you.</p>
              </div>
              <div>
                <h4 className="text-lg text-soulseed-dawn">Adaptive over time</h4>
                <p className="mt-2 text-soulseed-dawn/64">As you return, your SoulSeed remembers more and attunes better.</p>
              </div>
              <div>
                <h4 className="text-lg text-soulseed-dawn">Guided becoming</h4>
                <p className="mt-2 text-soulseed-dawn/64">You'll receive the right support for your next coherent step.</p>
              </div>
              <div>
                <h4 className="text-lg text-soulseed-dawn">You stay in control</h4>
                <p className="mt-2 text-soulseed-dawn/64">You choose what is saved, shared, or forgotten.</p>
              </div>
            </div>
            <div className="mt-10">
              <IridescentButton className="w-full">Enter My SoulSeed →</IridescentButton>
            </div>
          </DawnGlass>
        </div>
      </DawnGlass>
    </SoulSeedScreenShell>
  );
}
```

---

## 15. Copy Constants

```ts
// apps/soulseed-compass/src/content/soulseed.copy.ts
export const SOULSEED_CANON_COPY = {
  primaryHeadline: "Create your SoulSeed.",
  primarySubhead: "The living profile that teaches AI how to meet you.",
  recognitionLine: "Something in you is ready to be recognized.",
  firstQuestion: "What would make this useful for you today?",
  privacyLine: "Private by design. You're in control of what's shared and remembered.",
  noFunnelLine: "One living page. No funnel. Return anytime.",
  proofHeadline: "Here's why SoulSeed matters.",
  snapshotHeadline: "Your SoulSeed Snapshot",
  hurlPlainName: "Your Return Link",
  hurlTechnicalName: "HURL",
  completionHeadline: "You're all set.",
  completionSubhead: "Your SoulSeed is active.",
  doctrine: {
    realityFirst: "Reality first. Glass second. Geometry third.",
    oneLayer: "One screen. One moment. One action. One revelation.",
    sequence: "Seed → Signal → Glass → Whorl → Snapshot → HURL → Return → Tree",
    product: "The cohering is the product.",
  },
};
```

---

## 16. Engineer Directive (canonical)

Implement this as **sequential HOLOSCROLLY states, not a dashboard**.

**One screen at a time:**

1. Recognition
2. Offer
3. Question
4. Listening
5. Recognition / Confirmation
6. Proof
7. Snapshot
8. HURL
9. Completion / Return Promise

**Do not** show all modules at once.
**Do not** collapse Snapshot, HURL, return, proof, and next steps into one dashboard.

Use **Dawn Glass cards over cinematic full-frame visuals**.

**Layer order:** Reality first. Glass second. Geometry third.

---

## Riff

> The cohering is the product. One screen. One moment. One action. One revelation. Seed → Signal → Glass → Whorl → Snapshot → HURL → Return → Tree.

— Brooks Cole, 9 June 2026
