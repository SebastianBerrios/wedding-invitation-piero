"use client";

import { invitationConfig } from "@/config/invitation";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { PlayPauseIcon } from "@/components/ui/PlayPauseIcon";

/**
 * Client island (design §8, work unit 7). The hero song-prompt affordance.
 * Shares the single `audioPlayerStore` state with `StickyMusicToggle` — no
 * context provider, no client-boundary growth around the page tree.
 */
export function HeroSongButton() {
  const { audio, hero } = invitationConfig;
  const { status, toggle } = useMusicPlayer();
  const isPlaying = status === "playing";
  const isError = status === "error";

  const label = isError
    ? audio.errorLabel
    : isPlaying
      ? audio.pauseLabel
      : hero.songPrompt;

  return (
    // No `aria-label` here: the button's own visible text (`label`) already
    // fully describes its purpose and current state, and doubling it with a
    // differently-worded `aria-label` (e.g. `hero.songPrompt` vs
    // `audio.playLabel`) would fail WCAG 2.5.3 "Label in Name" — a
    // voice-control user speaking the visible label would not match the
    // accessible name. `StickyMusicToggle` is icon-only and legitimately
    // needs its own `aria-label` since it has no visible text to conflict
    // with.
    <button
      type="button"
      aria-pressed={isPlaying}
      onClick={() => toggle(audio.src)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-body px-6 py-2 font-caps text-sm uppercase tracking-eyebrow text-body"
    >
      <PlayPauseIcon playing={isPlaying} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
