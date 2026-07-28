import { invitationConfig } from "@/config/invitation";

/**
 * Section 4 of 7: blessing line + N family-group cards, fully array-driven
 * (spec `invitation-sections` — "Family section renders all groups").
 *
 * `FamilyConfig` (design §2) has no separate "section title" field, so —
 * matching the same reuse pattern as `LetterSection` — the `blessingLine`
 * itself becomes this section's `h2`; each group's own `title` becomes an
 * `h3` (not counted toward the "one `h2` per section" total).
 */
export function FamilySection() {
  const { family } = invitationConfig;

  return (
    <section
      id="family"
      aria-labelledby="family-heading"
      className="mx-auto flex max-w-3xl flex-col items-center gap-10 px-gutter py-section text-center lg:max-w-5xl lg:gap-14"
    >
      <h2
        id="family-heading"
        className="max-w-prose font-script text-script-lg text-ink"
      >
        {family.blessingLine}
      </h2>

      <div className="grid w-full gap-6 sm:grid-cols-3 lg:gap-10">
        {family.groups.map((group) => (
          <div
            key={group.title}
            className="flex flex-col items-center gap-3 rounded-card border border-rule/60 p-6 lg:p-8"
          >
            <h3 className="font-caps text-sm uppercase tracking-caps text-ink">
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
    </section>
  );
}
