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
      {/*
        Corner botanical ornaments (design §9/work unit 8b), purely
        decorative. Opacity raised from the previous 40 to 55 (corrective
        pass, Defect 5) — the redrawn `Sprig` now has confident filled
        leaves rather than a thin scratchy stroke, so it can carry a bit
        more presence without competing with the envelope. Base size
        shrunk from h-24/w-14 to h-14/w-8 (measured via
        `getBoundingClientRect`): the wider landscape envelope's card now
        extends closer to the section edges at 320-390px, and the larger
        size visually collided with the card's corners at those widths.
      */}
      <Sprig
        variant="eucalyptus"
        className="pointer-events-none absolute left-0 top-6 h-[3.5rem] w-[2rem] opacity-55 lg:h-32 lg:w-20"
      />
      <Sprig
        variant="olive"
        className="pointer-events-none absolute right-0 top-6 h-[3.5rem] w-[2rem] -scale-x-100 opacity-55 lg:h-32 lg:w-20"
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
          Fix (Defect 3, corrective pass): each name is its own full-width
          block (bride / & / groom stacked, matching the reference), sized
          via `.envelope-name` (globals.css) — a `clamp()` in container
          query units tied to the CARD's own width, not the viewport, with
          `hyphens: none` and `white-space: nowrap` so a name up to 14
          characters renders on ONE line instead of hyphen-breaking
          mid-word (the previous `break-words` utility is exactly what
          caused "NOMBRE_NOV / IA"). Explicit `{" "}` space text nodes
          between the blocks keep the raw DOM text content (and therefore
          the accessible-name computation) reading "Bride & Groom" rather
          than concatenating the three blocks with no separator.
        */}
        <h1 className="flex w-full flex-col gap-1 font-script text-ink">
          <span className="envelope-name block w-full">
            {couple.brideFirstName}
          </span>{" "}
          <span className="block w-full font-serif text-xs italic text-ink">
            {hero.ampersand}
          </span>{" "}
          <span className="envelope-name block w-full">
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
