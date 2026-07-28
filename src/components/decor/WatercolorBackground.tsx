/**
 * Backdrop wash (design §9, work unit 8b; corrective redesign — Defect 4).
 *
 * The original recipe layered two `feDisplacementMap`-distorted ellipses on
 * top of the CSS gradient to fake watercolor petals. At real viewport sizes
 * they read as two gray-brown blurry smudges in the corners, not botanical
 * watercolor — the filter distortion plus the olive/gold color-mix tones
 * produced a "stain", not a soft floral silhouette.
 *
 * Decision (documented, not silent): DELETE the SVG bleed layer rather than
 * try to make it read as petals. A restrained, warm paper backdrop is a
 * better fidelity trade than a "smudge" — and the seven sections already
 * carry the actual botanical detail via `Sprig`. What remains is exactly
 * the CSS-gradient half of the original recipe (cheap, GPU-only, no live
 * filter), retuned: lower intensity, warmer (near-white/cream) corner
 * washes instead of olive/gold-heavy ones, so there is no gray cast.
 * `GrainOverlay` (mounted separately in `layout.tsx`) supplies the paper
 * texture on top.
 */
export function WatercolorBackground() {
  return (
    <div
      aria-hidden="true"
      className="watercolor pointer-events-none fixed inset-0 -z-10"
    />
  );
}
