/**
 * Three self-drawn botanical accents (design §9): `eucalyptus`, `olive`,
 * `rosebud`. All coordinates are rounded to one decimal
 * (`rendering-svg-precision`). Purely decorative — `aria-hidden`, stroke
 * only in `--color-rule` (contrast rule R3: gold never on text).
 */
export type SprigVariant = "eucalyptus" | "olive" | "rosebud";

const SPRIG_PATHS: Record<SprigVariant, string> = {
  eucalyptus:
    "M10 90 C 20 70, 15 50, 25 30 M25 30 C 30 25, 38 22, 42 15 M20 45 C 28 42, 34 44, 40 38 M15 65 C 24 62, 30 65, 36 58",
  olive:
    "M8 95 C 18 75, 14 55, 24 35 M24 35 L34 28 M24 35 L16 26 M18 55 L28 48 M18 55 L10 46",
  rosebud:
    "M50 90 C 48 70, 52 50, 50 30 C 46 24, 40 22, 38 16 C 44 18, 48 22, 50 26 C 52 22, 56 18, 62 16 C 60 22, 54 24, 50 30",
};

export function Sprig({
  variant,
  className,
}: {
  variant: SprigVariant;
  className?: string;
}) {
  return (
    <svg
      className={className}
      viewBox="0 0 60 100"
      aria-hidden="true"
      focusable="false"
    >
      <path
        d={SPRIG_PATHS[variant]}
        fill="none"
        stroke="var(--color-rule)"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}
