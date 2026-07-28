/**
 * Self-authored, decorative play/pause glyph shared by `HeroSongButton` and
 * `StickyMusicToggle`. Always `aria-hidden` — the accessible name comes from
 * the parent button's `aria-label`.
 */
export function PlayPauseIcon({
  playing,
  className,
}: {
  playing: boolean;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      className={className}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
    >
      {playing ? (
        <>
          <rect x="5" y="4" width="5" height="16" />
          <rect x="14" y="4" width="5" height="16" />
        </>
      ) : (
        <path d="M6 4l14 8-14 8V4z" />
      )}
    </svg>
  );
}
