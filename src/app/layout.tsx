import type { Metadata } from "next";
import { Cormorant_Garamond, Cormorant_SC, Great_Vibes } from "next/font/google";
import "./globals.css";
import { StickyMusicToggle } from "@/components/interactive/StickyMusicToggle";
import { WatercolorBackground } from "@/components/decor/WatercolorBackground";
import { GrainOverlay } from "@/components/decor/GrainOverlay";

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
      // The `reveal-ready` inline script below deliberately mutates this
      // element's className before/during hydration (the same no-flash
      // pattern documented dark-mode class scripts use, e.g. next-themes) —
      // React cannot know about that external mutation from the server
      // render, so it would otherwise report a false-positive hydration
      // mismatch here specifically. No other attribute on this element is
      // suppressed.
      suppressHydrationWarning
    >
      <body className="bg-surface text-body font-serif antialiased">
        {/*
          Reveal readiness gate (design §10, work unit 8b). Synchronous and
          the FIRST body child, so it runs before any section paints — no
          flash of hidden content. If JS never runs (disabled or a failed
          hydration), this class never lands and `.reveal-ready`'s scoped
          CSS rule never matches, so `[data-reveal="idle"]` stays visible
          via its own un-scoped default (globals.css) — content is never
          trapped invisible. Same no-flash pattern as dark-mode class
          scripts (e.g. next-themes).
        */}
        <script
          dangerouslySetInnerHTML={{
            __html: "document.documentElement.classList.add('reveal-ready')",
          }}
        />

        <WatercolorBackground />

        {children}

        {/*
          Grain sits ABOVE content (mix-blend-mode: multiply reads against
          everything painted below it) but is pointer-events-none so it
          never intercepts clicks/taps.
        */}
        <GrainOverlay />

        <StickyMusicToggle />
      </body>
    </html>
  );
}
