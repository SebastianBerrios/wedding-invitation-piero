/**
 * A framed sheet of paper laid over the dark olive section ground — the surface
 * the reference uses for the venue details and for the itinerary.
 *
 * The paper is `sheet-two.png`, consumed as a `border-image` 9-slice so the
 * embossed frame survives at any panel aspect ratio. All the geometry, the
 * measured frame insets and the reason a 9-slice beats a stretched background
 * live with the CSS, in `.paper-panel` in `globals.css` — read that before
 * changing any of this.
 *
 * `frame` sets `--panel-frame`, the rendered thickness of the frame slice.
 * It defaults to the source's own proportion (52 of 584 px = 8.9% of the panel's
 * width, in `cqi` against the wrapper) which is right for a portrait panel. A
 * landscape panel is two to three times wider than it is tall and must override
 * it, or the same percentage grows an absurd border.
 *
 * The wrapper exists to own `container-type: inline-size`: a container may not
 * resolve its own container query units, so the panel and the container it
 * measures against have to be two elements. Same pattern as
 * `.envelope-frame` / `.envelope`.
 *
 * Decorative by construction: the paper is a CSS border image, so it is not in
 * the accessibility tree at all and needs no `aria-hidden` — the children are
 * the content.
 */
export function PaperPanel({
  children,
  className = "",
  frameClassName = "",
  frame,
}: {
  children: React.ReactNode;
  /** Utilities for the panel itself (padding, width, layout). */
  className?: string;
  /** Utilities for the container-query wrapper (width, alignment). */
  frameClassName?: string;
  /** Any CSS length, e.g. `"8.9cqi"` or `"clamp(11px, 3.2cqi, 22px)"`. */
  frame?: string;
}) {
  return (
    <div className={`paper-panel-frame ${frameClassName}`}>
      <div
        className={`paper-panel ${className}`}
        style={frame ? { "--panel-frame": frame } as React.CSSProperties : undefined}
      >
        {children}
      </div>
    </div>
  );
}
