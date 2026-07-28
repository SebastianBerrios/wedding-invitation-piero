"use client";

import type { ReactNode } from "react";
import { useReveal } from "@/hooks/useReveal";

/**
 * Client wrapper passing server `children` through untouched (design §10,
 * work unit 8b). This is the ONLY client boundary the reveal feature adds
 * around the seven sections — sections themselves stay server components.
 *
 * The hidden state is scoped entirely to the `.reveal-ready` class that
 * `layout.tsx`'s inline script adds post-hydration (see globals.css). If JS
 * never runs (disabled, or hydration fails), that class never lands and
 * `[data-reveal="idle"]` renders fully visible by default — content is
 * never trapped invisible.
 */
export function RevealOnScroll({ children }: { children: ReactNode }) {
  const { ref, revealed } = useReveal<HTMLDivElement>();
  return (
    <div ref={ref} data-reveal={revealed ? "shown" : "idle"}>
      {children}
    </div>
  );
}
