import { invitationConfig } from "@/config/invitation";
import { Monogram } from "@/components/decor/Monogram";
import { HeroSongButton } from "@/components/interactive/HeroSongButton";

/**
 * Section 1 of 7 (design §1/§9, spec `invitation-sections`). Carries the
 * page's single `h1` (couple names). The eyebrow above it is marked up as
 * `h2` so this section still contributes one heading to the "one `h2` per
 * section" count, matching visual order (eyebrow renders above the names).
 *
 * The 3-layer animated envelope (design §9) is NOT part of this work
 * unit — this section renders a plain backdrop. The song-prompt affordance
 * is the real `HeroSongButton` client island (Phase 7).
 */
export function HeroSection() {
  const { hero, couple } = invitationConfig;

  return (
    <section
      id="hero"
      className="flex min-h-svh flex-col items-center justify-center gap-6 px-gutter py-section text-center lg:gap-10"
    >
      {/*
        Decorative eyebrow, intentionally kept at the small `text-eyebrow`
        (13px) size (Defect 3 decision): it is not interactive, and small-caps
        eyebrows are a deliberate design accent throughout the page.
      */}
      <h2 className="font-caps text-eyebrow uppercase tracking-eyebrow text-ink">
        {hero.eyebrow}
      </h2>

      {/*
        Fix (Defect 1 — CRITICAL horizontal overflow): the bride/groom names
        used to render as one unbroken run (`NOMBRE&NOMBRE`, no whitespace
        around the ampersand), which the browser could never break, so the
        whole line overflowed the viewport at every width. Each name is now
        its own full-width block (bride / & / groom stacked, matching the
        reference), with `break-words` as a safety net so an unusually long
        real name wraps instead of overflowing. `--text-script-lg` is fluid
        via `clamp()` (globals.css) so it also shrinks to fit small phones.
        Explicit `{" "}` space text nodes between the blocks keep the raw DOM
        text content (and therefore the accessible-name computation) reading
        "Bride & Groom" rather than concatenating the three blocks with no
        separator — accessible-name algorithms don't always insert a space
        at block boundaries the way visual line-wrapping does.
      */}
      <h1 className="flex w-full flex-col gap-1 font-script leading-none text-ink sm:gap-2">
        <span className="block w-full break-words text-script-lg">
          {couple.brideFirstName}
        </span>{" "}
        <span className="block w-full font-serif text-2xl italic text-ink sm:text-3xl lg:text-4xl">
          {hero.ampersand}
        </span>{" "}
        <span className="block w-full break-words text-script-lg">
          {couple.groomFirstName}
        </span>
      </h1>

      <Monogram initials={couple.monogram} className="h-16 w-16 lg:h-20 lg:w-20" />

      <HeroSongButton />

      <p className="font-serif text-sm text-body lg:text-base">
        {hero.scrollHint}
      </p>
    </section>
  );
}
