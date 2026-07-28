import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 2 of 7: letter paragraphs + a reserved countdown slot.
 *
 * No dedicated "letter heading" field exists in `LetterConfig` (design §2),
 * so this section reuses `letter.countdownHeading` ("Faltan") as its `h2` —
 * a documented, honest reuse rather than inventing a hardcoded chrome
 * string, since the countdown block is the section's visual/semantic
 * centerpiece.
 */
export function LetterSection() {
  const { letter } = invitationConfig;

  return (
    <section
      id="letter"
      aria-labelledby="letter-heading"
      className="mx-auto flex max-w-2xl flex-col items-center gap-8 px-gutter py-section text-center"
    >
      <SectionHeading id="letter-heading" heading={letter.countdownHeading} />

      <div className="flex flex-col gap-4">
        {letter.paragraphs.map((paragraph, index) => (
          <p key={index} className="font-serif text-lg text-body">
            {paragraph}
          </p>
        ))}
      </div>

      <CountdownPlaceholder />
    </section>
  );
}

/**
 * Static, fixed-width shell reserving the exact slot dimensions the real
 * `Countdown` client island (Phase 6a) will occupy — same `--` placeholder
 * digits the island renders during SSR, so wiring in the real island later
 * causes zero layout shift. Not yet interactive; the whole block is
 * `aria-hidden` because its values are fake and there is no real countdown
 * to announce until Phase 6 lands.
 */
function CountdownPlaceholder() {
  const { unitLabels } = invitationConfig.letter;
  const units: Array<{ label: string; width: string }> = [
    { label: unitLabels.days, width: "min-w-[3ch]" },
    { label: unitLabels.hours, width: "min-w-[2ch]" },
    { label: unitLabels.minutes, width: "min-w-[2ch]" },
    { label: unitLabels.seconds, width: "min-w-[2ch]" },
  ];

  return (
    <div
      aria-hidden="true"
      className="flex items-start justify-center gap-4 sm:gap-6"
    >
      {units.map((unit) => (
        <div key={unit.label} className="flex flex-col items-center gap-1">
          <span
            className={`inline-block text-center font-caps text-3xl tabular-nums text-ink ${unit.width}`}
          >
            --
          </span>
          <span className="font-caps text-xs uppercase tracking-caps text-body">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
