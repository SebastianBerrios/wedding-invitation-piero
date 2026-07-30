/**
 * Two-initial monogram flourish (design §9). Purely decorative: the couple's
 * full names already carry the accessible name via the page's `h1`, so this
 * SVG is `aria-hidden` to avoid a duplicate/competing announcement.
 *
 * Two variants (VISUAL RESTYLE pass, target items 2 and 4):
 *  - `medallion` — the original double-ring badge. Still used by `icon.tsx`.
 *  - `plain` — letters only, widely tracked, low-opacity ink. This is what
 *    sits on the ENVELOPE's front face below the rose closure. The reference
 *    prints the monogram on the envelope, not on the card, and the card
 *    carries no medallion at all, so the hero card no longer renders this.
 */
export function Monogram({
  initials,
  className,
  variant = "medallion",
}: {
  initials: string;
  className?: string;
  variant?: "medallion" | "plain";
}) {
  if (variant === "plain") {
    return (
      <svg
        className={className}
        viewBox="0 0 80 32"
        aria-hidden="true"
        focusable="false"
      >
        <text
          x="40"
          y="24"
          textAnchor="middle"
          fontFamily="var(--font-caps)"
          fontSize="22"
          // Wide tracking is what makes two letters read as an engraved
          // monogram rather than an abbreviation.
          letterSpacing="5"
          fill="var(--color-ink)"
          // Ink at 45% keeps the initials a quiet imprint on the ivory face —
          // pressed into the paper, not printed on top of it. Deliberately
          // NOT `--color-rule`: gold measures 2.05:1 and is illegal on type
          // (contrast rule R3), even inside `aria-hidden` decoration where the
          // audit would not catch it.
          opacity="0.45"
        >
          {initials}
        </text>
      </svg>
    );
  }

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
