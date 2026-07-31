/* eslint-disable @next/next/no-img-element --
 * See PageBackground.tsx: every raster here is served straight from `public/`,
 * already optimised by `scripts/optimize-images.mjs`, so `/_next/image` would
 * only re-encode it at a quality this project did not choose.
 */

import type { PhotoConfig } from "@/config/invitation.types";

/**
 * Renders a photograph's frame ONLY when the couple has actually supplied one.
 *
 * ## Why this component exists
 *
 * The reference layout contains photographs this project does not have and must
 * not invent: three full-width portraits of the couple and one oval view of each
 * venue. The instruction was explicit — no grey boxes, no "image here"
 * placeholders, no stock substitutes. So every photo slot is an OPTIONAL config
 * field (`PhotoConfig`), this component returns `null` when it is absent, and the
 * surrounding layout is designed to read as finished either way. The day the
 * couple drops a file in and adds a `src`, the frame appears with no code change.
 *
 * ## Why the frame reserves space with `aspect-ratio` instead of `width`/`height`
 *
 * A future file's intrinsic dimensions are unknowable from here, and declaring a
 * made-up `width`/`height` would be a lie that produces the very layout shift the
 * attributes exist to prevent. Instead the WRAPPER carries a fixed
 * `aspect-ratio`, so it reserves its box during layout, and the `<img>` is
 * absolutely positioned inside it with `object-cover` — an out-of-flow image
 * cannot shift anything, whatever it turns out to be. CLS stays 0 by
 * construction rather than by bookkeeping.
 *
 * These are CONTENT images: `alt` comes from config and the validator rejects a
 * blank one. That is the opposite rule from the decorative assets (the doily, the
 * sprig, the divider, the paper), which carry an empty `alt` and `aria-hidden`.
 */
const VARIANTS = {
  /**
   * The venue view inside the paper panel: an oval, desaturated, as the
   * reference renders it. `rounded-[50%]` on a 5:3 box is the ellipse.
   */
  oval: {
    wrapper: "relative w-[68%] overflow-hidden rounded-[50%] aspect-[5/3]",
    image: "absolute inset-0 h-full w-full object-cover grayscale",
  },
  /**
   * A full-bleed portrait of the couple between blocks. Full section width, no
   * frame and no rounding — the reference lets these run edge to edge.
   */
  interlude: {
    wrapper: "relative w-full overflow-hidden aspect-[4/5] sm:aspect-[3/2]",
    image: "absolute inset-0 h-full w-full object-cover",
  },
} as const;

export function OptionalPhoto({
  photo,
  variant,
  className = "",
}: {
  photo: PhotoConfig | undefined;
  variant: keyof typeof VARIANTS;
  className?: string;
}) {
  if (!photo) {
    return null;
  }
  const { wrapper, image } = VARIANTS[variant];
  return (
    <div className={`${wrapper} ${className}`}>
      <img
        src={photo.src}
        alt={photo.alt}
        loading="lazy"
        decoding="async"
        className={image}
      />
    </div>
  );
}
