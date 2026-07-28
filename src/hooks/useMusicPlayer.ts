"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  audioPlayerStore,
  type AudioSnapshot,
  type AudioStatus,
} from "@/lib/audio-player-store";

export interface UseMusicPlayerResult {
  status: AudioStatus;
  toggle: (src: string) => void;
}

/**
 * `useSyncExternalStore` binding over the shared `audioPlayerStore` (design
 * §8). `getSnapshot`/`getServerSnapshot` both return the store's cached
 * object identity — never a fresh literal per call — which is what avoids
 * the infinite-render-loop footgun.
 */
export function useMusicPlayer(): UseMusicPlayerResult {
  const snapshot: AudioSnapshot = useSyncExternalStore(
    audioPlayerStore.subscribe,
    audioPlayerStore.getSnapshot,
    audioPlayerStore.getServerSnapshot,
  );

  const toggle = useCallback((src: string) => {
    void audioPlayerStore.toggle(src);
  }, []);

  return { status: snapshot.status, toggle };
}
