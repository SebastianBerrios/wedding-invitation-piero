import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RsvpForm } from "@/components/interactive/RsvpForm";

/**
 * Section 7 of 7 — cream ground: heading, paragraph, submit control.
 *
 * `rsvp.heading` is the exact text the spec scenario names ("Confirma tu
 * asistencia") and drives this section's `h2`; `rsvp.scriptWord` ("RSVP") is the
 * small-caps eyebrow line of the same two-line heading.
 *
 * `bg-surface` makes the section opaque, like every other content section, so the
 * floral backdrop stays confined to the hero (see `PageBackground.tsx`).
 */
export function RsvpSection() {
  const { rsvp } = invitationConfig;

  return (
    <section id="rsvp" aria-labelledby="rsvp-heading" className="bg-surface">
      <div className="mx-auto flex max-w-md flex-col items-center gap-8 px-gutter py-section text-center lg:max-w-lg lg:gap-10">
        <SectionHeading
          id="rsvp-heading"
          eyebrow={rsvp.scriptWord}
          heading={rsvp.heading}
        />

        <p className="font-serif leading-relaxed text-body lg:text-lg">
          {rsvp.paragraph}
        </p>

        <RsvpForm />
      </div>
    </section>
  );
}
