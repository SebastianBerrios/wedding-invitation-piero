import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Countdown } from "@/components/interactive/Countdown";

/**
 * Section 2 of 7: the letter is its own block (headed by `letter.heading`),
 * followed by the countdown as its own labeled sub-block (`h3`, using
 * `letter.countdownHeading`, "Faltan") — matching the reference's grouping
 * and fixing Defect 4 (the section's `h2` used to be "Faltan", which
 * described only the countdown, not the letter paragraphs it sat above).
 */
export function LetterSection() {
  const { letter } = invitationConfig;

  return (
    <section
      id="letter"
      aria-labelledby="letter-heading"
      className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-gutter py-section text-center lg:max-w-3xl lg:gap-14"
    >
      <SectionHeading id="letter-heading" heading={letter.heading} />

      <div className="flex max-w-prose flex-col gap-4">
        {letter.paragraphs.map((paragraph, index) => (
          <p key={index} className="font-serif text-lg text-body lg:text-xl">
            {paragraph}
          </p>
        ))}
      </div>

      <div className="flex flex-col items-center gap-3">
        <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
          {letter.countdownHeading}
        </h3>
        <Countdown />
      </div>
    </section>
  );
}
