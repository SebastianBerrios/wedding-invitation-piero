/* eslint-disable @next/next/no-img-element --
 * See the same disable in PageBackground.tsx: every raster here is already the
 * optimised, content-cropped output of `scripts/optimize-images.mjs`, so
 * `next/image` would only re-encode it at runtime. These three are also fixed
 * at one intrinsic size (the envelope never renders wider than 26rem), so there
 * is no responsive `srcSet` for `next/image` to contribute either.
 */

import type { ReactNode } from "react";
import { Monogram } from "@/components/decor/Monogram";

/**
 * Animated envelope, built from the real photographed paper (design §9).
 *
 * ## The one thing that must never be refactored away
 *
 * The mechanic is a CLOSED envelope whose flap rotates open and whose card
 * rises out of it. That effect is the single element the user has explicitly
 * asked to preserve, twice. Its geometry and timing may be retuned; the effect
 * may not be replaced with a fade or a static composition. It is pure CSS
 * (`animation-delay` chained off page load), so it works with JavaScript
 * disabled, and `prefers-reduced-motion: reduce` lands on the settled OPEN
 * state with no animation (both handled in globals.css).
 *
 * ## What replaced what
 *
 * Every layer here used to be hand-drawn SVG: a gradient-filled silhouette for
 * the interior, a V-shaped path for the front face, a triangular path for the
 * flap, a blurred chevron faking the fold's cast shadow, and `RoseSeal.tsx`
 * (deleted) drawing a rosette from three rings of one petal path. All of it is
 * now user-supplied raster paper (see ASSETS.md), which carries real
 * cold-pressed tooth, real lace trim and a photographic rose that no amount of
 * bezier work was going to reach. The fake fold shadow is gone: the front
 * face's own paper edge casts a real one.
 *
 * The monogram is the ONE drawn element kept. `envelope-front.webp` has no
 * monogram and the reference prints one on the envelope's face, so `Monogram`
 * stays, positioned over the front layer.
 *
 * ## Why the layers register without arithmetic
 *
 * `envelope-back.webp` and `envelope-front.webp` are cropped from their sources
 * with the IDENTICAL rect (`ENVELOPE_RECT` in `scripts/optimize-images.mjs`),
 * so both derivatives ARE the envelope's own 469x361 box. Stacking them at
 * `inset-0` therefore aligns them exactly, with no offsets to drift. That is
 * also why `.envelope` carries `aspect-ratio: 469 / 361` — the raster's own
 * aspect, not a chosen one.
 *
 * ## Why this is sibling wrappers and not one image
 *
 * The card has to pass BETWEEN the envelope's interior and its front face, and
 * the flap has to rotate independently, so each layer is its own absolutely
 * positioned element inside one `relative` container. `.envelope` has
 * `perspective` but the default `transform-style: flat`, so each child is
 * rasterised into its own plane and then composited by `z-index` — which is
 * what lets a 3D-rotating flap still obey the paint order below.
 *
 * Stacking order, back to front:
 *   L1 interior  (z-0)  — `envelope-back.webp`: the envelope's inside, seen
 *                         through the V notch beside and behind the card
 *   L2 card      (z-10) — `card.webp` plus the real HTML `children`; rises via
 *                         `card-rise`
 *   L3 flap      (z-15) — hinges open (`rotateX`, `origin-top`). Sits BELOW the
 *                         front face on purpose: the face's paper hides any
 *                         overshoot past the V, and the face's baked rose then
 *                         sits ON TOP of the closed flap tip, which is exactly
 *                         where a closure belongs. `backface-visibility:
 *                         hidden` makes it vanish as it passes 90 degrees, so
 *                         the opened flap never covers the risen card
 *   L4 front     (z-20) — `envelope-front.webp`: the pocket, whose top boundary
 *                         is a V with the rose at its apex. Everything BELOW
 *                         the two diagonals is paper, so the card passes behind
 *                         them and shows through the notch between them. That
 *                         diagonal occlusion is what reads as a card tucked
 *                         INSIDE an envelope
 *   L5 monogram  (z-30) — imprint on the front face, present in every state
 *
 * Every image layer is `aria-hidden` with an empty `alt` — they carry no
 * information. `children` (the real `h1`/`h2`) is plain HTML on the card layer.
 */

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
      <div className="envelope relative w-full">
        {/* L1 — interior. Visible in the V-shaped notch the front face leaves
            open: while the flap is mid-swing, and once settled in the two
            wedges either side of the card where the diagonals climb past the
            card's edges to the top corners. Without it the open envelope reads
            as a flat card with a mysterious rose on it. */}
        <img
          src="/images/opt/envelope-back.webp"
          width={469}
          height={361}
          alt=""
          aria-hidden="true"
          className="absolute inset-0 h-full w-full"
        />

        {/*
          Pocket clip. A PORTRAIT card is 1.375x the height of this landscape
          envelope, so it can never be fully hidden by position alone — at rest
          it would stick out above the envelope's top edge and the "closed"
          state would read as a card already halfway out, which robs the rise of
          its whole point. This wrapper's bottom edge is the envelope's bottom
          edge and its top is far above the composition, so it clips ONLY what
          falls below the envelope. That lets `card-rise` start the card pushed
          right down into the pocket (`from` translateY is positive) and travel
          ~51% of its own height, exactly like a card being drawn out of an
          envelope, with the excess hidden rather than dangling under it.
        */}
        {/*
          `clip-path` trims two extra pixels off the bottom on top of
          `overflow-hidden`. `letter.png`'s paper fades out over its last couple
          of rows, and `ENVELOPE_RECT` deliberately includes them (cropping them
          away would change the envelope's aspect, and every geometry constant
          derived from it, to save 2px) — so the front face's final pixel rows
          are near-transparent and the card's glyph tips bled through them:
          measured as 229 magenta pixels on one row at 1440, none at 390. This
          is the same defect commit 834d429 fixed for the SVG face, for the same
          reason, and it came back with the raster because the raster has the
          same soft bottom edge.
        */}
        <div
          className="absolute inset-x-0 bottom-0 z-10 overflow-hidden [clip-path:inset(0_0_2px_0)]"
          style={{ top: "-300%" }}
        >
          <div className="envelope-card animate-card-rise absolute inset-x-[17%]">
            {/* The card's paper, with its embossed inset frame and notched
                corners baked in. The two hand-drawn hairline `border` spans
                that used to fake that frame were REMOVED — shipping both would
                put two rules a few pixels apart, which is the "two conflicting
                seams" failure an earlier pass was rejected for. */}
            <img
              src="/images/opt/card.webp"
              width={467}
              height={749}
              alt=""
              aria-hidden="true"
              /* `drop-shadow`, not `box-shadow`: the filter follows the
                 raster's own alpha, so the shadow traces the sheet's
                 slightly irregular photographed edge instead of a perfect
                 CSS rectangle a few pixels off it. */
              className="absolute inset-0 h-full w-full rounded-[2px] drop-shadow-[0_16px_24px_rgba(15,16,21,0.20)]"
            />
            {/*
              `pb-[var(--card-hidden)]` shifts the content up so it centres in
              the card's VISIBLE area rather than its full box. Without it the
              part behind the front face's V eats the groom's name. The value is
              an integral over the notch, not a subtraction — see globals.css.

              `px-[13%]`/`pt-[11%]` clear the raster's own embossed frame, which
              sits about 7.5% in from the paper's edge.
            */}
            <div className="relative flex h-full w-full flex-col items-center justify-center gap-3 px-[13%] pt-[11%] pb-[calc(var(--card-hidden)+11%)] text-center">
              {children}
            </div>
          </div>
        </div>

        {/* L3 — flap: hinges open from the envelope's top edge.
            NO `clip-path`. The derivative's own alpha already IS the triangle
            (it is cropped to the lace triangle's exact bounding box, apex
            flipped to the bottom), and a polygon inscribed in that box would
            cut straight through the lace scallops, which hang a few pixels past
            the paper's edge.
            `--flap-depth` is 212 source px of the envelope's 361, i.e. ~6px
            deeper than the V's apex. The overshoot is deliberate: the flap
            triangle squashed to that depth is fractionally WIDER than the V at
            every depth, so it covers the notch with a 3-11px margin instead of
            leaving a hairline of card along a fold, and everything it overshoots
            lands under the front face (z-20) or under the rose. */}
        <div
          className="envelope-flap animate-flap-open absolute inset-x-0 top-0 z-[15] origin-top"
        />

        {/* L4 — front face: the pocket. Its top boundary is two diagonals
            rising from the rose at the V's apex to the envelope's top corners,
            so the paper is everything BELOW the V and the card passes behind
            it. The rose is baked in here rather than being a separate layer,
            which is what makes it occlude the closed flap's tip correctly. */}
        <img
          src="/images/opt/envelope-front.webp"
          width={469}
          height={361}
          alt=""
          aria-hidden="true"
          /* This 8 KiB file is the page's measured LCP element, so it is the
             one raster that genuinely earns `high`. It sat behind a 100 KiB
             backdrop that had claimed the attribute for itself. */
          fetchPriority="high"
          /* Contact shadow. Without it the whole composition floats on the
             painting; the reference sits its envelope on a soft one. Same
             `drop-shadow`-over-`box-shadow` reasoning as the card, and here it
             matters more: the shadow has to follow the V, not the bounding box,
             or it prints a bright rectangle across the notch. */
          className="absolute inset-0 z-20 h-full w-full drop-shadow-[0_12px_20px_rgba(15,16,21,0.16)]"
        />

        {/* L5 — imprint. Static, visible in every state (closed, open, reduced
            motion), sitting between the rose and the envelope's bottom edge. */}
        <div className="absolute left-1/2 top-[74%] z-30 -translate-x-1/2">
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
