"use client";

import { useRef, useState } from "react";
import { invitationConfig } from "@/config/invitation";
import { copyToClipboard } from "@/lib/clipboard";

type CopyStatus = "idle" | "copied" | "failed";
const FEEDBACK_TIMEOUT_MS = 2000;

/**
 * Client island (design §7, work unit 6b). The account number itself is
 * always rendered as visible plain text by the parent section — this
 * component only owns the copy affordance. Reuses the pure
 * `lib/clipboard.ts` decision helper rather than reimplementing the
 * guarded-API/fallback branching here.
 */
export function CopyAccountButton({
  accountNumber,
}: {
  accountNumber: string;
}) {
  const { gifts } = invitationConfig;
  const [status, setStatus] = useState<CopyStatus>("idle");
  const fallbackInputRef = useRef<HTMLInputElement>(null);

  const showFeedback = (next: CopyStatus) => {
    setStatus(next);
    window.setTimeout(() => setStatus("idle"), FEEDBACK_TIMEOUT_MS);
  };

  const handleClick = async () => {
    const clipboard =
      typeof navigator !== "undefined" ? navigator.clipboard : undefined;
    const result = await copyToClipboard(accountNumber, clipboard);

    if (result === "copied") {
      showFeedback("copied");
      return;
    }

    // Clipboard API unavailable or blocked: select the account number in a
    // visually hidden input so the guest can still copy manually
    // (Ctrl/Cmd+C) — spec "Select-and-Copy Fallback".
    const input = fallbackInputRef.current;
    if (input) {
      input.focus();
      input.select();
    }

    if (result === "failed") {
      showFeedback("failed");
    }
  };

  const label =
    status === "copied"
      ? gifts.copiedLabel
      : status === "failed"
        ? gifts.copyFailedLabel
        : gifts.copyLabel;

  return (
    <>
      <input
        ref={fallbackInputRef}
        type="text"
        readOnly
        value={accountNumber}
        aria-hidden="true"
        tabIndex={-1}
        className="sr-only"
      />
      <button
        type="button"
        onClick={handleClick}
        aria-live="polite"
        className="mt-3 inline-flex min-h-11 items-center gap-2 rounded-full border border-body px-5 py-1.5 font-caps text-sm uppercase tracking-caps text-body"
      >
        {label}
      </button>
    </>
  );
}
