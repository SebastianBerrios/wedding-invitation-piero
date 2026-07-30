/**
 * Backdrop: large-scale watercolor floral over warm paper (design §9, work
 * unit 8b; VISUAL RESTYLE pass — target item 1).
 *
 * ## History (read before "improving" this)
 *
 * The FIRST attempt at a floral layer used two `feDisplacementMap`-distorted
 * ellipses. It read as two gray-brown blurry smudges in the corners and was
 * DELETED. The pass after that shipped only CSS corner washes, which read as
 * near-flat cream — no floral at all. This version is the third attempt and
 * targets the two failure modes explicitly:
 *
 *  - **Gray cast** — the smudge version mixed olive/gold at 20-26% into a
 *    neutral blur, which desaturates toward gray. Here every pigment stop is
 *    `var(--color-rule)` (#bcb096, warm greige) or a warm olive mix of
 *    `--color-body` INTO `--color-rule`. There is no neutral gray anywhere,
 *    and nothing is mixed toward gray or black.
 *  - **Small scale + hard edges** — the smudges were corner-sized. Here each
 *    flower head is 300-420 units across in a 1000x1500 canvas painted with
 *    `preserveAspectRatio="xMidYMid slice"`, which puts a single bloom at
 *    roughly 30-60% of the viewport's width at every breakpoint. Edges are
 *    feathered by the fill itself: every gradient's outermost stop is
 *    `stop-opacity="0"`, so the path silhouette lands where alpha is already
 *    ~0 and no cut edge is visible.
 *
 * ## Why an inline SVG and not a filtered background-image
 *
 * A live `feTurbulence`/`feDisplacementMap` filter across a full-viewport
 * element is a mobile paint killer, and an SVG *background-image* does not
 * bound that cost either — Chrome rasterizes SVG images at their painted
 * destination size, so "author it small and scale it up" does not actually
 * shrink the filter surface. So this layer contains **no filter at all**: it
 * is gradient-filled bezier paths, which the compositor handles as ordinary
 * geometry. The mottled watercolor granulation a filter would have provided
 * comes instead from two SMALL repeated noise tiles (`.watercolor-mottle` in
 * globals.css and `GrainOverlay`), each rasterized once at tile size and then
 * repeated for free — the technique design §9 already specified for grain.
 *
 * ## Layering
 *
 * `WatercolorBackground` is `fixed`, so the same artwork sits behind every
 * section and the page reads as ONE sheet of paper rather than seven panels.
 * The hero mounts a second, stronger instance (`intensity="hero"`), which is
 * what makes the floral prominent up top and subtler further down.
 *
 * Purely decorative: `aria-hidden`, `pointer-events-none`, zero text. Both
 * instances namespace their gradient/path ids by intensity, so mounting two
 * of them never produces a duplicate `id` in the document.
 */

/**
 * Two rose petals, base at the local origin, tip near (0,-212). Both are
 * deliberately ASYMMETRIC (the left and right flanks use different control
 * points) and the second carries a curled outer edge — iteration 1 used one
 * mirror-symmetric petal repeated at exact 60 degree steps, and the result
 * read as a flat geometric daisy, not a bloom. Alternating two asymmetric
 * shapes plus per-petal jitter is what breaks the mechanical rosette.
 * Coordinates are whole units (`rendering-svg-precision`).
 */
const PETALS = [
  "M0 0C-52-14-86-70-66-134-50-186-14-208 4-214 24-206 50-174 62-126 78-64 42-14 0 0Z",
  "M0 0C-44-22-82-64-72-126-64-176-30-202-6-212 18-208 44-182 58-140 76-84 50-22 0 0Z",
] as const;

/**
 * Lanceolate leaf, base at the local origin, tip at (188,-70). The midline is
 * an S-curve (the upper flank bows out early, the lower flank late), which is
 * what separates a leaf from the symmetric lens shape iteration 2 produced —
 * those read as stray petals lying on the paper.
 */
const LEAF = "M0 0C34-40 104-78 188-70 142-18 66 14 0 0Z";

/**
 * Deterministic jitter table. A bouquet has no two identical petals, but a
 * server component must render byte-identically on every build — so the
 * "randomness" is a fixed, hand-picked sequence indexed by petal, never
 * `Math.random()` (which would also break hydration).
 * Each entry is [degrees of rotation offset, scale multiplier].
 */
const JITTER: readonly (readonly [number, number])[] = [
  [-7, 1.04],
  [5, 0.93],
  [-3, 1.09],
  [9, 0.97],
  [-11, 1.01],
  [2, 1.06],
  [7, 0.9],
  [-5, 1.03],
  [11, 0.95],
  [-9, 1.07],
  [4, 0.99],
];

/**
 * Concentric petal rings, outer to inner. Iteration 1 drew ONE ring, which is
 * what made each bloom read as a daisy silhouette; a cabbage rose is a MASS of
 * overlapping petals whose density rises toward the heart.
 * `[petalCount, ringScale, ringRotationOffset]`.
 */
const RINGS: readonly (readonly [number, number, number])[] = [
  [9, 1.0, 0],
  [8, 0.8, 24],
  [6, 0.58, 48],
];

type BloomSpec = {
  cx: number;
  cy: number;
  scale: number;
  rotate: number;
};
type LeafSpec = { cx: number; cy: number; scale: number; rotate: number };

/**
 * The bouquet composition, authored once. Deliberately asymmetric, with the
 * three largest blooms cropped by the canvas edge — a real bouquet continues
 * past the frame.
 */
const BLOOMS: readonly BloomSpec[] = [
  { cx: 110, cy: 185, scale: 1.02, rotate: 12 },
  { cx: 930, cy: 600, scale: 0.94, rotate: 28 },
  { cx: 300, cy: 1265, scale: 1.08, rotate: -18 },
  { cx: 660, cy: 300, scale: 0.52, rotate: 44 },
  { cx: 120, cy: 800, scale: 0.56, rotate: -32 },
  { cx: 775, cy: 1145, scale: 0.62, rotate: 16 },
  { cx: 465, cy: 905, scale: 0.38, rotate: -8 },
  // iteration 4: the composition had readable blooms but visible empty
  // stretches, so it read as "scattered flowers" rather than the reference's
  // continuous floral wallpaper. These four fill the gaps and, more
  // importantly, OVERLAP their neighbours.
  { cx: 430, cy: 525, scale: 0.72, rotate: 22 },
  { cx: 985, cy: 175, scale: 0.74, rotate: -24 },
  { cx: 20, cy: 1015, scale: 0.5, rotate: -50 },
  { cx: 625, cy: 1405, scale: 0.6, rotate: 34 },
];

const LEAVES: readonly LeafSpec[] = [
  { cx: 40, cy: 470, scale: 1.5, rotate: -38 },
  { cx: 760, cy: 120, scale: 1.35, rotate: 148 },
  { cx: 980, cy: 980, scale: 1.6, rotate: 168 },
  { cx: 560, cy: 1440, scale: 1.45, rotate: -104 },
  { cx: 120, cy: 1060, scale: 1.2, rotate: -14 },
  { cx: 620, cy: 640, scale: 1.05, rotate: 38 },
  { cx: 330, cy: 40, scale: 1.15, rotate: 62 },
  { cx: 880, cy: 1330, scale: 1.3, rotate: -152 },
  { cx: 250, cy: 690, scale: 1.25, rotate: -66 },
  { cx: 1000, cy: 430, scale: 1.4, rotate: 122 },
  { cx: 420, cy: 1080, scale: 1.15, rotate: 8 },
  { cx: 700, cy: 830, scale: 1.3, rotate: -128 },
];

const HAZE: readonly { cx: number; cy: number; rx: number; ry: number }[] = [
  { cx: 140, cy: 240, rx: 520, ry: 440 },
  { cx: 920, cy: 700, rx: 480, ry: 520 },
  { cx: 300, cy: 1290, rx: 560, ry: 420 },
];

/**
 * Watercolor pigment. `--color-rule` (#bcb096) is the palette's warm greige,
 * but it is only ~21% saturated, so at the low alphas this layer needs it
 * reads TAUPE-GRAY over cream — the precise failure ("two gray-brown blurry
 * smudges") that got an earlier attempt deleted. Pulling it toward
 * `--color-surface-warm` (#f7efdd, ~55% saturated, same 42-44 degree hue
 * family) raises chroma while staying inside the palette and never
 * approaching neutral. `PIGMENT_DEEP` adds a little `--color-body` for the
 * denser pooled areas — again a WARM olive, never a gray.
 */
const PIGMENT =
  "color-mix(in oklab, var(--color-rule) 62%, var(--color-surface-warm))";
const PIGMENT_DEEP =
  "color-mix(in oklab, var(--color-rule) 74%, var(--color-body))";

export type FloralIntensity = "page" | "hero";

/**
 * The floral artwork. `intensity` changes only the layer opacity and the id
 * namespace — same canvas, same paths, so the page-wide and hero instances
 * register as one continuous sheet.
 */
export function WatercolorFloral({
  intensity = "page",
  className,
}: {
  intensity?: FloralIntensity;
  className?: string;
}) {
  const ns = intensity === "hero" ? "wch" : "wcp";
  const wash = `${ns}-wash`;
  const pool = `${ns}-pool`;
  const foliage = `${ns}-foliage`;
  const haze = `${ns}-haze`;
  const petal = `${ns}-petal`;
  const leaf = `${ns}-leaf`;
  const soften = `${ns}-soften`;

  return (
    <svg
      className={className}
      viewBox="0 0 1000 1500"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Petal body: warm greige pigment fading to fully transparent BEFORE
            the path edge, so the silhouette has no visible cut.
            `PIGMENT`/`PIGMENT_DEEP` are `--color-rule` pulled TOWARD
            `--color-surface-warm` (iteration 2): raw `--color-rule` is only
            21% saturated, and at these low alphas over cream it read taupe-
            gray — the exact failure mode a previous pass was sent back for.
            `--color-surface-warm` is the most saturated warm token we have
            (55%), so mixing toward it raises chroma without inventing a hue
            outside the palette, and never approaches neutral. */}
        {/* The petal's local bbox runs from the TIP (y-min, `cy: 0%`) to the
            BASE at the bloom centre (y-max, `cy: 100%`). Iteration 2 pooled
            the pigment near the base, so all ~26 petals of a bloom stacked
            their densest alpha on the same point and every bloom grew a dark
            grey-brown hub with visible radiating spokes — a spirograph, not a
            flower. Density now sits at `cy: 32%`, out toward the petal edge
            (which is also where pigment actually pools in a wet wash), and
            alpha reaches 0 at the base, so overlapping petals no longer
            compound into a hub. */}
        <radialGradient id={wash} cx="50%" cy="32%" r="74%">
          <stop offset="0%" stopColor={PIGMENT} stopOpacity="0.3" />
          <stop offset="50%" stopColor={PIGMENT} stopOpacity="0.2" />
          <stop offset="84%" stopColor={PIGMENT} stopOpacity="0.06" />
          <stop offset="100%" stopColor={PIGMENT} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={pool} cx="50%" cy="38%" r="70%">
          <stop offset="0%" stopColor={PIGMENT_DEEP} stopOpacity="0.22" />
          <stop offset="58%" stopColor={PIGMENT_DEEP} stopOpacity="0.1" />
          <stop offset="88%" stopColor={PIGMENT_DEEP} stopOpacity="0.03" />
          <stop offset="100%" stopColor={PIGMENT_DEEP} stopOpacity="0" />
        </radialGradient>
        {/* Foliage: a WARM olive — `--color-body` mixed INTO `--color-rule`,
            never toward neutral, so leaves never introduce a gray cast. */}
        <radialGradient id={foliage} cx="26%" cy="52%" r="86%">
          <stop
            offset="0%"
            stopColor="color-mix(in oklab, var(--color-body) 40%, var(--color-surface-warm))"
            stopOpacity="0.26"
          />
          <stop
            offset="62%"
            stopColor="color-mix(in oklab, var(--color-body) 24%, var(--color-surface-warm))"
            stopOpacity="0.11"
          />
          <stop offset="88%" stopColor={PIGMENT} stopOpacity="0.02" />
          <stop offset="100%" stopColor={PIGMENT} stopOpacity="0" />
        </radialGradient>
        {/* Atmospheric haze behind everything — the out-of-focus depth the
            reference gets from lens blur. */}
        <radialGradient id={haze} cx="50%" cy="50%" r="50%">
          <stop
            offset="0%"
            stopColor="var(--color-surface-warm)"
            stopOpacity="0.9"
          />
          <stop offset="58%" stopColor={PIGMENT} stopOpacity="0.13" />
          <stop offset="100%" stopColor={PIGMENT} stopOpacity="0" />
        </radialGradient>

        {/*
          Out-of-focus softening. Iteration 3 relied on the fills alone to
          feather the petals, and it did not work: a `radialGradient` domain is
          an ellipse and a petal outline is not, so wherever the path boundary
          fell INSIDE the still-opaque part of the gradient there was a crisp
          cut. The result read as a stack of translucent vellum cut-outs, not
          as blurred flowers. Only a real blur removes a silhouette.

          Cost is bounded three ways, and was measured (Lighthouse mobile x3,
          see the apply-progress entry) rather than assumed:
            - blur ONLY, no `feTurbulence`/`feDisplacementMap`. Gaussian blur
              is a 3-pass separable approximation; turbulence is per-pixel
              Perlin noise and is what makes full-viewport filters unusable on
              mid-range Android. The mottled granulation comes from the small
              repeated `.watercolor-mottle` tile instead.
            - the filter region is clipped to the SVG viewport, and both
              instances are static: the `fixed` page layer never repaints on
              scroll, and the hero layer is painted once.
            - `color-interpolation-filters="sRGB"` skips the linearRGB
              conversion Chrome would otherwise do on every channel.
        */}
        <filter
          id={soften}
          x="-8%"
          y="-6%"
          width="116%"
          height="112%"
          colorInterpolationFilters="sRGB"
        >
          {/*
            4 user units, NOT more. The canvas is painted at roughly 1.4x on a
            1440px viewport, so this is ~6 device px against a ~170px-wide
            petal — enough to erase the sub-0.06-alpha step at a path boundary
            while leaving the petal structure legible. The first attempt used
            15 and destroyed it: the blooms dissolved into formless masses,
            which is precisely the "blurry smudges" result a previous pass was
            sent back for. Structure first, softness second.
          */}
          <feGaussianBlur stdDeviation="4" />
        </filter>

        {PETALS.map((d, i) => (
          <path key={i} id={`${petal}-${i}`} d={d} />
        ))}
        <path id={leaf} d={LEAF} />
      </defs>

      <g
        filter={`url(#${soften})`}
        opacity={intensity === "hero" ? 0.9 : 0.52}
      >
        {/* haze first — big, formless, warm */}
        {HAZE.map((h, i) => (
          <ellipse key={i} {...h} fill={`url(#${haze})`} />
        ))}

        {/* foliage sits UNDER the blooms, as it does in a real bouquet */}
        {LEAVES.map((l, i) => (
          <use
            key={i}
            href={`#${leaf}`}
            fill={`url(#${foliage})`}
            transform={`translate(${l.cx} ${l.cy}) rotate(${l.rotate}) scale(${l.scale})`}
          />
        ))}

        {BLOOMS.map((b, i) => (
          <g
            key={i}
            transform={`translate(${b.cx} ${b.cy}) rotate(${b.rotate}) scale(${b.scale})`}
          >
            {RINGS.map(([count, ringScale, ringRotate], r) =>
              Array.from({ length: count }, (_, p) => {
                const [dr, ds] = JITTER[(i * 7 + r * 5 + p * 3) % JITTER.length];
                const angle = (p * (360 / count) + ringRotate + dr).toFixed(1);
                const s = (ringScale * ds).toFixed(3);
                return (
                  <use
                    key={`${r}-${p}`}
                    href={`#${petal}-${(i + r + p) % PETALS.length}`}
                    fill={`url(#${r < 2 ? wash : pool})`}
                    transform={`rotate(${angle}) scale(${s})`}
                  />
                );
              }),
            )}
          </g>
        ))}
      </g>
    </svg>
  );
}

/**
 * Page-wide backdrop: the warm paper gradient (`.watercolor`), the floral at
 * page intensity, and the coarse cold-pressed mottle (`.watercolor-mottle`).
 * Fine grain is a separate overlay mounted ABOVE the content in `layout.tsx`.
 */
export function WatercolorBackground() {
  return (
    <div
      aria-hidden="true"
      className="watercolor pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <WatercolorFloral className="absolute inset-0 h-full w-full" />
      <div className="watercolor-mottle absolute inset-0" />
    </div>
  );
}
