import { invitationConfig } from "@/config/invitation";

/**
 * Section 3 of 7: the big day/month/year block (design §3, `--text-date-xl`
 * token). The visual layout fragments the date across several large,
 * independently-styled lines, so a single `sr-only` `h2` carries the full
 * composite accessible name while the oversized visual fragments are
 * `aria-hidden` (they would otherwise be announced twice, out of order).
 */
export function DateSection() {
  const { display } = invitationConfig.event;
  const fullDateLabel = `${display.weekday}, ${display.day} de ${display.month} de ${display.year} · ${display.time}`;

  return (
    <section
      id="date"
      aria-labelledby="date-heading"
      className="flex flex-col items-center gap-2 px-gutter py-section text-center"
    >
      <h2 id="date-heading" className="sr-only">
        {fullDateLabel}
      </h2>

      <p
        aria-hidden="true"
        className="font-caps text-eyebrow uppercase tracking-eyebrow text-ink"
      >
        {display.weekday}
      </p>
      <p
        aria-hidden="true"
        className="font-serif text-date-xl leading-none text-ink"
      >
        {display.day}
      </p>
      <p
        aria-hidden="true"
        className="font-caps text-2xl uppercase tracking-caps text-ink"
      >
        {display.month}
      </p>
      <p aria-hidden="true" className="font-serif text-lg text-body">
        {display.year} · {display.time}
      </p>
    </section>
  );
}
