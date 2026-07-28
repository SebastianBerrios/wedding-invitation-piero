/**
 * Pure decision logic for `useReveal` (design §10, work unit 8b): whether
 * the reveal transition should be skipped and content shown immediately,
 * rather than waiting for an `IntersectionObserver` entry. Extracted so the
 * client hook stays thin plumbing around `IntersectionObserver`/
 * `matchMedia` — matching the `audio-player-store` / `nextAudioStatus`
 * precedent (pure reducer extracted from a stateful client module).
 */
export function shouldRevealImmediately(input: {
  reducedMotion: boolean;
  hasIntersectionObserver: boolean;
}): boolean {
  return input.reducedMotion || !input.hasIntersectionObserver;
}
