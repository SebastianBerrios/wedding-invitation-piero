/**
 * A single 220x220 `feTurbulence` tile, pre-rendered once and inlined as a
 * data URI, then repeated as a CSS background (design §9). This is
 * deliberately NOT a viewport-sized live SVG filter — that would repaint on
 * every scroll composite and is measurably janky on mid-range mobile.
 *
 * Wired at the page root (`layout.tsx`, work unit 8b) as a `fixed`
 * viewport-covering overlay — `fixed` always spans exactly the viewport
 * regardless of the document's scrollable height, with no positioned-
 * ancestor sizing required (unlike `absolute`).
 */
const GRAIN_TILE =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='220' height='220'%3E%3Cfilter id='g'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='220' height='220' filter='url(%23g)'/%3E%3C/svg%3E\")";

export function GrainOverlay({ className }: { className?: string }) {
  return (
    <div
      aria-hidden="true"
      // 0.075, up from 0.055 (VISUAL RESTYLE pass, target item 1): the
      // reference shows a VISIBLE cold-pressed tooth, and at 0.055 over the
      // new floral washes the grain had stopped registering at all. Held down
      // to 0.075 rather than pushed further because `mix-blend-mode: multiply`
      // with a grayscale tile darkens all channels equally and therefore
      // desaturates the warm florals underneath — the gray-cast failure mode
      // this whole layer exists to avoid.
      className={`pointer-events-none fixed inset-0 opacity-[0.075] mix-blend-multiply ${className ?? ""}`}
      style={{
        backgroundImage: GRAIN_TILE,
        backgroundSize: "220px 220px",
      }}
    />
  );
}
