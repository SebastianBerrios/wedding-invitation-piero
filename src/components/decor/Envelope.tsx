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
 *   - a PORTRAIT card that sits mostly ABOVE the envelope, its lower portion
 *     passing behind the front face's V.
 *
 * Stacking order, back to front:
 *   L1 interior     (z-0)  — the shaded inside of the envelope: the full
 *                            envelope silhouette, visible in the V-shaped
 *                            notch beside and behind the card
 *   L2 card         (z-10) — real HTML `children`; rises via `card-rise`
 *   L3 front face   (z-20) — the SAME silhouette with a V bitten out of its
 *                            top: two diagonals rise from the flap's tip to
 *                            the top-left and top-right corners. Everything
 *                            BELOW those diagonals is paper, so the card
 *                            passes behind them and shows through the notch
 *                            between them. That diagonal occlusion — not a
 *                            straight horizontal cut — is what reads as a
 *                            card tucked INSIDE an envelope
 *   L4 flap         (z-30) — hinges open (`rotateX`, `origin-top`).
 *                            `backface-visibility: hidden` makes it vanish as
 *                            it passes 90 degrees, so it never covers the
 *                            risen card. Closed, its triangle covers the
 *                            notch exactly (same tip, same corners), which is
 *                            what makes the closed state genuinely closed
 *   L5 rose + mono  (z-40) — static closure and imprint on the front face;
 *                            present in every state (closed, open, reduced
 *                            motion), as in the reference. The rose is pinned
 *                            at the V's tip, as in the reference
 *
 * Every SVG layer is `aria-hidden`; `children` (the real `h1`/`h2`) is plain
 * HTML on the card layer, so the SVG is never the only carrier of information.
 */

/** Flap tip depth as a fraction of the envelope's height. */
const FLAP_TIP_RATIO = 0.63;

/**
 * Every layer below shares the viewBox `0 0 400 250` (= the 8/5 aspect, so
 * `preserveAspectRatio="none"` never distorts anything) and every one of them
 * derives its geometry from these three numbers instead of repeating literals.
 *
 * `TIP_Y` is the single point where the flap's tip, the front face's V and the
 * rose closure all meet. Hard-coding it in two places is how the earlier
 * "blurred ghost chevron at 63%" drifted out of alignment with the real edge it
 * was faking.
 */
const VB_H = 250;
/** Depth of the flap tip / the V's apex, in viewBox units. */
const TIP_Y = VB_H * FLAP_TIP_RATIO;
/**
 * The envelope's outline, inset by 1 so a 1-unit stroke stays inside the
 * viewBox: square top corners (the diagonals land exactly on them) and rounded
 * bottom ones. L1 fills it whole; L3 is the same outline with the V removed.
 */
const OUTLINE_TAIL = "V247 A2 2 0 0 1 397 249 H3 A2 2 0 0 1 1 247 Z";
/** The notch: the triangle ABOVE the two diagonals, through which the card shows. */
const NOTCH_PATH = `M1 1 L200 ${TIP_Y} L399 1 Z`;

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
        {/* L1 — interior: the shaded inside, seen through the V-shaped notch
            that the front face leaves open — both while the flap is mid-swing
            and, once settled, in the two wedges either side of the card, where
            the diagonals climb past the card's edges to the top corners.
            Without it the open envelope reads as a flat ivory card with a
            mysterious rose on it. */}
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 400 250"
          preserveAspectRatio="none"
          aria-hidden="true"
          focusable="false"
        >
          <defs>
            <linearGradient id="envelope-interior" x1="0" y1="0" x2="0" y2="1">
              {/* 18%, not 34%: this is the darkest the inside gets, at the top
                  corners. At 34% it read as a hard greige bar rather than as
                  depth, back when the front face's straight top edge exposed
                  the interior as a ~5px strip; kept at 18% now that the V
                  exposes far more of it, where a heavier tint would compete
                  with the card instead of framing it. */}
              <stop
                offset="0%"
                stopColor="color-mix(in oklab, var(--color-rule) 18%, var(--color-surface-warm))"
              />
              <stop offset="100%" stopColor="var(--color-surface-warm)" />
            </linearGradient>
          </defs>
          {/* The full silhouette. It was a `rect rx="3"` while the face covered
              the whole envelope; now the V's corners reach y=1, and a 3-unit
              rounded corner there left a visible 2.6px sliver of page
              background inside the notch. Square top, rounded bottom. */}
          <path d={`M1 1 H399 ${OUTLINE_TAIL}`} fill="url(#envelope-interior)" />
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
          the pocket (`from` translateY is positive) and travel ~51% of its own
          height, exactly like a card being drawn out of an envelope, with the
          excess hidden rather than dangling under it.
        */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 overflow-hidden"
          style={{ top: "-300%" }}
        >
          <div className="envelope-card animate-card-rise absolute inset-x-[11%]">
            {/*
              `pb-[var(--card-hidden)]` shifts the content up so it centres in
              the card's VISIBLE area rather than its full box. Without it the
              part behind the front face's V eats the groom's name. The value is
              an integral over the notch, not a subtraction — see globals.css.
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

        {/* L3 — front face: the envelope outline with a V bitten out of its
            top. Its top boundary is TWO DIAGONALS rising from the flap's tip
            at (200, TIP_Y) to the top-left and top-right corners, so the paper
            is everything BELOW the V. The card passes behind those diagonals
            and shows through the notch between them.

            This was a full rectangle (`M1 5 H399 V247 ...`) and that single
            straight top edge was the whole defect: it cut the card with a
            horizontal line at the envelope's top, which reads as a card behind
            a box. The V that was visible before it was only the blurred
            decorative chevron below — a fake edge. Now the edge is real, and
            the chevron is demoted to the shadow that edge casts. */}
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
              <feGaussianBlur stdDeviation="3" />
            </filter>
            {/* Clips the shadow below to the notch, i.e. to the side of the
                fold the card is on. Without it the blur would also smear DOWN
                across the paper, which is the wrong side of a cast shadow and
                would read as a second, softer seam. */}
            <clipPath id="envelope-notch-clip">
              <path d={NOTCH_PATH} />
            </clipPath>
          </defs>
          <path
            d={`M1 1 L200 ${TIP_Y} L399 1 ${OUTLINE_TAIL}`}
            fill="url(#envelope-face)"
            stroke="var(--color-rule)"
            strokeWidth="1"
            strokeOpacity="0.55"
            strokeLinejoin="round"
          />
          {/* Depth where the card meets the V. This is the old ghost chevron,
              repurposed rather than duplicated: there is now a REAL edge
              exactly where it used to fake one, so keeping both would ship the
              "two conflicting seams" an earlier version was rejected for.
              Clipped to the notch, it is the shadow the paper's edge casts on
              whatever is behind it — the card, or the interior beside it — so
              the card reads as slipping behind the diagonals instead of being
              pasted under them. Blurred and low-alpha on purpose; a hard line
              here is what made previous attempts look cheap.

              Width and alpha were picked by sweeping them against the real
              render (scratchpad/v-sweep.mjs): 7 at 0.2 was invisible at 390px,
              20 at 0.55 turned the notch's narrow ends into a grey band — which
              is the cheap look — and 12 at 0.34 is where the card detaches from
              the paper without the shadow becoming an object of its own. */}
          <g clipPath="url(#envelope-notch-clip)">
            <path
              d={`M1 1 L200 ${TIP_Y} L399 1`}
              fill="none"
              stroke="var(--color-ink)"
              strokeOpacity="0.34"
              strokeWidth="12"
              strokeLinejoin="round"
              filter="url(#envelope-fold-blur)"
            />
          </g>
        </svg>

        {/* L4 — flap: hinges open from the top edge. One triangle, tip down.
            Its outline must COVER the notch exactly while closed, or a hairline
            of card shows along each diagonal. The wrapper is `FLAP_TIP_RATIO`
            of the envelope's height and the viewBox is 158 tall, so a path
            point at y=158 renders at y=TIP_Y in envelope units: the flap's two
            diagonals then run corner-to-tip along the same two lines as the V,
            with its 1-unit stroke as the only margin. (Drawn to y=157, as it
            was, the flap tip landed 1 unit short and its edges sat ~0.7px
            inside the notch.) The tip's linejoin is clipped by the viewBox
            edge; the rose sits on that exact point and hides it. */}
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
              d="M1 1 H399 L200 158 Z"
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
