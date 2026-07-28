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
    <button
      type="button"
      aria-pressed={isPlaying}
      aria-label={isPlaying ? audio.pauseLabel : audio.playLabel}
      onClick={() => toggle(audio.src)}
      className="inline-flex min-h-11 items-center gap-2 rounded-full border border-body px-6 py-2 font-caps text-sm uppercase tracking-eyebrow text-body"
    >
      <PlayPauseIcon playing={isPlaying} className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}
