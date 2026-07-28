/**
 * Pure, timezone-correct countdown math (design §6). No imports, no
 * `Date.now()` inside — every function takes its "now" as an argument so it
 * stays fully testable and reusable from a self-correcting client timer.
 */

export interface CountdownParts {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isPast: boolean;
}

const ISO_INSTANT_RE =
  /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:Z|[+-]\d{2}:\d{2})$/;

const MS_PER_SECOND = 1000;
const SECONDS_PER_DAY = 24 * 60 * 60;
const SECONDS_PER_HOUR = 60 * 60;
const SECONDS_PER_MINUTE = 60;

/**
 * Parses an ISO-8601 instant that MUST carry an explicit UTC offset or `Z`.
 * Throws on anything else, including offset-less "naive local time" strings
 * (a real timezone bug source) and out-of-range dates.
 */
export function parseEventInstant(iso: string): number {
  if (!ISO_INSTANT_RE.test(iso)) {
    throw new Error(
      `parseEventInstant: "${iso}" must be an ISO-8601 instant with an explicit offset or "Z"`,
    );
  }
  const ms = Date.parse(iso);
  if (!Number.isFinite(ms)) {
    throw new Error(`parseEventInstant: "${iso}" is not a valid date`);
  }
  return ms;
}

/**
 * Floor-truncated remaining time between `nowMs` and `targetMs`. Clamps to
 * all-zero + `isPast: true` once `nowMs >= targetMs`. Pure epoch-ms
 * arithmetic only — no `Date` instance methods — so the result is
 * independent of the caller's local timezone.
 */
export function getCountdownParts(
  targetMs: number,
  nowMs: number,
): CountdownParts {
  const remainingMs = targetMs - nowMs;
  if (remainingMs <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isPast: true };
  }

  const totalSeconds = Math.floor(remainingMs / MS_PER_SECOND);
  const days = Math.floor(totalSeconds / SECONDS_PER_DAY);
  const hours = Math.floor(
    (totalSeconds % SECONDS_PER_DAY) / SECONDS_PER_HOUR,
  );
  const minutes = Math.floor(
    (totalSeconds % SECONDS_PER_HOUR) / SECONDS_PER_MINUTE,
  );
  const seconds = totalSeconds % SECONDS_PER_MINUTE;

  return { days, hours, minutes, seconds, isPast: false };
}

/**
 * Zero-pads `value` to `width` (default 2). Never truncates values wider
 * than `width` (e.g. a 3-digit day count stays 3 digits).
 */
export function padUnit(value: number, width = 2): string {
  return String(value).padStart(width, "0");
}

/** Milliseconds until the next whole-second boundary, in the range (0, 1000]. */
export function msToNextSecond(nowMs: number): number {
  const remainder = nowMs % MS_PER_SECOND;
  return remainder === 0 ? MS_PER_SECOND : MS_PER_SECOND - remainder;
}
