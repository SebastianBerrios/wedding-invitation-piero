"use client";

import { invitationConfig } from "@/config/invitation";
import { useMusicPlayer } from "@/hooks/useMusicPlayer";
import { PlayPauseIcon } from "@/components/ui/PlayPauseIcon";

/**
 * Client island (design §8, work unit 7). Persistent, reachable control
 * mounted in `layout.tsx` (fixed positioning), so it stays visible/
 * interactive from every scroll position (spec `background-music-player` —
 * "Persistent Reachable Control"). Shares the same `audioPlayerStore` state
 * as `HeroSongButton` — one piece of state drives both controls.
 */
export function StickyMusicToggle() {
  const { audio } = invitationConfig;
  const { status, toggle } = useMusicPlayer();
  const isPlaying = status === "playing";

  return (
    <button
      type="button"
      aria-pressed={isPlaying}
      aria-label={isPlaying ? audio.pauseLabel : audio.playLabel}
      onClick={() => toggle(audio.src)}
      className="fixed bottom-4 right-4 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full border border-body bg-surface pb-[env(safe-area-inset-bottom)] text-body shadow-md"
    >
      <PlayPauseIcon playing={isPlaying} className="h-4 w-4" />
    </button>
  );
}
