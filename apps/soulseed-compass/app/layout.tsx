import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoulSeed Compass",
  description:
    "Your first living HOLOSCROLLY — a document that remembers you, evolves with you, and orients your becoming.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-void text-neutral-100 antialiased selection:bg-gold/20">
        {children}
      </body>
    </html>
  );
}
