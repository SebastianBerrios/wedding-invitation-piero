import { invitationConfig } from "@/config/invitation";
import { Envelope } from "@/components/decor/Envelope";
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
      /*
        `py-10 lg:py-14` instead of the page-wide `py-section` (up to 8rem):
        `.envelope`'s derived `margin-top` already reserves the card's overhang,
        so a further 128px of section padding was pure duplication — it pushed
        the hero to 999px tall at 1440x900, putting the song button and the
        scroll hint below the fold on the most common desktop size. Measured
        with scratchpad/vfit.mjs: 821px at 1440x900 after this change, and
        `clippedAtTop: false` still holds at 320x640 / 390x844 / 1280x720 /
        1440x900 / 1920x1080.
      */
      className="relative flex min-h-svh flex-col items-center justify-center gap-8 px-gutter py-10 text-center lg:gap-10 lg:py-14"
    >
      {/*
        The hero-strength instance of the self-authored SVG floral that used to
        mount here was DELETED along with the artwork itself. `PageBackground`
        now paints one real photographed watercolour for the whole page, so a
        second, stronger copy of it in the hero would only re-introduce the
        seam that appears the moment the hero scrolls away from the `fixed`
        layer behind it.
      */}

      <Envelope monogram={couple.monogram}>
        {/*
          Decorative eyebrow, intentionally kept at the small `text-eyebrow`
          (13px) size (Defect 3 decision): it is not interactive, and
          small-caps eyebrows are a deliberate design accent throughout the
          page. Tracking is widened past the page default (`tracking-card-
          eyebrow`) because on the reference's card this line is noticeably
          wider than its section eyebrows.
        */}
        <h2 className="font-caps text-eyebrow uppercase tracking-card-eyebrow text-ink">
          {hero.eyebrow}
        </h2>

        {/*
          Each name is its own full-width block (bride / & / groom stacked,
          matching the reference), sized via `.envelope-name` (globals.css) —
          a `clamp()` in container query units tied to the CARD's own width,
          not the viewport, with `hyphens: none` and `white-space: nowrap` so a
          name renders on ONE line instead of hyphen-breaking mid-word (the
          `break-words` utility this replaced is exactly what caused
          "NOMBRE_NOV / IA").

          `--name-length` is the ONE number the type scale needs from the data:
          `.envelope-name` divides its `cqi` coefficient by it, so the names
          keep the same proportion of the card whether they are 5 characters or
          12. That replaced a hand-tuned coefficient that had to be re-derived
          — and kept in sync with `MAX_FIRST_NAME_LENGTH` by hand — every time
          the names or the card geometry changed.

          Explicit `{" "}` space text nodes between the blocks keep the raw DOM
          text content (and therefore the accessible-name computation) reading
          "Bride & Groom" rather than concatenating the three blocks with no
          separator.
        */}
        <h1
          className="flex w-full flex-col gap-1 font-script text-ink"
          style={
            {
              "--name-length": Math.max(
                couple.brideFirstName.trim().length,
                couple.groomFirstName.trim().length,
              ),
            } as React.CSSProperties
          }
        >
          <span className="envelope-name block w-full">
            {couple.brideFirstName}
          </span>{" "}
          {/* `envelope-ampersand` scales with the card like the names do; a
              fixed `text-xs` left it at 26% of the 46px name size, reading as
              a typo between them rather than a deliberate ligature. */}
          <span className="envelope-ampersand block w-full font-serif italic text-ink">
            {hero.ampersand}
          </span>{" "}
          <span className="envelope-name block w-full">
            {couple.groomFirstName}
          </span>
        </h1>

        {/*
          The gold `Rule` and the `Monogram` medallion that used to close out
          the card were REMOVED (target items 2 and 4). The reference's card
          carries no medallion and no divider — the inset hairline frame is the
          card's only ornament, and the monogram now belongs to the envelope's
          front face, printed once rather than competing with the names.
        */}
      </Envelope>

      {/*
        Music affordance (target item 5). `HeroSongButton` now owns BOTH the
        prompt line and the round button, because the prompt doubles as the
        error message when playback fails and only the client island knows the
        player status.
      */}
      <HeroSongButton />

      {/*
        Scroll hint (target item 6). The reference has none, but this is a
        full-viewport hero and `hero.scrollHint` is what tells a guest there
        are six more sections below the fold — a real usability aid, kept
        deliberately quiet rather than dropped for fidelity's sake.
      */}
      {/*
        `text-ink`, not `text-body`, for the same measured reason as the song
        prompt: over the hero's full-strength floral, `--color-body` measured
        4.46:1 at 390px against the SVG floral — below AA — and cannot clear
        4.5:1 at all against the photographed backdrop that replaced it, at any
        veil worth shipping. `--color-ink` re-measures 8.78:1 at 390 and 9.03:1
        at 1440. See scratchpad/bg-contrast.mjs and `--page-veil` in globals.css.
      */}
      <p className="font-serif text-sm text-ink lg:text-base">
        {hero.scrollHint}
      </p>
    </section>
  );
}
