import type { ReactNode } from "react";
import { Monogram } from "@/components/decor/Monogram";
import { RoseSeal } from "@/components/decor/RoseSeal";

/**
 * Animated envelope (design §9; VISUAL RESTYLE pass, target items 2 and 4).
 *
 * ## The one thing that must never be refactored away
 *
 * The mechanic is a CLOSED envelope whose flap rotates open and whose card
 * rises out of it. That effect is the single element the user explicitly asked
 * to preserve through this restyle. Its geometry and timing may be retuned;
 * the effect may not be replaced with a fade or a static composition. It is
 * pure CSS (`animation-delay` chained off page load), so it works with
 * JavaScript disabled, and `prefers-reduced-motion: reduce` lands on the
 * settled OPEN state with no animation (both handled in globals.css).
 *
 * ## Why this is four sibling wrappers and not one SVG
 *
 * SVG has no `z-index`. The card has to pass BETWEEN the envelope's interior
 * and its front face, so each layer is its own absolutely-positioned element
 * inside one `relative` container, and the CSS animates the WRAPPER `<div>`s,
 * never the SVG nodes (`rendering-animate-svg-wrapper`). Collapsing this into
 * a single SVG breaks the effect.
 *
 * ## Geometry (restyled)
 *
 * The previous version was a four-flap "pinwheel" with a gold wax disc at the
 * centre and the monogram printed on the card. The reference is simpler and
 * this now matches it:
 *
 *   - ONE large triangular flap hinged at the top edge, its tip pointing DOWN
 *     to 63% of the envelope's height (`FLAP_TIP_RATIO`).
 *   - a white-rose rosette as the closure, pinned at that tip.
 *   - the couple's monogram on the envelope's FRONT FACE, below the rose.
 *   - a PORTRAIT card that sits mostly ABOVE the envelope, with only its
 *     lower third overlapped by the front face.
 *
 * Stacking order, back to front:
 *   L1 interior     (z-0)  — the shaded inside of the envelope, visible in the
 *                            triangular notch the opened flap leaves behind
 *   L2 card         (z-10) — real HTML `children`; rises via `card-rise`
 *   L3 front face   (z-20) — ivory rect. Overlaps the card's lower third,
 *                            which is what gives the tucked-in read
 *   L4 flap         (z-30) — hinges open (`rotateX`, `origin-top`).
 *                            `backface-visibility: hidden` makes it vanish as
 *                            it passes 90 degrees, so it never covers the
 *                            risen card
 *   L5 rose + mono  (z-40) — static closure and imprint on the front face;
 *                            present in every state (closed, open, reduced
 *                            motion), as in the reference
 *
 * Every SVG layer is `aria-hidden`; `children` (the real `h1`/`h2`) is plain
 * HTML on the card layer, so the SVG is never the only carrier of information.
 */

/** Flap tip depth as a fraction of the envelope's height. */
const FLAP_TIP_RATIO = 0.63;

export function Envelope({
  children,
  monogram,
}: {
  children: ReactNode;
  monogram: string;
}) {
  return (
    /*
     * `envelope-frame` is an inline-size container ONLY so that the card's
     * overhang can be reserved in layout (see `.envelope` margin-top in
     * globals.css). `cqi` inside it resolves against this element's width,
     * which — because the `max-w` cap lives HERE and not on `.envelope` —
     * is exactly the envelope's rendered width at every viewport. Without
     * that, the overhang would have to be guessed with viewport units and
     * would drift the moment the cap engaged.
     */
    <div className="envelope-frame mx-auto w-full max-w-[26rem]">
      <div className="envelope relative w-full aspect-[8/5]">
        {/* L1 — interior: the shaded inside, seen through the triangular
            notch that the opened flap leaves. Without it the open envelope
            reads as a flat ivory card with a mysterious rose on it. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="envelope-interior" x1="0" y1="0" x2="0" y2="1">
              {/* 18%, not 34%: the interior only shows through an ~5px strip
                  at the envelope's top edge, and at 34% that strip read as a
                  hard greige bar cutting across the card rather than as depth
                  inside the envelope. */}
              <stop
                offset="0%"
                stopColor="color-mix(in oklab, var(--color-rule) 18%, var(--color-surface-warm))"
              />
              <stop offset="100%" stopColor="var(--color-surface-warm)" />
            </linearGradient>
          </defs>
          <rect
            x="1"
            y="1"
            width="398"
            height="248"
            rx="3"
            fill="url(#envelope-interior)"
          />
        </svg>

        {/* L2 — card: real HTML, so the invitation text is never SVG-only.
            Portrait by construction (`aspect-ratio` on `.envelope-card`), and
            bottom-anchored inside the envelope so `card-rise` lifts it out
            from a stable base. */}
        {/*
          Pocket clip. A PORTRAIT card is taller than a landscape envelope, so
          it can never be fully hidden by position alone — at rest it stuck out
          140px above the envelope's top edge and the "closed" state read as a
          card already halfway out, which robbed the rise of its whole point.
          This wrapper's bottom edge is the envelope's bottom edge and its top
          is far above the composition, so it clips ONLY what falls below the
          envelope. That lets `card-rise` start the card pushed right down into
          the pocket (`from` translateY is positive) and travel a full ~70% of
          its own height, exactly like a card being drawn out of an envelope,
          with the excess hidden rather than dangling under it.
        */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 overflow-hidden"
          style={{ top: "-300%" }}
        >
          <div className="envelope-card animate-card-rise absolute inset-x-[11%]">
            {/*
              `pb-[var(--card-hidden)]` shifts the content up so it centres in
              the card's VISIBLE area rather than its full box. Without it the
              lower third — which is behind the envelope's front face — eats the
              groom's name.
            */}
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 rounded-[3px] bg-surface px-[9%] pt-[7%] pb-[calc(var(--card-hidden)+7%)] text-center shadow-[0_20px_38px_-20px_rgba(15,16,21,0.4)]">
              {/*
                Inset hairline frame (target item 2). Two rules a hair apart —
                the card's own edge and this inset line — are what read as the
                reference's "double rule inside the card edge". `aria-hidden`
                decoration, so `--color-rule` on a `border` is its legal use.
              */}
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[7px] rounded-[2px] border border-rule/70 sm:inset-[10px]"
              />
              <span
                aria-hidden="true"
                className="pointer-events-none absolute inset-[10px] rounded-[2px] border border-rule/25 sm:inset-[14px]"
              />
              {children}
            </div>
          </div>
        </div>

        {/* L3 — front face: a plain ivory rect covering the whole envelope.
            It sits ABOVE the card, so the card's lower third disappears
            behind it (the reference's "only its lower third overlapped"). */}
        <svg
          className="absolute inset-0 z-20 h-full w-full"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="envelope-face" x1="0" y1="0" x2="0.15" y2="1">
              <stop offset="0%" stopColor="#fffdf7" />
              <stop offset="62%" stopColor="var(--color-surface)" />
              <stop offset="100%" stopColor="var(--color-surface-warm)" />
            </linearGradient>
            <filter
              id="envelope-fold-blur"
              x="-20%"
              y="-20%"
              width="140%"
              height="140%"
              colorInterpolationFilters="sRGB"
            >
              <feGaussianBlur stdDeviation="2.4" />
            </filter>
          </defs>
          {/* The face starts BELOW the top edge: the strip above it is the
              flap's hinge line, so the fold never floats detached. */}
          <path
            d="M1 5 H399 V247 A2 2 0 0 1 397 249 H3 A2 2 0 0 1 1 247 Z"
            fill="url(#envelope-face)"
            stroke="var(--color-rule)"
            strokeWidth="1"
            strokeOpacity="0.55"
          />
          {/* Ghost of the closed flap: a soft, blurred triangular shadow, so
              the open envelope still carries the reference's triangular
              vocabulary. Blurred, never a hard outline — a crisp second
              chevron is what made an earlier version look like it had two
              conflicting seams. */}
          <path
            d={`M6 7 L200 ${(250 * FLAP_TIP_RATIO).toFixed(0)} L394 7`}
            fill="none"
            stroke="var(--color-ink)"
            strokeOpacity="0.09"
            strokeWidth="3"
            strokeLinecap="round"
            filter="url(#envelope-fold-blur)"
          />
        </svg>

        {/* L4 — flap: hinges open from the top edge. One triangle, tip down. */}
        <div
          className="envelope-flap animate-flap-open absolute inset-x-0 top-0 z-30 origin-top"
          style={{ height: `${(FLAP_TIP_RATIO * 100).toFixed(0)}%` }}
        >
          <svg
            className="h-full w-full"
            viewBox="0 0 400 158"
            preserveAspectRatio="none"
            aria-hidden="true"
            focusable="false"
          >
            <defs>
              <linearGradient id="envelope-flap-face" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fffdf7" />
                <stop
                  offset="100%"
                  stopColor="color-mix(in oklab, var(--color-surface-warm) 88%, var(--color-rule))"
                />
              </linearGradient>
            </defs>
            <path
              d="M1 1 H399 L200 157 Z"
              fill="url(#envelope-flap-face)"
              stroke="var(--color-rule)"
              strokeWidth="1"
              strokeOpacity="0.6"
              strokeLinejoin="round"
            />
          </svg>
        </div>

        {/* L5 — closure + imprint. Both are static and stay visible in every
            state, matching the reference's persistent rose and monogram. */}
        <div
          className="absolute left-1/2 z-40 -translate-x-1/2 -translate-y-1/2 drop-shadow-[0_3px_5px_rgba(15,16,21,0.16)]"
          style={{ top: `${(FLAP_TIP_RATIO * 100).toFixed(0)}%` }}
        >
          <RoseSeal className="h-12 w-12 sm:h-16 sm:w-16" />
        </div>
        <div
          className="absolute left-1/2 z-40 -translate-x-1/2"
          // Sits between the rose and the envelope's bottom edge.
          style={{ top: `${(FLAP_TIP_RATIO * 100 + 14).toFixed(0)}%` }}
        >
          <Monogram
            initials={monogram}
            variant="plain"
            className="h-5 w-14 sm:h-6 sm:w-16"
          />
        </div>
      </div>
    </div>
  );
}
