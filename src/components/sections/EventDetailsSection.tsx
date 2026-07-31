import { invitationConfig } from "@/config/invitation";
import { PaperPanel } from "@/components/decor/PaperPanel";
import { AssetSlot } from "@/components/ui/AssetSlot";

/**
 * Section 5 of 7 — the second DARK OLIVE section, and the one the reference
 * builds entirely out of paper panels.
 *
 * ## Structure, following the reference exactly
 *
 * ONE tall portrait panel holds BOTH venues stacked inside it — not two side-by-
 * side cards, which is what this section used to render. Inside each venue, in
 * order: the label in serif small caps, an oval desaturated photograph, the venue
 * name in the SCRIPT face, the address in serif, then a rectangular BORDERED
 * button reading "Ver ubicación".
 *
 * Below that panel, a separate WIDE LANDSCAPE panel holds the itinerary: the
 * title in script, then the rows laid out as COLUMNS side by side (time above
 * label) rather than as a vertical list.
 *
 * Both panels are the same `sheet-two.png` 9-slice — see `.paper-panel` in
 * globals.css for why one source image serves both aspect ratios undistorted.
 *
 * ## "Ver ubicación" is a bordered button that is still a link
 *
 * It looks like a button because the reference draws a rectangle around it. It
 * stays an `<a>` because it NAVIGATES — to the guest's own maps app, in a new
 * tab. Turning a navigation into a `<button>` to match a border would break
 * middle-click, "copy link", and the screen-reader announcement that this leaves
 * the page. `min-h-11` keeps the 44px tap target the previous version had.
 *
 * ## Contrast
 *
 * Every text node in this section sits on a panel, i.e. on the paper's cream
 * ground (`--color-ink` at 18:1, `--color-body` at 7.3:1). Nothing is painted
 * directly on the olive: `--color-ink` on `--color-surface-dark` measures 1.72:1
 * and would be unreadable. The section's own `h2` is therefore `sr-only` — the
 * reference prints no heading here either, and inventing a cream one would add an
 * element the reference does not have.
 *
 * ## Placeholder tone differs WITHIN this one section
 *
 * The venue photos and the itinerary icons sit INSIDE a `PaperPanel`, i.e. on
 * top of `panel.webp`'s paper (a warm cream, the same ground as every other
 * text in this section) — `--color-surface` behind it is a fallback for a
 * failed image load, never the visible ground — so those placeholders use
 * `tone="on-cream"`, exactly like the venue name/address text next to them.
 * Measured: `tone="on-olive"` there produced a real WCAG AA failure
 * (`text-surface` at 1:1 against the paper's actual cream), caught by
 * `audit.mjs`'s `resolveBg`.
 *
 * `eventDetails.photo`, by contrast, sits OUTSIDE both panels, directly on
 * `bg-surface-dark` — no paper behind it — so it correctly uses
 * `tone="on-olive"` (confirmed at 7.28:1 by the same script).
 */
/**
 * Both the config PATH and the drop-in FILE for a venue photo, keyed by
 * `venue.kind` (which is "ceremony" or "civil" — the config OBJECT key for
 * the second venue is "reception", so the config path differs from `kind`).
 */
const VENUE_PHOTO: Record<string, { slotPath: string; filePath: string }> = {
  ceremony: {
    slotPath: "venues.ceremony.photo",
    filePath: "public/images/venue-church.png",
  },
  civil: {
    slotPath: "venues.reception.photo",
    filePath: "public/images/venue-civil.png",
  },
};

export function EventDetailsSection() {
  const { venues, itinerary, eventDetails } = invitationConfig;
  const venueList = [venues.ceremony, venues.reception];

  return (
    <section
      id="event-details"
      aria-labelledby="event-details-heading"
      className="bg-surface-dark"
    >
      <div className="mx-auto flex max-w-3xl flex-col items-center gap-12 px-gutter py-section lg:max-w-4xl lg:gap-16">
        <h2 id="event-details-heading" className="sr-only">
          {eventDetails.heading}
        </h2>

        {/*
          The venue panel. Portrait, so it keeps `--panel-frame`'s default — the
          source's own 52/584 = 8.9% proportion.

          `max-w-[20rem]` on a phone rather than `max-w-sm`: the reference's panel
          leaves a clear olive margin on both sides (measured at 63% of its
          viewport) and ours was filling 88%. The horizontal padding drops to
          `1cqi` at the same time, so the CONTENT box keeps the ~260px it needs for
          a parish name this long — the panel gets narrower without the type
          getting tighter.
        */}
        <PaperPanel
          frameClassName="w-full max-w-[20rem] sm:max-w-sm"
          className="flex flex-col items-center gap-10 px-[1cqi] py-[5cqi] text-center"
        >
          {venueList.map((venue) => (
            <article
              key={venue.kind}
              className="flex w-full flex-col items-center gap-3"
            >
              <h3 className="font-caps text-sm uppercase tracking-caps text-ink lg:text-base">
                {venue.label}
              </h3>

              <AssetSlot
                kind="content"
                asset={venue.photo}
                variant="oval"
                tone="on-cream"
                description={`${venue.label} photograph`}
                slotPath={VENUE_PHOTO[venue.kind].slotPath}
                filePath={VENUE_PHOTO[venue.kind].filePath}
              />

              <p className="font-script text-2xl leading-tight text-ink lg:text-3xl">
                {venue.name}
              </p>
              <p className="font-serif text-body">{venue.address}</p>
              {venue.time ? (
                <p className="font-serif text-body">{venue.time}</p>
              ) : null}

              <a
                href={venue.mapUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex min-h-11 items-center justify-center border border-body px-6 font-serif text-sm text-body"
              >
                {venue.mapLinkLabel}
              </a>
            </article>
          ))}
        </PaperPanel>

        <AssetSlot
          kind="content"
          asset={eventDetails.photo}
          variant="interlude"
          tone="on-olive"
          description="Couple photograph"
          slotPath="eventDetails.photo"
          filePath="public/images/couple-event-details.png"
        />

        {/*
          The itinerary panel. LANDSCAPE, so it must override `--panel-frame`:
          the portrait rule (8.9% of the panel's width) would grow a ~70px border
          on a panel this wide. Clamped in absolute px at the ends so the frame
          keeps a plausible paper weight from 320px up to the panel's cap.
        */}
        <PaperPanel
          frameClassName="w-full max-w-3xl"
          // The 15px floor is measured, not padding for its own sake: at 3.4cqi
          // alone a 343px-wide panel renders an 11.7px frame, which puts the
          // embossed lines 6.5px and 8.8px from the paper edge — visibly tighter
          // than the reference's, and close enough to the edge to read as a
          // printing error rather than as a frame.
          frame="clamp(15px, 3.4cqi, 22px)"
          className="flex flex-col items-center gap-5 px-[2cqi] py-[3cqi] text-center"
        >
          <h3 className="font-script text-2xl text-ink lg:text-3xl">
            {itinerary.heading}
          </h3>

          {/*
            Columns, as in the reference — but three at a time on a phone, not
            five. Measured with the real five-row itinerary: at a 390px viewport
            the panel's content box is ~290px, so five columns leave 52px each and
            the longest label's longest WORD ("Parroquia", ~51px at this size)
            fills one edge to edge. Three columns give 87px, which reads. Five from
            `sm` upward, where there is room.

            `flex flex-wrap justify-center`, not a `grid`: with five items in a
            three-column grid the two leftovers sit in columns 1 and 2 with a hole
            beside them, which reads as a mistake. Wrapping centres the short last
            row, which is what a five-stop itinerary should look like.

            `shrink-0 whitespace-nowrap` stays on the time for the reason it was
            added: without it a long label squeezed the time until "1:30 PM"
            wrapped onto two lines. The squeeze now comes from the column's own
            percentage width rather than from a flex sibling, so `whitespace-nowrap`
            is the load-bearing half — it makes the time set the column's minimum
            instead of breaking across lines.
          */}
          <ol className="flex w-full flex-wrap justify-center gap-x-2 gap-y-6 sm:gap-x-3">
            {itinerary.rows.map((row) => (
              <li
                key={`${row.time}-${row.label}`}
                className="flex w-[30%] flex-col items-center gap-1 sm:w-[17%]"
              >
                {/*
                  A row with NO `icon` (the real itinerary's 5th row, "Fin de
                  la fiesta") renders no slot at all — see
                  `ItineraryRow.icon`'s doc comment. Only a row that DOES
                  declare an icon type shows a real icon or, until one is
                  supplied, its placeholder.
                */}
                {row.icon ? (
                  <AssetSlot
                    kind="decorative"
                    asset={itinerary.icons?.[row.icon]}
                    variant="icon"
                    tone="on-cream"
                    description={`${row.icon} itinerary icon`}
                    slotPath={`itinerary.icons.${row.icon}`}
                    filePath={`public/images/icon-${row.icon}.png`}
                    className="mb-1"
                  />
                ) : null}
                <span className="shrink-0 whitespace-nowrap font-caps text-sm tabular-nums text-ink">
                  {row.time}
                </span>
                <span className="font-serif text-sm leading-snug text-body">
                  {row.label}
                </span>
              </li>
            ))}
          </ol>
        </PaperPanel>
      </div>
    </section>
  );
}
