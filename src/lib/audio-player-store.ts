"use client";

/**
 * `'use client'` module singleton sharing one playback state between the
 * Hero song button and the sticky music toggle (design §8, work unit 7).
 * The `HTMLAudioElement` is constructed lazily on the first user gesture —
 * nothing is fetched before that, so `preload="none"` holds by construction
 * and there is never an autoplay attempt.
 */

export type AudioStatus = "idle" | "playing" | "paused" | "error";

/** DOM events the lazily-created `<audio>` element emits; mapped 1:1 to a
 * store status by the pure `nextAudioStatus` reducer below. */
export type AudioDomEvent = "playing" | "pause" | "error";

/**
 * Pure reducer, extracted from the store so it is unit-testable without a
 * DOM `Audio` element.
 */
export function nextAudioStatus(domEvent: AudioDomEvent): AudioStatus {
  switch (domEvent) {
    case "playing":
      return "playing";
    case "pause":
      return "paused";
    case "error":
      return "error";
  }
}

export interface AudioSnapshot {
  status: AudioStatus;
}

// Constant identity: `getServerSnapshot` must always return the SAME
// reference so SSR and the first client render produce identical output.
const SERVER_SNAPSHOT: AudioSnapshot = { status: "idle" };

let audio: HTMLAudioElement | null = null;
// Cached snapshot object — `useSyncExternalStore`'s `getSnapshot` MUST
// return a stable reference between notifications, or every render is
// treated as "changed" and React re-renders in an infinite loop. Replaced
// only inside `setSnapshot`, never rebuilt per call.
let snapshot: AudioSnapshot = { status: "idle" };
const listeners = new Set<() => void>();

function setSnapshot(status: AudioStatus): void {
  if (snapshot.status === status) return;
  snapshot = { status };
  listeners.forEach((listener) => listener());
}

export const audioPlayerStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  },
  getSnapshot(): AudioSnapshot {
    return snapshot;
  },
  getServerSnapshot(): AudioSnapshot {
    return SERVER_SNAPSHOT;
  },
  /**
   * Toggles playback. Constructs the `<audio>` element on first call only
   * (first user gesture — never at module load, never at mount). Play
   * failures (missing file, decode error, autoplay policy) are caught and
   * surfaced as the `"error"` status rather than an unhandled rejection.
   */
  async toggle(src: string): Promise<void> {
    if (!audio) {
      audio = new Audio(src);
      audio.loop = true;
      audio.preload = "none";
      audio.addEventListener("playing", () =>
        setSnapshot(nextAudioStatus("playing")),
      );
      audio.addEventListener("pause", () =>
        setSnapshot(nextAudioStatus("pause")),
      );
      audio.addEventListener("error", () =>
        setSnapshot(nextAudioStatus("error")),
      );
    }

    if (snapshot.status === "playing") {
      audio.pause();
      return;
    }

    try {
      await audio.play();
    } catch {
      setSnapshot(nextAudioStatus("error"));
    }
  },
};
