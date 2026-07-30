import type { Metadata } from "next";
import {
  Cormorant_Garamond,
  Cormorant_SC,
  Pinyon_Script,
} from "next/font/google";
import "./globals.css";
import { StickyMusicToggle } from "@/components/interactive/StickyMusicToggle";
import { PageBackground } from "@/components/decor/PageBackground";

// Self-hosted (SIL OFL 1.1) via next/font — see ASSETS.md for provenance.
// Hoisted to module scope so the font files are fetched/subset once at
// build time, not per request.
//
// Weight 600 was declared for both families but is NEVER applied anywhere
// in the codebase (confirmed: no `font-semibold`/`font-bold`/`font-[600]`
// utility exists on any element using `font-serif`/`font-caps`, and Tailwind
// v4's preflight resets headings to `font-weight: inherit`). Because
// `next/font` preloads every declared weight unconditionally regardless of
// whether the page actually renders it, that dead weight was shipped as a
// real, wasted network request on every load. Trimming to the single
// weight actually used removes it with zero visual change (verified via
// computed-style audit against the live page).
const cormorant = Cormorant_Garamond({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
  variable: "--font-cormorant",
  fallback: ["Georgia", "Times New Roman", "serif"],
});

const cormorantSc = Cormorant_SC({
  subsets: ["latin", "latin-ext"],
  weight: ["400"],
  display: "swap",
  variable: "--font-cormorant-sc",
  fallback: ["Georgia", "serif"],
});

// Script face for the couple's names (VISUAL RESTYLE pass, target item 3).
// Great Vibes was replaced by Pinyon Script: Great Vibes is a slanted, loopy,
// near-monoline hand; the target is an UPRIGHT, high-contrast formal
// calligraphic script with ornate swash capitals. Rejected alternatives,
// screenshotted side by side at 44px and 64px before deciding:
//   - Petit Formal Script — large x-height, low stroke contrast, plain
//     capitals; reads modern-friendly, not engraver's formal.
//   - Italianno — even MORE slanted than Great Vibes and lighter still; its
//     hairlines nearly vanish on cream at mobile sizes.
// Pinyon Script keeps a thick/thin copperplate contrast, sits closer to
// upright, and its C/P capitals carry the decorative swash entry strokes the
// reference has. Also SIL OFL 1.1 and available through next/font/google, so
// it stays self-hosted with zero third-party requests (see ASSETS.md).
const pinyonScript = Pinyon_Script({
  subsets: ["latin", "latin-ext"],
  weight: "400",
  display: "swap",
  variable: "--font-pinyon",
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
      className={`${cormorant.variable} ${cormorantSc.variable} ${pinyonScript.variable}`}
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

        <PageBackground />

        {children}

        {/*
          `GrainOverlay` used to sit here, multiplying a fine noise tile over
          everything for paper tooth. It was DELETED with the SVG floral:
          `background-main.png` is a real cold-pressed watercolour and already
          carries its own grain, so a second grayscale multiply over it only
          desaturated the pigment it was supposed to enrich.
        */}

        <StickyMusicToggle />
      </body>
    </html>
  );
}
