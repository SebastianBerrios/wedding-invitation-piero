/**
 * Two-initial monogram flourish (design §9). Purely decorative: the couple's
 * full names already carry the accessible name via the page's `h1`, so this
 * SVG is `aria-hidden` to avoid a duplicate/competing announcement.
 */
export function Monogram({
  initials,
  className,
}: {
  initials: string;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 80 80"
      aria-hidden="true"
      focusable="false"
    >
      <circle
        cx="40"
        cy="40"
        r="37"
        fill="none"
        stroke="var(--color-rule)"
        strokeWidth="1.25"
      />
      <circle
        cx="40"
        cy="40"
        r="31"
        fill="none"
        stroke="var(--color-rule)"
        strokeWidth="0.75"
      />
      <text
        x="40"
        y="50"
        textAnchor="middle"
        fontFamily="var(--font-caps)"
        fontSize="26"
        letterSpacing="2"
        fill="var(--color-ink)"
      >
        {initials}
      </text>
    </svg>
  );
}
