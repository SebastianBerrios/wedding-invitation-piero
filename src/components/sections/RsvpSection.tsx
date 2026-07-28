import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { RsvpForm } from "@/components/interactive/RsvpForm";

/**
 * Section 7 of 7: RSVP heading, paragraph, and the real `RsvpForm` client
 * island. `rsvp.heading` is the exact text the spec scenario names
 * ("Confirma tu asistencia") — it drives this section's `h2`;
 * `rsvp.scriptWord` ("RSVP") is the eyebrow.
 */
export function RsvpSection() {
  const { rsvp } = invitationConfig;

  return (
    <section
      id="rsvp"
      aria-labelledby="rsvp-heading"
      className="mx-auto flex max-w-md flex-col items-center gap-8 px-gutter py-section text-center lg:max-w-lg lg:gap-10"
    >
      <SectionHeading
        id="rsvp-heading"
        eyebrow={rsvp.scriptWord}
        heading={rsvp.heading}
      />

      <p className="font-serif text-body lg:text-lg">{rsvp.paragraph}</p>

      <RsvpForm />
    </section>
  );
}
