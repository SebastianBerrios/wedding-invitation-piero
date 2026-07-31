/* eslint-disable @next/next/no-img-element --
 * See PageBackground.tsx for the full reasoning: every raster in this project is
 * already the optimised output of `scripts/optimize-images.mjs`, so routing it
 * through `/_next/image` would re-encode an already-lossy WebP at a quality this
 * project did not choose and trade a static file for a runtime optimiser request.
 */

/**
 * The section divider: a hairline rule with a small diamond at its centre.
 *
 * ## Why this replaced the hand-drawn `Rule` component
 *
 * `Rule.tsx` (deleted) drew the same ornament as inline SVG — two `<line>`s and
 * a rotated `<rect>`, all in `--color-rule` (gold #bcb096). `separator.png` is
 * the couple's own asset for exactly this ornament, and it is what the reference
 * uses; measured, its opaque pixels are pure rgb(0,0,0), so it is a NEAR-BLACK
 * hairline where ours was pale gold. On cream that difference is the whole
 * point: the gold rule was barely visible (2.05:1) and the reference's divider
 * clearly reads as a line drawn on paper.
 *
 * ## Placement
 *
 * The reference does not divide every section. It draws this rule above AND
 * below the family block, above the dress code, and below the gifts — i.e. it
 * brackets the cream run in the middle of the page. So this component is placed
 * per-section by the sections themselves rather than by a generic
 * between-sections divider in `page.tsx` (that one, a rotated botanical sprig,
 * was deleted along with `Sprig.tsx`).
 *
 * ## Loading
 *
 * `loading="lazy"` on every instance: all of them are below the fold by
 * definition, and the one file is fetched once and reused by all four. Explicit
 * `width`/`height` keep CLS at 0 while lazy.
 *
 * ## Width
 *
 * `13rem` (208px) is a measured compromise, not a round number. The reference
 * draws this rule at about 31% of its viewport — 135px on the 430px capture — but
 * the asset's own aspect is 37.8:1, so at 135px its centre diamond would render
 * 3.6px tall and disappear. At 208px the diamond lands at 5.5px, which is roughly
 * the size the reference's is, and the line is still clearly an ornament rather
 * than a full-width divider. The two constraints pull opposite ways and this is
 * where they meet.
 *
 * Purely decorative — `aria-hidden` with an empty `alt`, never a description.
 */
export function Separator({ className = "" }: { className?: string }) {
  return (
    <img
      src="/images/opt/separator.webp"
      // The derivative's own cropped size (the asset's alpha bounding box).
      width={794}
      height={21}
      alt=""
      aria-hidden="true"
      loading="lazy"
      decoding="async"
      className={`h-auto w-full max-w-[13rem] select-none ${className}`}
    />
  );
}
