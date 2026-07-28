import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 5 of 7: two venue cards (fixed by `InvitationConfig.venues`
 * shape — always exactly ceremony + reception) as their own block, followed
 * by the variable-length itinerary timeline as its own labeled sub-block
 * (spec: "Itinerary with fewer/more rows").
 *
 * Fix (Defect 4): the section's `h2` used to be `itinerary.heading`
 * ("Itinerario"), which described only the itinerary rows, not the venue
 * cards it sat above. The section now uses its own genuine heading
 * (`eventDetails.heading`) for the venue-cards block, and `itinerary.heading`
 * moves down to an `h3` that labels only the itinerary timeline beneath it —
 * each heading now describes the content directly below it. Each venue's
 * own `label` stays an `h3` too (not counted toward the "one `h2` per
 * section" total).
 */
export function EventDetailsSection() {
  const { venues, itinerary, eventDetails } = invitationConfig;
  const venueList = [venues.ceremony, venues.reception];

  return (
    <section
      id="event-details"
      aria-labelledby="event-details-heading"
      className="mx-auto flex max-w-3xl flex-col items-center gap-12 px-gutter py-section text-center lg:max-w-5xl lg:gap-16"
    >
      <SectionHeading
        id="event-details-heading"
        heading={eventDetails.heading}
      />

      <div className="grid w-full gap-6 sm:grid-cols-2 lg:gap-10">
        {venueList.map((venue) => (
          <article
            key={venue.kind}
            className="flex flex-col items-center gap-2 rounded-card border border-rule/60 p-6 lg:p-8"
          >
            <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
              {venue.label}
            </h3>
            <p className="font-serif text-lg text-ink lg:text-xl">
              {venue.name}
            </p>
            <p className="font-serif text-body lg:text-lg">{venue.address}</p>
            {venue.time ? (
              <p className="font-serif text-body lg:text-lg">{venue.time}</p>
            ) : null}
            {/*
              Fix (Defect 3): interactive link, raised from `text-eyebrow`
              (13px) to `text-sm` (14px) with an explicit `min-h-11` (44px)
              tap target.
            */}
            <a
              href={venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex min-h-11 items-center border-b border-body px-2 font-caps text-sm uppercase tracking-eyebrow text-body"
            >
              {venue.mapLinkLabel}
            </a>
          </article>
        ))}
      </div>

      <div className="flex w-full flex-col items-center gap-6">
        <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
          {itinerary.heading}
        </h3>
        <ol className="flex w-full max-w-md flex-col gap-4">
          {itinerary.rows.map((row) => (
            <li
              key={`${row.time}-${row.label}`}
              className="flex items-baseline justify-between gap-4 border-b border-rule/40 pb-2"
            >
              <span className="font-caps text-sm tabular-nums text-ink">
                {row.time}
              </span>
              <span className="font-serif text-body lg:text-lg">
                {row.label}
              </span>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
