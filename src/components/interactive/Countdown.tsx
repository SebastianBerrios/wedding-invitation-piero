"use client";

import { useEffect, useState } from "react";
import { invitationConfig } from "@/config/invitation";
import {
  getCountdownParts,
  msToNextSecond,
  padUnit,
  parseEventInstant,
  type CountdownParts,
} from "@/lib/countdown";

/**
 * Client island (design §6, work unit 6a). Reuses `lib/countdown.ts` — no
 * countdown math is reimplemented here.
 *
 * `targetMs` is computed once at module scope (not per render/tick).
 */
const targetMs = parseEventInstant(invitationConfig.event.isoInstant);

const UNIT_WIDTHS = {
  days: "min-w-[3ch]",
  hours: "min-w-[2ch]",
  minutes: "min-w-[2ch]",
  seconds: "min-w-[2ch]",
} as const;

/**
 * `parts` starts `null` on the server AND on the first client render (React
 * 19 does not run effects during SSR or hydration), so both emit the exact
 * same `--` placeholder markup — hydration output is byte-identical and
 * `suppressHydrationWarning` is unnecessary (design R1).
 */
export function Countdown() {
  const [parts, setParts] = useState<CountdownParts | null>(null);

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout> | undefined;

    const tick = () => {
      const now = Date.now();
      const next = getCountdownParts(targetMs, now);
      setParts(next);
      // Past-date state stops rescheduling — no more ticks once arrived.
      if (!next.isPast) {
        timeoutId = setTimeout(tick, msToNextSecond(now));
      }
    };

    tick();

    // Background tabs throttle timers to >=1 min, so displayed values go
    // stale while hidden; force an immediate recompute on return.
    const onVisibilityChange = () => {
      if (document.visibilityState === "visible") {
        clearTimeout(timeoutId);
        tick();
      }
    };
    document.addEventListener("visibilitychange", onVisibilityChange);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", onVisibilityChange);
    };
  }, []);

  const { unitLabels, countdownReachedLabel } = invitationConfig.letter;

  if (parts?.isPast) {
    return (
      <p className="font-caps text-2xl text-ink">{countdownReachedLabel}</p>
    );
  }

  const units: Array<{ key: keyof typeof UNIT_WIDTHS; label: string }> = [
    { key: "days", label: unitLabels.days },
    { key: "hours", label: unitLabels.hours },
    { key: "minutes", label: unitLabels.minutes },
    { key: "seconds", label: unitLabels.seconds },
  ];

  return (
    <div
      aria-hidden="true"
      className="flex items-start justify-center gap-4 sm:gap-6"
    >
      {units.map((unit) => (
        <div key={unit.key} className="flex flex-col items-center gap-1">
          <span
            className={`inline-block text-center font-caps text-3xl tabular-nums text-ink ${UNIT_WIDTHS[unit.key]}`}
          >
            {parts ? padUnit(parts[unit.key]) : "--"}
          </span>
          <span className="font-caps text-xs uppercase tracking-caps text-body">
            {unit.label}
          </span>
        </div>
      ))}
    </div>
  );
}
