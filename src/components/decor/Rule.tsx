/**
 * Gold hairline divider with a center diamond accent (design §9/§3).
 * Purely decorative — `aria-hidden` and never renders text, so the gold
 * (`--color-rule`) token stays legal under contrast rule R3 (stroke/fill
 * only, never text).
 */
export function Rule({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 200 12"
      aria-hidden="true"
      focusable="false"
    >
      <line
        x1="0"
        y1="6"
        x2="86"
        y2="6"
        stroke="var(--color-rule)"
        strokeWidth="1"
      />
      <rect
        x="94"
        y="2"
        width="8"
        height="8"
        transform="rotate(45 98 6)"
        fill="var(--color-rule)"
      />
      <line
        x1="114"
        y1="6"
        x2="200"
        y2="6"
        stroke="var(--color-rule)"
        strokeWidth="1"
      />
    </svg>
  );
}
