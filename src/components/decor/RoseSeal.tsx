/**
 * White-rose rosette used as the envelope's closure (VISUAL RESTYLE pass,
 * target item 4). Replaces the gold wax disc: the reference closes its
 * envelope with a pale rose at the flap tip, not a seal.
 *
 * Construction is three concentric rings of the SAME petal path at
 * decreasing scale, each ring rotated off its neighbour so the petals
 * interleave into a spiral rather than stacking into spokes — the read is a
 * rose seen from directly above. Fills are ivory (`--color-surface` through
 * `--color-surface-warm`); `--color-rule` appears only as a hairline `stroke`,
 * which is the one legal use for it (contrast rule R3: gold never on text, and
 * this whole SVG is `aria-hidden` decoration anyway).
 *
 * The soft shadow is a CSS `drop-shadow()` on the wrapper rather than an SVG
 * `feDropShadow`, so the filter surface is the ~40px badge instead of an SVG
 * filter region the browser has to allocate and rasterize separately.
 */

/** One rounded rose petal, base at the local origin, tip at (0,-52). */
const PETAL =
  "M0 0C-17-5-27-22-21-38-16-49-6-55 0-57 6-55 16-49 21-38 27-22 17-5 0 0Z";

/** `[petalCount, scale, rotationOffset, fillId]` outermost ring first. */
const RINGS: readonly (readonly [number, number, number, "outer" | "inner"])[] =
  [
    [8, 1, 0, "outer"],
    [7, 0.72, 25, "outer"],
    [5, 0.46, 50, "inner"],
  ];

export function RoseSeal({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="-64 -64 128 128"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Petals catch light at the tip and fall into shadow at the base,
            which is what stops eight identical ivory shapes reading as a
            flat white star. */}
        <linearGradient id="rose-outer" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#fffdf7" />
          <stop offset="100%" stopColor="var(--color-surface-warm)" />
        </linearGradient>
        <linearGradient id="rose-inner" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-surface)" />
          <stop
            offset="100%"
            stopColor="color-mix(in oklab, var(--color-surface-warm) 82%, var(--color-rule))"
          />
        </linearGradient>
        <path id="rose-petal" d={PETAL} />
      </defs>

      {/* the shaded well the petals sit in */}
      <circle
        r="58"
        fill="url(#rose-outer)"
        stroke="var(--color-rule)"
        strokeOpacity="0.35"
        strokeWidth="1"
      />

      {RINGS.map(([count, scale, offset, fill], r) =>
        Array.from({ length: count }, (_, p) => (
          <use
            key={`${r}-${p}`}
            href="#rose-petal"
            fill={`url(#rose-${fill})`}
            stroke="var(--color-rule)"
            strokeOpacity="0.55"
            strokeWidth={(1.1 / scale).toFixed(2)}
            transform={`rotate(${(p * (360 / count) + offset).toFixed(1)}) scale(${scale})`}
          />
        )),
      )}

      {/* the furled heart */}
      <circle
        r="7"
        fill="url(#rose-inner)"
        stroke="var(--color-rule)"
        strokeOpacity="0.5"
        strokeWidth="1"
      />
    </svg>
  );
}
