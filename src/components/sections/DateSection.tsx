/* eslint-disable @next/next/no-img-element --
 * See PageBackground.tsx: these rasters are already the optimised output of
 * `scripts/optimize-images.mjs`, so `/_next/image` would re-encode an
 * already-lossy WebP at a quality this project did not choose.
 */

import { invitationConfig } from "@/config/invitation";

/**
 * Section 3 of 7 — the first DARK OLIVE section.
 *
 * The reference centres a lace doily heart on the olive ground and sets the date
 * INSIDE it: the month in serif small caps, the day as one large decorative
 * numeral, the year in spaced serif. A botanical sprig overlaps the heart's
 * lower-LEFT and deliberately breaks its outline, so the doily reads as an object
 * lying on the page rather than as a pasted-in graphic.
 *
 * ## Geometry
 *
 * `heart.webp` is cropped to the doily's own alpha bounds (738 x 649, aspect
 * 1.13713 — the heart is WIDER than it is tall), so the element's box IS the
 * doily's box and every inset below is honest.
 *
 * Measured off the source's alpha channel, the doily's flat inner field — inside
 * the scalloped lace and inside the embossed inner heart outline — spans roughly
 * x 17.5%..82.5% and y 13%..80% of that box. The date block is therefore capped
 * at 58% of the width and centred at 44% of the height: high enough that the
 * year clears the heart's lower point, low enough that the month clears the
 * cleft between the two lobes.
 *
 * `.date-numeral` sizes the day in `cqi` against the doily itself, not in `vw`,
 * so the numeral stays a fixed share of the heart it lives in even after the
 * heart hits its desktop `max-width` cap. See globals.css.
 *
 * ## Accessibility
 *
 * The visual layout fragments the date across three independently-styled lines,
 * so one `sr-only` `h2` carries the whole composite date (including the weekday
 * and the time, which the reference does not print here — they appear on the
 * venue panel and in the itinerary) and every visual fragment is `aria-hidden`.
 * Announcing both would read the date twice, out of order.
 *
 * The doily and the sprig are decoration: empty `alt`, `aria-hidden`, and
 * `loading="lazy"` because this section is always below the fold.
 */
export function DateSection() {
  const { display } = invitationConfig.event;
  const fullDateLabel = `${display.weekday}, ${display.day} de ${display.month} de ${display.year} · ${display.time}`;

  return (
    <section
      id="date"
      aria-labelledby="date-heading"
      className="bg-surface-dark"
    >
      <div className="mx-auto flex max-w-xl justify-center px-gutter py-section">
        <h2 id="date-heading" className="sr-only">
          {fullDateLabel}
        </h2>

        {/*
          `container-type: inline-size` via `.date-doily` is what `.date-numeral`
          measures against; the wrapper also anchors both the sprig and the date
          block, so all three share one coordinate system.
        */}
        <div className="date-doily relative w-full max-w-[30rem] [container-type:inline-size]">
          <img
            src="/images/opt/heart-738w.webp"
            srcSet="/images/opt/heart-420w.webp 420w, /images/opt/heart-600w.webp 600w, /images/opt/heart-640w.webp 640w, /images/opt/heart-738w.webp 738w"
            /*
             * `88vw`, NOT `calc(100vw - 2 * var(--spacing-gutter))`, which is what
             * this said first and is a real bug: `sizes` is read by the preload
             * scanner before any stylesheet is applied, so it cannot resolve a
             * custom property. The declaration was invalid, the browser silently
             * fell back to `100vw`, and Lighthouse's 412px/DPR-1.75 phone therefore
             * fetched the 738w file (48.7 KiB) instead of the 640w one. 88vw is the
             * measured equivalent of the gutter arithmetic at every width the
             * clamp'd gutter can produce, and the doily is capped at 30rem above
             * 36rem where the first branch takes over.
             */
            sizes="(min-width: 36rem) 30rem, 88vw"
            width={738}
            height={649}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="h-auto w-full select-none"
          />

          {/*
            The sprig, overlapping the doily's lower-left and breaking its
            outline.

            The -52deg rotation lives in `scripts/optimize-images.mjs`, NOT in a
            CSS `-rotate-[52deg]` here. That was tried and reverted: a transform
            leaves the layout box alone but changes `getBoundingClientRect()`, and
            the rotated box of this element measured 53px OUTSIDE the left edge of
            a 390px viewport while its visible ink stayed well inside — a real
            edge-crossing element as far as `audit.mjs` is concerned, and not
            fixable by repositioning without dragging the sprig off the doily.
            The derivative is therefore already rotated and re-cropped to the
            rotated ink's own bounds (604 x 385, aspect 1.56883), so this element
            is axis-aligned and its box is its ink.
          */}
          <img
            src="/images/opt/flowers.webp"
            // The rotated derivative's own size, printed by the pipeline.
            width={300}
            height={191}
            alt=""
            aria-hidden="true"
            loading="lazy"
            decoding="async"
            className="pointer-events-none absolute bottom-[7%] left-[5%] w-[58%] select-none"
          />

          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[44%] flex w-[58%] -translate-x-1/2 -translate-y-1/2 flex-col items-center text-ink"
          >
            <p className="font-caps text-lg uppercase tracking-caps lg:text-xl">
              {display.month}
            </p>
            <p className="date-numeral font-script">{display.day}</p>
            <p className="font-serif text-base tracking-[0.35em] lg:text-lg">
              {display.year}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
