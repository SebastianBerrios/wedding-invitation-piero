/**
 * Self-authored watercolor floral backdrop (design §9, work unit 8b):
 * layered CSS radial gradients (`.watercolor`, globals.css — cheap,
 * GPU-friendly) plus two bounded `feDisplacementMap` "bleed" ellipses
 * confined to opposite corners.
 *
 * Deliberately NOT a viewport-sized live SVG filter — that repaints on
 * every scroll composite and is measurably janky on mid-range mobile (see
 * design's rejected alternatives). The filter's `x`/`y`/`width`/`height`
 * bound it to each ellipse's own ~440px box, not the whole viewport.
 *
 * `position: fixed` covers the viewport regardless of document scroll
 * height, with no positioned-ancestor sizing gymnastics required.
 */
export function WatercolorBackground() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
    >
      <div className="watercolor absolute inset-0" />
      <svg
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        focusable="false"
      >
        <defs>
          <filter
            id="watercolor-bleed"
            x="-20%"
            y="-20%"
            width="140%"
            height="140%"
          >
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.012 0.02"
              numOctaves="3"
              seed="7"
              result="n"
            />
            <feDisplacementMap
              in="SourceGraphic"
              in2="n"
              scale="18"
              xChannelSelector="R"
              yChannelSelector="G"
            />
            <feGaussianBlur stdDeviation="26" />
          </filter>
        </defs>
        {/*
          Percentage-based (not fixed px) so the ellipses scale with the
          viewport and stay geometrically inside it at every width — a
          fixed-px radius large enough to look like a "bleed" at 1440px
          would extend past the edge at 320px.
        */}
        <ellipse
          cx="16%"
          cy="14%"
          rx="14%"
          ry="12%"
          fill="var(--color-rule)"
          opacity="0.35"
          filter="url(#watercolor-bleed)"
        />
        <ellipse
          cx="84%"
          cy="86%"
          rx="14%"
          ry="12%"
          fill="var(--color-body)"
          opacity="0.22"
          filter="url(#watercolor-bleed)"
        />
      </svg>
    </div>
  );
}
