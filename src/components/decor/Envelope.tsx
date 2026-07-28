import type { ReactNode } from "react";

/**
 * Three-layer animated envelope (design §9, work unit 8a).
 *
 * SVG has no `z-index`, so the card cannot pass BETWEEN the back pocket and
 * the front pocket if this collapses into one SVG. Each layer is therefore
 * its own absolutely-positioned wrapper element inside one `relative`
 * container, and the CSS keyframes (`animate-flap-open` / `animate-card-rise`,
 * defined in globals.css) animate the WRAPPER `<div>`s, never the SVG nodes
 * directly.
 *
 * Stacking order, back to front:
 *   L1 back pocket   (implicit z-0)  — static envelope body
 *   L2 card          (z-10)          — real HTML `children`, animates up
 *   L3 front pocket  (z-20)          — static "V" fold, sits in FRONT of
 *                                       the card's lower half even after it
 *                                       rises, giving the tucked-in-a-pocket
 *                                       read
 *   L4 top flap      (z-30)          — hinges open (rotateX, origin-top)
 *   L5 seal          (z-40)          — falls away independently, just
 *                                       before the flap opens
 *
 * All motion is CSS-only (`animation-delay` chained from page load) — this
 * component needs zero JS and stays a server component. `prefers-reduced-
 * motion: reduce` is handled entirely in globals.css (final open state,
 * zero transition).
 *
 * Every SVG layer is purely decorative (`aria-hidden`); `children` (the
 * real `h1`/`h2`/monogram) is plain HTML on top of the card layer, so the
 * SVG is never the only carrier of information.
 */
export function Envelope({ children }: { children: ReactNode }) {
  return (
    <div className="envelope relative mx-auto w-full max-w-[22rem] aspect-[3/4]">
      {/* L1 — back pocket: the envelope body the card emerges from. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="envelope-paper" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffdf7" />
            <stop offset="100%" stopColor="var(--color-surface-warm)" />
          </linearGradient>
          <linearGradient id="envelope-pocket-shadow" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-ink)" stopOpacity="0.14" />
            <stop offset="100%" stopColor="var(--color-ink)" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect
          x="3"
          y="3"
          width="294"
          height="394"
          rx="6"
          fill="url(#envelope-paper)"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
        {/* soft shadow near the pocket mouth, where the card sits/emerges */}
        <rect x="18" y="14" width="264" height="80" fill="url(#envelope-pocket-shadow)" />
        {/* faint top-corner creases */}
        <path
          d="M3 3 L78 58 M297 3 L222 58"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="0.75"
          strokeOpacity="0.5"
        />
      </svg>

      {/* L2 — card: real HTML, so it is never the SVG-only carrier of information. */}
      <div className="envelope-card animate-card-rise absolute inset-x-[10%] top-[8%] z-10 flex min-h-[52%] flex-col items-center justify-center gap-3 rounded-card border border-rule/60 bg-surface px-4 py-6 text-center shadow-[0_18px_34px_-18px_rgba(15,16,21,0.35)]">
        {children}
      </div>

      {/*
        L3 — front pocket: static, SHALLOW "V" fold confined to the lower
        ~15% of the envelope (well below the card's text zone, which ends
        around 60-65% down) — this used to reach halfway up the card and
        read as an oversized, dominant triangle. Kept shallow and low.
      */}
      <svg
        className="absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 300 400"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="envelope-pocket-face" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="var(--color-surface-warm)" />
            <stop offset="100%" stopColor="#fffdf7" />
          </linearGradient>
        </defs>
        <path
          d="M3 396 L3 344 L150 300 L297 344 L297 396 Z"
          fill="url(#envelope-pocket-face)"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
        {/* crease highlight along the fold */}
        <path
          d="M3 344 L150 300 L297 344"
          fill="none"
          stroke="var(--color-rule)"
          strokeWidth="1"
          strokeOpacity="0.7"
        />
      </svg>

      {/*
        L4 — top flap: hinges open from the top edge (rotateX, origin-top).
        Shaped as a flat-topped band down to a shallow center point (not a
        plain triangle) so it fully covers the card's width at rest — a
        pure triangle left the card's top corners visible even when closed.
      */}
      <div className="envelope-flap animate-flap-open absolute inset-x-0 top-0 z-30 h-[66%] origin-top">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 300 264"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="envelope-flap-face" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#fffdf7" />
              <stop offset="100%" stopColor="var(--color-surface-warm)" />
            </linearGradient>
          </defs>
          <path
            d="M3 3 L297 3 L297 182 L150 260 L3 182 Z"
            fill="url(#envelope-flap-face)"
            stroke="var(--color-rule)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* L5 — seal: falls away independently, at the point where the flap
          tip and the front-pocket tip meet. */}
      <div className="envelope-seal absolute left-1/2 top-[66%] z-40 -translate-x-1/2 -translate-y-1/2">
        <svg
          viewBox="0 0 64 64"
          className="h-9 w-9 lg:h-11 lg:w-11"
          aria-hidden="true"
          focusable="false"
        >
          <circle cx="32" cy="32" r="27" fill="var(--color-rule)" />
          {/* hand-drawn rose whorl, five overlapping arcs */}
          <g
            fill="none"
            stroke="var(--color-surface)"
            strokeOpacity="0.55"
            strokeWidth="1.1"
          >
            <path d="M32 13 C 41 15, 46 22, 44 31" />
            <path d="M44 31 C 46 40, 41 47, 32 49" />
            <path d="M32 49 C 23 47, 18 40, 20 31" />
            <path d="M20 31 C 18 22, 23 15, 32 13" />
            <circle cx="32" cy="31" r="6.5" />
          </g>
        </svg>
      </div>
    </div>
  );
}
