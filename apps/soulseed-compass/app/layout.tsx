import type { Metadata } from "next";
import type { ReactNode } from "react";
import { Libre_Baskerville, Montserrat, JetBrains_Mono } from "next/font/google";
// Dawn Glass foundation (S79). soulseed.css is imported BEFORE globals.css so the
// existing void/gold shell stays unchanged (globals' preflight wins element-level
// ties); the new design system lands additively and starts rendering at S80+.
import "./soulseed.css";
import "./globals.css";

// Dawn Glass typefaces — exposed as CSS variables consumed by soulseed.css
// (--ss-display / --ss-ui / --ss-mono). Nothing renders them until S80.
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

export const metadata: Metadata = {
  title: "SoulSeed Compass",
  description:
    "Your first living HOLOSCROLLY — a document that remembers you, evolves with you, and orients your becoming.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      className={`${libreBaskerville.variable} ${montserrat.variable} ${jetBrainsMono.variable}`}
    >
      {/* font-sans pins the existing shell's font (same as current default) so the
          Dawn Glass global font rule can't restyle it before the S82+ swap. */}
      <body className="font-sans min-h-screen bg-void text-neutral-100 antialiased selection:bg-gold/20">
        {children}
      </body>
    </html>
  );
}
