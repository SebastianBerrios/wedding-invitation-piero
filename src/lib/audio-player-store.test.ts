import { describe, expect, it } from "vitest";
import { nextAudioStatus } from "@/lib/audio-player-store";

describe("nextAudioStatus", () => {
  it("1. maps the 'playing' DOM event to the 'playing' status", () => {
    expect(nextAudioStatus("playing")).toBe("playing");
  });

  it("2. maps the 'pause' DOM event to the 'paused' status", () => {
    expect(nextAudioStatus("pause")).toBe("paused");
  });

  it("3. maps the 'error' DOM event to the 'error' status", () => {
    expect(nextAudioStatus("error")).toBe("error");
  });
});
