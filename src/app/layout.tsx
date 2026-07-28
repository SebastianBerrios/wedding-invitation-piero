import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Great_Vibes } from "next/font/google";
import "./globals.css";
import { StickyMusicToggle } from "@/components/interactive/StickyMusicToggle";

// Self-hosted (SIL OFL 1.1) via next/font — see ASSETS.md for provenance.
// Hoisted to module scope so the font files are fetched/subset once at
// build time, not per request.
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const cormorantSc = Cormorant_SC({
  subsets: ["latin", "latin-ext"],
  weight: ["400", "600"],
  display: "swap",
  variable: "--font-cormorant-sc",
  fallback: ["Georgia", "serif"],
});

const greatVibes = Great_Vibes({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-great-vibes",
  fallback: ["cursive"],
});

export const metadata: Metadata = {
  title: "Wedding Invitation",
  description: "Wedding invitation page",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${cormorant.variable} ${cormorantSc.variable} ${greatVibes.variable}`}
    >
      <body className="bg-surface text-body font-serif antialiased">
        {children}
        <StickyMusicToggle />
      </body>
    </html>
  );
}
