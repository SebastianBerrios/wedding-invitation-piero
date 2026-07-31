/**
 * Shared section-title primitive.
 *
 * ## The two-line treatment
 *
 * The reference sets these headings as TWO lines: a serif small-caps line above
 * a script line — `CÓDIGO DE` / `Vestimenta`, `SUGERENCIA DE` / `Regalos`. Both
 * lines belong to one heading, so both live inside the single `h2`/`h3` element
 * with the eyebrow marked up as a `<span>`: splitting them across a `<p>` and an
 * `<h2>` (which is what this component used to do) reads as two unrelated things
 * to a screen reader and loses the fact that "CÓDIGO DE VESTIMENTA" is one title.
 *
 * The `h2` element still carries the visible text itself — never a styled `div`
 * standing in for a heading (spec: "Semantic Headings Behind Decorative Type").
 *
 * ## `as`
 *
 * The Gifts block is a sub-block of the Dress code + Gifts section, so it needs
 * the same visual treatment at `h3`. Changing the LEVEL must never change the
 * look, and changing the look must never change the level — hence one component
 * with an explicit `as`, rather than two that drift apart.
 *
 * ## The ornament
 *
 * The gold `Rule` that used to close every heading is gone (see
 * `Separator.tsx`). The reference does not put a divider under a heading at all:
 * its rules sit between blocks. Sections that want one place a `Separator`
 * themselves.
 */
export function SectionHeading({
  eyebrow,
  heading,
  as: Tag = "h2",
  id,
  tone = "ink",
  className = "",
}: {
  /** Small-caps first line, e.g. "CÓDIGO DE". Omit for a one-line heading. */
  eyebrow?: string;
  /** Script second line, e.g. "Vestimenta" — or the whole heading when there is no eyebrow. */
  heading: string;
  as?: "h2" | "h3";
  id?: string;
  /** `ink` on the cream sections, `surface` (cream) on the dark olive ones. */
  tone?: "ink" | "surface";
  className?: string;
}) {
  const color = tone === "surface" ? "text-surface" : "text-ink";
  return (
    <Tag id={id} className={`flex flex-col items-center ${color} ${className}`}>
      {eyebrow ? (
        <span className="font-caps text-eyebrow uppercase tracking-eyebrow">
          {eyebrow}
        </span>
      ) : null}
      <span className="font-script text-3xl leading-tight lg:text-4xl">
        {heading}
      </span>
    </Tag>
  );
}
