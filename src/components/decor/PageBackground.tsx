/* eslint-disable @next/next/no-img-element --
 * `next/image` is deliberately not used for any raster in this project. The
 * files under `public/images/opt/` are ALREADY the optimised output of
 * `scripts/optimize-images.mjs` (cropped to content, WebP, width variants
 * capped at the source's native resolution). Routing them through
 * `/_next/image` would re-encode an already-lossy WebP a second time, at a
 * quality this project did not choose, and would trade a static file for a
 * runtime image-optimiser request — a cold-start cost and a host dependency —
 * for zero byte saving. `srcSet`/`sizes`/`fetchPriority` below give the parts
 * of `next/image` that actually matter here, natively.
 */

/**
 * The page's watercolour-floral backdrop (design §9).
 *
 * ## What this replaced
 *
 * `WatercolorBackground.tsx` (deleted) hand-authored the floral in inline SVG:
 * two asymmetric petal paths and one leaf composed into 11 blooms across three
 * jittered concentric rings, plus haze ellipses, a bounded `feGaussianBlur`,
 * a `.watercolor` paper gradient and a repeated `feTurbulence` mottle tile. It
 * took six screenshot-reviewed iterations to stop reading as grey daisies and
 * still never got real pigment granulation. `GrainOverlay.tsx` (also deleted)
 * multiplied a fine noise tile over the whole page for paper tooth.
 *
 * `background-main.png` supersedes all of it: it is a real cold-pressed
 * watercolour with its own paper grain, so the separate grain overlay became
 * redundant rather than merely cheaper — a second multiply layer over an image
 * that already has tooth only desaturates it.
 *
 * ## `cover`, not a repeated tile
 *
 * The source is portrait 901x1600 and is NOT seamless: petals are cut at the
 * frame. Tiling was measured and rejected — the tone across the left/right
 * edges differs by a mean of 16.7/255 per channel, which is statistically
 * indistinguishable from two random interior columns (17.6), so the SEAM tone
 * would hide; but the petal SHAPES break at it, and at any tile size large
 * enough to keep the reference's big petals a desktop viewport shows the break
 * two or three times. `cover` keeps one continuous painting: on a phone the
 * image's 0.563 aspect is close to the viewport's, so it barely crops and never
 * upscales; on a 1440-wide desktop it scales 1.6x, which a soft watercolour
 * absorbs where a hard-edged graphic would not.
 *
 * ## Why an `<img>` and not a CSS `background-image`
 *
 * A CSS background cannot do width-based `srcset`: `image-set()` selects on
 * resolution or MIME type, not viewport width, so a CSS background would ship
 * one width to every device or fake it with media queries. An `<img>` gets
 * `sizes="100vw"` and hands a 480w file (39 KiB) to a phone instead of the 901w
 * one (120 KiB). It is also found by the preload scanner in the initial HTML,
 * so no separate `<link rel="preload">` is needed; `fetchPriority="high"` puts
 * it ahead of the font requests it competes with.
 *
 * The trade-off, stated because it is real: an `<img>` is an LCP candidate and
 * a CSS background is not, so this moves LCP onto the backdrop. Measured
 * either way — see the apply-progress entry for the numbers.
 *
 * ## The cream scrim is a contrast requirement, not a taste choice
 *
 * The painting's mean luminance is 0.497 and its darkest pixels reach 0.086.
 * Against `--color-body` (olive #575531, luminance 0.094) that is 3.98:1 at the
 * MEAN and 1.01:1 at the darkest petal, so no olive body copy can sit on it.
 * `--page-veil` is the small cream layer that keeps the HERO's own two olive-free
 * text nodes comfortable; the value was chosen by measuring composited pixels,
 * see globals.css.
 *
 * ## One layer, not two
 *
 * Batch A added a second, document-height scrim below the hero because the six
 * content sections had no surface of their own and their olive copy composited
 * straight onto the painting. Batch B gave every section its own opaque ground
 * (cream or `--color-surface-dark`, alternating, as the reference does), so that
 * scrim had nothing left to protect and was removed along with the
 * `body { position: relative }` it needed. The painting is now at full strength
 * in the hero and covered everywhere below it — which is the reference's own
 * structure, and the reason it no longer reads as a ghost.
 *
 * Purely decorative: `aria-hidden`, empty `alt`, `pointer-events-none`.
 */
export function PageBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden bg-surface"
    >
      <img
        src="/images/opt/background-901w.webp"
          srcSet="/images/opt/background-480w.webp 480w, /images/opt/background-640w.webp 640w, /images/opt/background-768w.webp 768w, /images/opt/background-901w.webp 901w"
        sizes="100vw"
        width={901}
        height={1600}
        alt=""
        /*
         * NOT `fetchPriority="high"`, which is where this started. Measured:
         * with the backdrop promoted, Lighthouse mobile scored 90 with an LCP
         * of 3.6s, because a 100 KiB decorative image was jumping the queue
         * ahead of six font files and the two JS chunks — and it is not even
         * the LCP element (`envelope-front.webp` is). It is in the initial
         * HTML, so the preload scanner finds it regardless and the browser
         * raises it to High on its own once layout proves it is in-viewport;
         * the only thing the attribute changed was who it starved.
         */
        className="h-full w-full object-cover object-top"
      />
      {/* The single cream veil — see `--page-veil` in globals.css. */}
      <div className="page-veil absolute inset-0 bg-surface" />
    </div>
  );
}
