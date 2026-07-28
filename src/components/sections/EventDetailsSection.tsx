import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 5 of 7: two venue cards (fixed by `InvitationConfig.venues`
 * shape — always exactly ceremony + reception) plus a variable-length
 * itinerary timeline (spec: "Itinerary with fewer/more rows").
 *
 * No dedicated "event details" title field exists in config, so this
 * section reuses `itinerary.heading` ("Itinerario") as its `h2` — the same
 * documented reuse pattern as `LetterSection`/`FamilySection`. Each venue's
 * own `label` becomes an `h3`.
 */
export function EventDetailsSection() {
  const { venues, itinerary } = invitationConfig;
  const venueList = [venues.ceremony, venues.reception];

  return (
    <section
      id="event-details"
      aria-labelledby="event-details-heading"
      className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-gutter py-section text-center"
    >
      <SectionHeading id="event-details-heading" heading={itinerary.heading} />

      <div className="grid w-full gap-6 sm:grid-cols-2">
        {venueList.map((venue) => (
          <article
            key={venue.kind}
            className="flex flex-col items-center gap-2 rounded-card border border-rule/60 p-6"
          >
            <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
              {venue.label}
            </h3>
            <p className="font-serif text-lg text-ink">{venue.name}</p>
            <p className="font-serif text-body">{venue.address}</p>
            {venue.time ? (
              <p className="font-serif text-body">{venue.time}</p>
            ) : null}
            <a
              href={venue.mapUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-block border-b border-body font-caps text-eyebrow uppercase tracking-eyebrow text-body"
            >
              {venue.mapLinkLabel}
            </a>
          </article>
        ))}
      </div>

      <ol className="flex w-full max-w-md flex-col gap-4">
        {itinerary.rows.map((row) => (
          <li
            key={`${row.time}-${row.label}`}
            className="flex items-baseline justify-between gap-4 border-b border-rule/40 pb-2"
          >
            <span className="font-caps text-sm tabular-nums text-ink">
              {row.time}
            </span>
            <span className="font-serif text-body">{row.label}</span>
          </li>
        ))}
      </ol>
    </section>
  );
}
