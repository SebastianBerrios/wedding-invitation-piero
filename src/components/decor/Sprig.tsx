/**
 * Three self-drawn botanical accents (design §9): `eucalyptus`, `olive`,
 * `rosebud`. Corrective redesign (Defect 5): the previous version was a
 * single thin stroked path that read as a scratchy, accidental scribble.
 * Each variant now draws a confident stem (`stroke`) plus several distinct
 * filled leaf/petal shapes (`fill`), so the silhouette reads as a real
 * sprig even at small sizes and low opacity. All coordinates are rounded
 * to one decimal (`rendering-svg-precision`). Purely decorative
 * (`aria-hidden`), color stays `--color-rule` only (contrast rule R3:
 * gold never on text).
 */
export type SprigVariant = "eucalyptus" | "olive" | "rosebud";

function Eucalyptus() {
  return (
    <g fill="none" stroke="var(--color-rule)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M14 96 C 16 80, 11 64, 17 48 C 20 38, 27 30, 30 18" />
      <ellipse cx="10.5" cy="82" rx="7" ry="4.8" transform="rotate(-25 10.5 82)" fill="var(--color-rule)" stroke="none" />
      <ellipse cx="20" cy="66" rx="7.4" ry="5" transform="rotate(18 20 66)" fill="var(--color-rule)" stroke="none" />
      <ellipse cx="13" cy="49" rx="6.8" ry="4.6" transform="rotate(-22 13 49)" fill="var(--color-rule)" stroke="none" />
      <ellipse cx="24.5" cy="32" rx="6.2" ry="4.2" transform="rotate(22 24.5 32)" fill="var(--color-rule)" stroke="none" />
      <ellipse cx="30.5" cy="16" rx="5" ry="3.6" transform="rotate(-10 30.5 16)" fill="var(--color-rule)" stroke="none" />
    </g>
  );
}

function Olive() {
  return (
    <g fill="none" stroke="var(--color-rule)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M12 96 C 14 78, 9 60, 16 42 C 20 32, 28 26, 32 14" />
      <path
        d="M6 84 C 9 81, 15 80, 18 83 C 15 87, 9 88, 6 84 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      <path
        d="M20 66 C 24 62, 30 62, 33 66 C 30 70, 23 70, 20 66 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      <path
        d="M9 52 C 12 48, 18 48, 21 52 C 18 56, 12 56, 9 52 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      <path
        d="M23 32 C 27 28, 33 28, 36 32 C 33 36, 26 36, 23 32 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      <path
        d="M28 16 C 31 12, 36 12, 38 16 C 36 20, 30 20, 28 16 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
    </g>
  );
}

function Rosebud() {
  return (
    <g stroke="var(--color-rule)" strokeWidth="1.4" strokeLinecap="round">
      <path d="M30 96 C 28 76, 32 58, 30 38" fill="none" />
      {/* two simple leaves near the base */}
      <path
        d="M18 70 C 22 66, 27 66, 29 70 C 26 74, 20 74, 18 70 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      <path
        d="M31 56 C 35 52, 41 53, 42 57 C 39 61, 33 60, 31 56 Z"
        fill="var(--color-rule)"
        stroke="none"
      />
      {/* rounded bud at the tip: overlapping petal arcs, filled solid */}
      <g fill="var(--color-rule)" stroke="none">
        <circle cx="30" cy="22" r="10" />
      </g>
      <g fill="none" stroke="var(--color-surface)" strokeOpacity="0.55" strokeWidth="1">
        <path d="M30 13 C 36 15, 39 19, 38 24" />
        <path d="M38 24 C 39 30, 35 34, 30 35" />
        <path d="M30 35 C 25 34, 21 30, 22 24" />
        <path d="M22 24 C 21 19, 24 15, 30 13" />
      </g>
    </g>
  );
}

const VARIANTS: Record<SprigVariant, () => React.JSX.Element> = {
  eucalyptus: Eucalyptus,
  olive: Olive,
  rosebud: Rosebud,
};

export function Sprig({
  variant,
  className,
}: {
  variant: SprigVariant;
  className?: string;
}) {
  const Variant = VARIANTS[variant];
  return (
    <svg className={className} viewBox="0 0 60 100" aria-hidden="true" focusable="false">
      <Variant />
    </svg>
  );
}
