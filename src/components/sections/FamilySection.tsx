import { invitationConfig } from "@/config/invitation";
import { Separator } from "@/components/decor/Separator";

/**
 * Section 4 of 7 — cream ground, bracketed by a divider above AND below.
 *
 * ## What changed from the previous version, and why
 *
 * The two type roles were swapped, because they were the wrong way round against
 * the reference: the blessing line was a huge script display heading and each
 * group's title was small serif small caps. The reference does the opposite —
 * the blessing line is quiet serif at body size, and each GROUP TITLE is set in
 * the script face. That is what makes the three groups read as the section's
 * subject and the blessing as its preamble.
 *
 * The blessing line stays the section's `h2` and each group title stays an `h3`:
 * moving a title into the script face changes its LOOK, never its LEVEL. The
 * heading outline is unchanged.
 *
 * The bordered cards are gone. The reference has no boxes here — the groups are
 * separated by vertical rhythm alone — and the borders were drawn in gold
 * (`--color-rule`, 2.05:1 on cream), so they were nearly invisible anyway.
 *
 * Layout is a single centred column at every width, not a 3-up grid: the
 * reference stacks the groups even on desktop, and stacking is also what keeps
 * the script titles at a readable size instead of squeezing three of them into
 * one row. Fully array-driven, so N groups still render (spec
 * `invitation-sections` — "Family section renders all groups").
 */
export function FamilySection() {
  const { family } = invitationConfig;

  return (
    <section
      id="family"
      aria-labelledby="family-heading"
      className="bg-surface"
    >
      <div className="mx-auto flex max-w-2xl flex-col items-center gap-10 px-gutter py-section text-center lg:gap-12">
        <Separator />

        <h2
          id="family-heading"
          className="max-w-prose font-serif text-lg text-body lg:text-xl"
        >
          {family.blessingLine}
        </h2>

        <div className="flex flex-col items-center gap-8 lg:gap-10">
          {family.groups.map((group) => (
            <div key={group.title} className="flex flex-col items-center gap-2">
              <h3 className="font-script text-2xl text-ink lg:text-3xl">
                {group.title}
              </h3>
              <ul className="flex flex-col gap-1">
                {group.names.map((name) => (
                  <li key={name} className="font-serif text-body lg:text-lg">
                    {name}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator />
      </div>
    </section>
  );
}
