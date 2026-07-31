import { invitationConfig } from "@/config/invitation";
import { Countdown } from "@/components/interactive/Countdown";

/**
 * Section 2 of 7 — cream ground.
 *
 * The reference's letter is nothing but centred serif paragraphs with generous
 * leading: no panel, no border, no divider, and no visible title. So this
 * section's required `h2` is `sr-only` — the same treatment `DateSection`
 * already uses for the same reason. The heading outline (1x h1 + 7x h2) is
 * unchanged; only its visibility is, and `letter.heading` still gives assistive
 * technology a real name for the section instead of an anonymous region.
 *
 * `bg-surface` is not redundant with the body background: it makes the section
 * OPAQUE, which is what lets the floral backdrop stay at full strength in the
 * hero and be covered from here down (see `PageBackground.tsx`). Every content
 * section carries its own ground for that reason.
 *
 * The countdown is ours, not the reference's — the spec requires it — and it
 * keeps its own `h3`. It sits here rather than in its own section because the
 * seven-section order is fixed.
 */
export function LetterSection() {
  const { letter } = invitationConfig;

  return (
    <section
      id="letter"
      aria-labelledby="letter-heading"
      className="bg-surface"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-12 px-gutter py-section text-center lg:max-w-3xl lg:gap-16">
        <h2 id="letter-heading" className="sr-only">
          {letter.heading}
        </h2>

        <div className="flex max-w-prose flex-col gap-6">
          {letter.paragraphs.map((paragraph, index) => (
            // `leading-loose` (2.0), not the default: the reference sets these
            // paragraphs with markedly open leading, and a high-contrast serif
            // at 18-20px needs it to read as a letter rather than as a block of
            // body copy.
            <p
              key={index}
              className="font-serif text-lg leading-loose text-body lg:text-xl"
            >
              {paragraph}
            </p>
          ))}
        </div>

        <Countdown />
      </div>
    </section>
  );
}
