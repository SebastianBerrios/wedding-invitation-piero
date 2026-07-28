import { describe, expect, it } from "vitest";
import {
  getCountdownParts,
  msToNextSecond,
  padUnit,
  parseEventInstant,
} from "@/lib/countdown";

describe("parseEventInstant", () => {
  it("1. parses an ISO instant with an explicit -05:00 offset to the correct UTC epoch", () => {
    expect(parseEventInstant("2026-12-26T11:00:00-05:00")).toBe(
      Date.UTC(2026, 11, 26, 16, 0, 0),
    );
  });

  it("2. treats an equivalent Z-suffixed instant as the same epoch (offset equivalence)", () => {
    expect(parseEventInstant("2026-12-26T16:00:00Z")).toBe(
      parseEventInstant("2026-12-26T11:00:00-05:00"),
    );
  });

  it("3. throws on an offset-less instant (naive local time is a timezone bug)", () => {
    expect(() => parseEventInstant("2026-12-26T11:00:00")).toThrow();
  });

  it("4. throws on an unparseable string", () => {
    expect(() => parseEventInstant("not-a-date")).toThrow();
  });

  it("5. throws on an out-of-range month/day", () => {
    expect(() => parseEventInstant("2026-13-45T11:00:00-05:00")).toThrow();
  });
});

describe("getCountdownParts", () => {
  it("6. returns all zeros and isPast:true exactly at the target instant", () => {
    const t = Date.UTC(2026, 11, 26, 16, 0, 0);
    expect(getCountdownParts(t, t)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it("7. returns {0,0,0,1,isPast:false} one second before the target", () => {
    const t = Date.UTC(2026, 11, 26, 16, 0, 0);
    expect(getCountdownParts(t, t - 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      isPast: false,
    });
  });

  it("8. returns all zeros and isPast:true one second after the target", () => {
    const t = Date.UTC(2026, 11, 26, 16, 0, 0);
    expect(getCountdownParts(t, t + 1000)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
      isPast: true,
    });
  });

  it("9. decomposes 90_061_000 ms into 1 day, 1 hour, 1 minute, 1 second", () => {
    expect(getCountdownParts(90_061_000, 0)).toEqual({
      days: 1,
      hours: 1,
      minutes: 1,
      seconds: 1,
      isPast: false,
    });
  });

  it("10. truncates a sub-second remainder down, never rounds up", () => {
    expect(getCountdownParts(1500, 0)).toEqual({
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 1,
      isPast: false,
    });
  });

  it("13. spans a leap day correctly (2028-02-28 -> 2028-03-01 = 2 days), proving no calendar arithmetic", () => {
    const nowMs = Date.UTC(2028, 1, 28, 0, 0, 0); // Feb 28, 2028 (leap year)
    const targetMs = Date.UTC(2028, 2, 1, 0, 0, 0); // Mar 1, 2028
    const parts = getCountdownParts(targetMs, nowMs);
    expect(parts.days).toBe(2);
    expect(parts.isPast).toBe(false);
  });

  it("14. is independent of the caller's local timezone", () => {
    const targetMs = Date.UTC(2026, 11, 26, 16, 0, 0);
    const nowMs = Date.UTC(2026, 11, 25, 15, 30, 0);
    const originalTz = process.env.TZ;
    try {
      process.env.TZ = "America/Lima";
      const partsLima = getCountdownParts(targetMs, nowMs);
      process.env.TZ = "Pacific/Kiritimati";
      const partsKiritimati = getCountdownParts(targetMs, nowMs);
      expect(partsLima).toEqual(partsKiritimati);
    } finally {
      process.env.TZ = originalTz;
    }
  });
});

describe("padUnit", () => {
  it("11. keeps 3 digits without truncating a 100+ day span", () => {
    expect(padUnit(120)).toBe("120");
  });

  it("12. zero-pads to the default width of 2, and to an explicit width", () => {
    expect(padUnit(7)).toBe("07");
    expect(padUnit(7, 3)).toBe("007");
  });
});

describe("msToNextSecond", () => {
  it("15. returns a value in (0, 1000], mapping exact-second boundaries to 1000", () => {
    expect(msToNextSecond(5000)).toBe(1000);
    expect(msToNextSecond(5001)).toBe(999);
    expect(msToNextSecond(5999)).toBe(1);
  });
});
