import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";

export const metadata: Metadata = {
  title: "SoulSeed Compass",
  description: "Product One — a thin HOLOSCROLLY front-end on HOLO Core.",
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
