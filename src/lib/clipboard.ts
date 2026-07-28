/**
 * Pure, dependency-injected clipboard-copy decision (spec `gift-account-copy`
 * — "Clipboard API Copy" + "Select-and-Copy Fallback"). Takes the clipboard
 * implementation as a parameter instead of reading `navigator.clipboard`
 * itself, so it is fully unit-testable without a browser/DOM.
 */
export interface ClipboardLike {
  writeText(text: string): Promise<void>;
}

export type CopyResult = "copied" | "unsupported" | "failed";

/**
 * Attempts `clipboard.writeText(text)`. Returns:
 * - `"unsupported"` when no usable Clipboard API is passed (undefined/null,
 *   or missing `writeText`) — the caller should fall back to select-and-copy.
 * - `"copied"` on success.
 * - `"failed"` when `writeText` rejects (e.g. permission denied) — never
 *   throws.
 */
export async function copyToClipboard(
  text: string,
  clipboard: ClipboardLike | null | undefined,
): Promise<CopyResult> {
  if (!clipboard || typeof clipboard.writeText !== "function") {
    return "unsupported";
  }

  try {
    await clipboard.writeText(text);
    return "copied";
  } catch {
    return "failed";
  }
}
