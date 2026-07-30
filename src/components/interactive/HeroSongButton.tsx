"use client";

import { invitationConfig } from "@/config/invitation";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { PlayPauseIcon } from "@/components/ui/PlayPauseIcon";

/**
 * Client island (design §8, work unit 7). The hero song affordance.
 *
 * Restyled (VISUAL RESTYLE pass, target item 5): the prompt used to live
 * INSIDE a pill button. The reference puts the prompt on its own line with a
 * CIRCULAR play button centred underneath, so the two are now separate
 * elements. This component owns both, because the prompt line also carries the
 * playback error message and only this island knows the player status.
 *
 * Accessibility notes, both deliberate:
 *  - The button is now icon-only, so it NEEDS an `aria-label`. The previous
 *    version had visible text and therefore could not carry a differently
 *    worded label without failing WCAG 2.5.3 "Label in Name"; that hazard is
 *    gone with the text out of the button, and an unlabelled icon button would
 *    be a hard axe violation.
 *  - `aria-describedby` points at the prompt so the relationship between the
 *    line and the control is programmatic, not just visual.
 *
 * Unchanged: the single shared `audioPlayerStore` state with
 * `StickyMusicToggle` (no context provider, no client-boundary growth), and
 * nothing is fetched or played until a real user gesture.
 */
export function HeroSongButton() {
  const { audio, hero } = invitationConfig;
  const { status, toggle } = useMusicPlayer();
  const isPlaying = status === "playing";
  const isError = status === "error";

  return (
    <div className="flex flex-col items-center gap-3">
      <p
        id="hero-song-prompt"
        // `text-sm` (14px), not `text-eyebrow` (13px). This line is real body
        // copy a guest is meant to read, not a decorative section eyebrow, and
        // it used to render at 14px inside the pill button — dropping it to
        // 13px when it moved out would have been a silent legibility
        // regression (audit.mjs reports every text node under 14px).
        //
        // `text-ink`, not `text-body`. This line sits directly on the hero's
        // full-strength watercolor floral, and MEASURING the composited pixels
        // behind it (scratchpad/bg-contrast.mjs, which hides the text and
        // samples the darkest background pixel inside its box) showed
        // `--color-body` at 4.39:1 over the densest bloom — a real WCAG AA
        // failure. `audit.mjs` could not see it because it computes contrast
        // against the flat `body` background colour, and axe reported it only
        // as `incomplete` ("background could not be determined"), not as a
        // violation. `--color-ink` measures 11:1 against the same pixels.
        className="font-caps text-sm uppercase tracking-eyebrow text-ink"
      >
        {isError ? audio.errorLabel : hero.songPrompt}
      </p>

      <button
        type="button"
        aria-pressed={isPlaying}
        aria-label={isPlaying ? audio.pauseLabel : audio.playLabel}
        aria-describedby="hero-song-prompt"
        onClick={() => toggle(audio.src)}
        // `size-12` is 48px, comfortably over the 44px minimum tap target the
        // RSVP controls were previously sent back for missing.
        className="flex size-12 items-center justify-center rounded-full border border-body/70 text-body"
      >
        <PlayPauseIcon playing={isPlaying} className="h-4 w-4" />
      </button>
    </div>
  );
}
