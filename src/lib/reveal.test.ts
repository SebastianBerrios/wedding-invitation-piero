import { describe, expect, it } from "vitest";
import { shouldRevealImmediately } from "@/lib/reveal";

describe("shouldRevealImmediately", () => {
  it("returns true when prefers-reduced-motion is active, even if IntersectionObserver exists", () => {
    expect(
      shouldRevealImmediately({ reducedMotion: true, hasIntersectionObserver: true }),
    ).toBe(true);
  });

  it("returns true when IntersectionObserver is unavailable, even without reduced motion", () => {
    expect(
      shouldRevealImmediately({ reducedMotion: false, hasIntersectionObserver: false }),
    ).toBe(true);
  });

  it("returns true when both conditions call for bypassing the observer", () => {
    expect(
      shouldRevealImmediately({ reducedMotion: true, hasIntersectionObserver: false }),
    ).toBe(true);
  });

  it("returns false when motion is allowed and IntersectionObserver exists", () => {
    expect(
      shouldRevealImmediately({ reducedMotion: false, hasIntersectionObserver: true }),
    ).toBe(false);
  });
});
