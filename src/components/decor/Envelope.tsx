import type { ReactNode } from "react";

/**
 * Three-layer animated envelope (design §9, work unit 8a; corrective
 * redesign — Defects 1/2/6).
 *
 * SVG has no `z-index`, so the card cannot pass BETWEEN the back pocket and
 * the front pocket if this collapses into one SVG. Each layer is therefore
 * its own absolutely-positioned wrapper element inside one `relative`
 * container, and the CSS keyframes (`animate-flap-open` / `animate-card-rise`,
 * defined in globals.css) animate the WRAPPER `<div>`s, never the SVG nodes
 * directly.
 *
 * Geometry (Defect 1 fix): the container is now a true LANDSCAPE rectangle
 * (`aspect-[8/5]`, 1.6:1 — the previous portrait `aspect-[3/4]` is what
 * made the reviewed screenshots read as a tall card, not an envelope). The
 * body is a classic four-flap "pinwheel": every flap is a triangle from two
 * adjacent corners of the rectangle to a single shared apex at the exact
 * center (200,125 in the 400x250 viewBox). This is the same construction
 * real envelopes use, and it guarantees the seams are geometrically
 * consistent everywhere they meet — the previous version's near-duplicate
 * chevron (Defect 2) came from the static front-pocket fold and the
 * animated flap's resting silhouette landing at two DIFFERENT heights
 * (~62% and ~68%) instead of sharing one seam line. Sharing one apex
 * removes the second, ghost-like line entirely.
 *
 * Stacking order, back to front:
 *   L1 body          (implicit z-0)  — static left + right pocket wedges,
 *                                       each its own plane, separated from
 *                                       the center by a SOFT (blurred, low
 *                                       -opacity) shadow, never a hard
 *                                       stroke line
 *   L2 card          (z-10)          — real HTML `children`, animates up
 *   L3 front pocket  (z-20)          — static bottom "V" wedge, occupies
 *                                       the lower half; sits in FRONT of
 *                                       the card's lower portion even after
 *                                       it rises, giving the tucked-in-a-
 *                                       pocket read
 *   L4 top flap      (z-30)          — hinges open (rotateX, origin-top),
 *                                       the mirror-image top wedge of the
 *                                       same pinwheel, so its resting point
 *                                       lands on the SAME apex as L1/L3
 *   L5 seal          (z-40)          — a static wax-seal medallion sitting
 *                                       exactly at the apex, where the flap
 *                                       point and the pockets meet (Defect
 *                                       6). Unlike the previous "falls away
 *                                       and fades to opacity 0" version,
 *                                       this stays visible in every state
 *                                       (open, closed, reduced motion) —
 *                                       the reference keeps a persistent
 *                                       medallion here, not a one-shot
 *                                       breaking-wax effect. The two-letter
 *                                       monogram stays on the card only, so
 *                                       initials are never printed twice.
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
    <div className="envelope relative mx-auto w-full max-w-[32rem] aspect-[8/5]">
      {/* L1 — body: static left + right pocket wedges, meeting the shared
          apex with a soft blurred shadow instead of a hard seam line. */}
      <svg
        className="absolute inset-0 h-full w-full"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="envelope-base" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#fffdf7" />
            <stop offset="100%" stopColor="var(--color-surface-warm)" />
          </linearGradient>
          <linearGradient id="envelope-left" x1="0" y1="0.4" x2="1" y2="0.6">
            <stop offset="0%" stopColor="#fffdf7" />
            <stop
              offset="100%"
              stopColor="color-mix(in oklab, var(--color-ink) 8%, var(--color-surface-warm))"
            />
          </linearGradient>
          <linearGradient id="envelope-right" x1="1" y1="0.4" x2="0" y2="0.6">
            <stop offset="0%" stopColor="#fffdf7" />
            <stop
              offset="100%"
              stopColor="color-mix(in oklab, var(--color-ink) 8%, var(--color-surface-warm))"
            />
          </linearGradient>
          <filter id="envelope-seam-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.4" />
          </filter>
        </defs>
        <rect
          x="2"
          y="2"
          width="396"
          height="246"
          rx="4"
          fill="url(#envelope-base)"
          stroke="var(--color-rule)"
          strokeWidth="1"
        />
        <path d="M4 4 L4 246 L200 125 Z" fill="url(#envelope-left)" />
        <path d="M396 4 L396 246 L200 125 Z" fill="url(#envelope-right)" />
        {/* soft, blurred seam shadows only — never a hard outline between
            the three body planes (Defect 1: "separated by soft shadow
            rather than hard lines"). */}
        <g
          filter="url(#envelope-seam-blur)"
          stroke="var(--color-ink)"
          strokeOpacity="0.14"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
        >
          <path d="M6 8 L200 125 L6 242" />
          <path d="M394 8 L200 125 L394 242" />
        </g>
      </svg>

      {/* L2 — card: real HTML, so it is never the SVG-only carrier of
          information. Bottom-anchored (not top-anchored) so its height —
          which is driven by its own text content, not the envelope's short
          landscape aspect ratio — grows upward from a stable base instead
          of spilling past the envelope's bottom edge. */}
      <div className="envelope-card animate-card-rise absolute inset-x-[8%] bottom-[9%] z-10 flex flex-col items-center justify-center gap-2.5 rounded-card border border-rule/60 bg-surface px-4 py-5 text-center shadow-[0_18px_34px_-18px_rgba(15,16,21,0.35)] sm:gap-3 sm:px-6 sm:py-6">
        {children}
      </div>

      {/* L3 — front pocket: static bottom "V" wedge sharing the same apex
          as the body/flap, occupying the lower half of the envelope
          (Defect 1: "the flap occupying the lower half as a clearly
          visible shallow V"). Sits above the card so its lower portion
          reads as tucked into the pocket. */}
      <svg
        className="absolute inset-0 z-20 h-full w-full"
        viewBox="0 0 400 250"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient id="envelope-front-pocket" x1="0" y1="1" x2="0" y2="0.5">
            <stop offset="0%" stopColor="var(--color-surface-warm)" />
            <stop offset="100%" stopColor="#fffdf7" />
          </linearGradient>
          <filter id="envelope-crease-blur" x="-40%" y="-40%" width="180%" height="180%">
            <feGaussianBlur stdDeviation="2.2" />
          </filter>
        </defs>
        <path
          d="M4 246 L396 246 L200 125 Z"
          fill="url(#envelope-front-pocket)"
          stroke="var(--color-rule)"
          strokeWidth="1"
          strokeLinejoin="round"
        />
        {/* soft crease highlight along the fold, blurred rather than a
            crisp line */}
        <path
          d="M8 240 L200 129 L392 240"
          fill="none"
          stroke="var(--color-ink)"
          strokeOpacity="0.1"
          strokeWidth="2.5"
          strokeLinecap="round"
          filter="url(#envelope-crease-blur)"
        />
      </svg>

      {/* L4 — top flap: hinges open from the top edge (rotateX, origin-top).
          The mirror-image top wedge of the same pinwheel construction, so
          its resting point lands on the SAME apex as L1/L3 (Defect 2 fix —
          one shared seam, not two near-duplicate ones). */}
      <div className="envelope-flap animate-flap-open absolute inset-x-0 top-0 z-30 h-1/2 origin-top">
        <svg
          className="h-full w-full overflow-visible"
          viewBox="0 0 400 125"
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
            d="M4 4 L396 4 L200 125 Z"
            fill="url(#envelope-flap-face)"
            stroke="var(--color-rule)"
            strokeWidth="1"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* L5 — seal: a static wax-seal medallion pinned exactly at the
          apex, where the flap point and the pocket wedges meet (Defect 6).
          Always visible — open, closed, and under reduced motion — unlike
          a one-shot "breaks and falls away" effect, matching the
          reference's persistent medallion. */}
      <div className="envelope-seal absolute left-1/2 top-1/2 z-40 -translate-x-1/2 -translate-y-1/2">
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
