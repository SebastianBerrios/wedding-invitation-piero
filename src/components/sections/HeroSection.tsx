import { invitationConfig } from "@/config/invitation";
import { Envelope } from "@/components/decor/Envelope";
import { Monogram } from "@/components/decor/Monogram";
import { Rule } from "@/components/decor/Rule";
import { Sprig } from "@/components/decor/Sprig";
import { HeroSongButton } from "@/components/interactive/HeroSongButton";

/**
 * Section 1 of 7 (design §1/§9, spec `invitation-sections`). Carries the
 * page's single `h1` (couple names), now printed on the envelope's rising
 * card (design §9, work unit 8a) rather than as a standalone block — the
 * card IS the surface the invitation text lives on, matching the reference
 * ("the card carries NUESTRA BODA... and the couple's names").
 *
 * The card's own text is sized down from the page's largest display scale
 * (`--text-script-lg`, still used for e.g. the Family section's blessing
 * line) so it reads as an intentional, proportioned card — not the full
 * viewport-filling hero scale stuffed into a small box.
 */
export function HeroSection() {
  const { hero, couple } = invitationConfig;

  return (
    <section
      id="hero"
      className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-gutter py-section text-center lg:gap-10"
    >
      {/* Corner botanical ornaments (design §9/work unit 8b), purely decorative. */}
      <Sprig
        variant="eucalyptus"
        className="pointer-events-none absolute left-0 top-6 h-24 w-14 opacity-40 lg:h-32 lg:w-20"
      />
      <Sprig
        variant="olive"
        className="pointer-events-none absolute right-0 top-6 h-24 w-14 -scale-x-100 opacity-40 lg:h-32 lg:w-20"
      />

      <Envelope>
        {/*
          Decorative eyebrow, intentionally kept at the small `text-eyebrow`
          (13px) size (Defect 3 decision): it is not interactive, and
          small-caps eyebrows are a deliberate design accent throughout the
          page.
        */}
        <h2 className="font-caps text-eyebrow uppercase tracking-eyebrow text-ink">
          {hero.eyebrow}
        </h2>

        {/*
          Fix (Defect 1 — CRITICAL horizontal overflow, carried over): each
          name is its own full-width block (bride / & / groom stacked,
          matching the reference), with `break-words` as a safety net so an
          unusually long real name wraps instead of overflowing. Explicit
          `{" "}` space text nodes between the blocks keep the raw DOM text
          content (and therefore the accessible-name computation) reading
          "Bride & Groom" rather than concatenating the three blocks with no
          separator.
        */}
        <h1 className="flex w-full flex-col gap-0.5 font-script leading-none text-ink">
          <span className="block w-full break-words text-2xl">
            {couple.brideFirstName}
          </span>{" "}
          <span className="block w-full font-serif text-xs italic text-ink">
            {hero.ampersand}
          </span>{" "}
          <span className="block w-full break-words text-2xl">
            {couple.groomFirstName}
          </span>
        </h1>

        <Rule className="h-2.5 w-16 opacity-70" />

        <Monogram initials={couple.monogram} className="h-10 w-10 lg:h-12 lg:w-12" />
      </Envelope>

      <HeroSongButton />

      <p className="font-serif text-sm text-body lg:text-base">
        {hero.scrollHint}
      </p>
    </section>
  );
}
