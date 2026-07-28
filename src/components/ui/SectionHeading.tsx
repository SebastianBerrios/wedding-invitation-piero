import { Rule } from "@/components/decor/Rule";

/**
 * Shared section-title primitive (design §9): a small-caps eyebrow line
 * above a real `h2` styled with the script/serif fonts, plus a `Rule`
 * ornament beneath. The `h2` element itself carries the visible heading
 * text — never a styled `div` standing in for a heading (spec:
 * "Semantic Headings Behind Decorative Type").
 */
export function SectionHeading({
  eyebrow,
  heading,
  headingClassName = "font-script text-script-lg text-ink",
  id,
}: {
  eyebrow?: string;
  heading: string;
  headingClassName?: string;
  id?: string;
}) {
  return (
    <div className="flex flex-col items-center text-center">
      {eyebrow ? (
        <p className="font-caps text-eyebrow uppercase tracking-eyebrow text-ink">
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className={`mt-2 ${headingClassName}`}>
        {heading}
      </h2>
      <Rule className="mt-4 h-3 w-24" />
    </div>
  );
}
