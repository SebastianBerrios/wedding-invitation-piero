import { invitationConfig } from "@/config/invitation";
import { Monogram } from "@/components/decor/Monogram";

/**
 * Section 1 of 7 (design §1/§9, spec `invitation-sections`). Carries the
 * page's single `h1` (couple names). The eyebrow above it is marked up as
 * `h2` so this section still contributes one heading to the "one `h2` per
 * section" count, matching visual order (eyebrow renders above the names).
 *
 * The 3-layer animated envelope (design §9) and the working song-prompt
 * button (`HeroSongButton`, Phase 7 client island) are NOT part of this
 * work unit — this section renders a plain backdrop and an inert
 * placeholder button so nothing here claims to work that doesn't yet.
 */
export function HeroSection() {
  const { hero, couple } = invitationConfig;

  return (
    <section
      id="hero"
      className="flex min-h-svh flex-col items-center justify-center gap-6 px-gutter py-section text-center"
    >
      <h2 className="font-caps text-eyebrow uppercase tracking-eyebrow text-ink">
        {hero.eyebrow}
      </h2>

      <h1 className="font-script text-script-lg leading-none text-ink">
        {couple.brideFirstName}
        <span className="mx-2 font-serif text-3xl italic text-ink">
          {hero.ampersand}
        </span>
        {couple.groomFirstName}
      </h1>

      <Monogram initials={couple.monogram} className="h-16 w-16" />

      {/*
        Static placeholder for the song-prompt affordance. Phase 7 swaps
        this for the `HeroSongButton` client island (real `onClick` +
        `aria-pressed` wiring). Intentionally inert until then.
      */}
      <button
        type="button"
        aria-disabled="true"
        className="inline-flex items-center gap-2 rounded-full border border-body px-5 py-2 font-caps text-eyebrow uppercase tracking-eyebrow text-body"
      >
        {hero.songPrompt}
      </button>

      <p className="font-serif text-sm text-body">{hero.scrollHint}</p>
    </section>
  );
}
