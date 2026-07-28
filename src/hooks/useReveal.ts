"use client";

import { useEffect, useRef, useState } from "react";
import { shouldRevealImmediately } from "@/lib/reveal";

export interface UseRevealOptions {
  threshold?: number;
  rootMargin?: string;
}

/**
 * Scroll-reveal hook (design §10, work unit 8b). `revealed` starts `false`
 * on the server AND on the first client render (SSR-safe — no hydration
 * mismatch), and the observer is created only inside `useEffect`, so
 * `window`/`IntersectionObserver` are never touched at module scope or
 * during render.
 *
 * Once-only: the observer disconnects on the first intersection and never
 * re-hides the element on scroll-back.
 */
export function useReveal<T extends HTMLElement>(options?: UseRevealOptions) {
  const { threshold = 0.15, rootMargin = "0px 0px -10% 0px" } = options ?? {};
  const ref = useRef<T | null>(null);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Named + invoked (rather than an inline top-level `setRevealed(true)`)
    // to keep the reveal-bypass path readable as its own step, matching the
    // `Countdown` island's `tick()` convention elsewhere in this codebase.
    const revealImmediately = () => setRevealed(true);

    const reducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const hasIntersectionObserver = typeof IntersectionObserver !== "undefined";

    if (shouldRevealImmediately({ reducedMotion, hasIntersectionObserver })) {
      revealImmediately();
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setRevealed(true);
        observer.disconnect(); // once-only: never re-hides on scroll back
      },
      { threshold, rootMargin },
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  return { ref, revealed };
}
