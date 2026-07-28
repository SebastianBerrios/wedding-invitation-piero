import { invitationConfig } from "@/config/invitation";
import { SectionHeading } from "@/components/ui/SectionHeading";

/**
 * Section 7 of 7: RSVP heading, paragraph, and a static form shell.
 * `rsvp.heading` is the exact text the spec scenario names ("Confirma tu
 * asistencia") — it drives this section's `h2`; `rsvp.scriptWord` ("RSVP")
 * is the eyebrow.
 *
 * The inputs below are visually correct but non-functional: no
 * `onChange`/`onSubmit` handlers (this batch is server-components-only),
 * and no `<form>` element (a bare `<form>` with no `action` would trigger a
 * real GET navigation on submit, which is worse than an inert shell).
 * Phase 6b replaces this whole block with the real `RsvpForm` client
 * island (controlled inputs, validation, derived `wa.me` href).
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

      <div className="flex w-full flex-col gap-4 text-left">
        <label className="flex flex-col gap-1">
          <span className="font-caps text-sm uppercase tracking-caps text-ink">
            {rsvp.nameLabel}
          </span>
          <input
            type="text"
            placeholder={rsvp.namePlaceholder}
            disabled
            className="rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body placeholder:text-body/60"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-caps text-sm uppercase tracking-caps text-ink">
            {rsvp.guestCountLabel}
          </span>
          <input
            type="number"
            min={1}
            max={rsvp.maxGuests}
            defaultValue={1}
            disabled
            className="rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body"
          />
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-caps text-sm uppercase tracking-caps text-ink">
            {rsvp.noteLabel}
          </span>
          <textarea
            placeholder={rsvp.notePlaceholder}
            disabled
            rows={3}
            className="rounded-card border border-body bg-transparent px-3 py-2 font-serif text-body placeholder:text-body/60"
          />
        </label>

        {/*
          Static placeholder for the submit affordance. `type="button"`
          (never "submit") so it cannot trigger a stray navigation before
          Phase 6b wires the real derived `wa.me` href.
        */}
        <button
          type="button"
          aria-disabled="true"
          className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-body px-6 py-2.5 font-caps uppercase tracking-eyebrow text-body"
        >
          {rsvp.submitLabel}
        </button>
      </div>
    </section>
  );
}
