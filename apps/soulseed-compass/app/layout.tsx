import type { Metadata } from "next";
import type { ReactNode } from "react";
import {
  Cinzel,
  Geist_Mono,
  JetBrains_Mono,
  Libre_Baskerville,
  Montserrat,
  Playfair_Display,
} from "next/font/google";
// Dawn Glass foundation (S79). soulseed.css is imported BEFORE globals.css so the
// existing void/gold shell stays unchanged (globals' preflight wins element-level
// ties); the new design system lands additively and starts rendering at S80+.
import "./soulseed.css";
import "./globals.css";

// Dawn Glass v0.1 typefaces — exposed as CSS variables consumed by soulseed.css
// (--ss-display / --ss-ui / --ss-mono). UNCHANGED; live on the current shell.
const libreBaskerville = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-ss-display",
});
const montserrat = Montserrat({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ss-ui",
});
const jetBrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-ss-mono",
});

// Dawn Glass v0.2 typefaces (S90) — bound to --next-font-*, consumed by the
// v0.2 --font-epic/--font-h/--font-body/--font-accent/--font-mono stacks in
// soulseed.css. Inert until S93+ components read them. Cinzel is the CIZNEL
// fallback (Q-W ruling: token name carries the canon, Cinzel the implementation).
const cinzel = Cinzel({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--next-font-cinzel",
});
const libreV2 = Libre_Baskerville({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--next-font-libre",
});
const montserratV2 = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "900"],
  display: "swap",
  variable: "--next-font-montserrat",
});
const playfairDisplay = Playfair_Display({
  subsets: ["latin"],
  weight: ["400", "500"],
  style: ["normal", "italic"],
  display: "swap",
  variable: "--next-font-playfair",
});
const geistMono = Geist_Mono({
  subsets: ["latin"],
  weight: ["400"],
  display: "swap",
  variable: "--next-font-geist-mono",
});

export const metadata: Metadata = {
  title: "SoulSeed Compass",
  description:
    "Your first living HOLOSCROLLY — a document that remembers you, evolves with you, and orients your becoming.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      // v0.2's --next-font-* live on <html> (not <body>): the v0.2 --font-* stacks
      // are declared on :root and custom properties resolve their inner var()s
      // where DECLARED — on body they'd compute to guaranteed-invalid at :root.
      className={`${libreBaskerville.variable} ${montserrat.variable} ${jetBrainsMono.variable} ${cinzel.variable} ${libreV2.variable} ${montserratV2.variable} ${playfairDisplay.variable} ${geistMono.variable}`}
    >
      {/* font-sans pins the existing shell's font (same as current default) so the
          Dawn Glass global font rule can't restyle it before the S82+ swap. */}
      <body className="font-sans min-h-screen bg-void text-neutral-100 antialiased selection:bg-gold/20">
        {children}
      </body>
    </html>
  );
}
