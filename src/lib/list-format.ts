/**
 * Pure list formatting for guest-facing prose.
 *
 * Kept here rather than inline in a section component for the usual reason:
 * a variable-length join with a special case for one and two items is logic,
 * and logic belongs somewhere a unit test can reach it without a browser.
 */

/**
 * Joins `items` into one readable clause: `"A"`, `"A y B"`, `"A, B y C"`.
 *
 * The conjunction is a PARAMETER, never a literal, because it is Spanish
 * guest-facing copy and every content string in this project comes from
 * `src/config/invitation.ts` (spec `invitation-content-config`, "Single Source
 * of Truth"). That also means the caller can supply `"e"` where Spanish
 * requires it before an `i-`/`hi-` sound, which this function has no business
 * deciding.
 *
 * No Oxford comma: Spanish does not use one.
 */
export function joinWithConjunction(
  items: readonly string[],
  conjunction: string,
): string {
  if (items.length === 0) {
    return "";
  }
  if (items.length === 1) {
    return items[0];
  }
  const head = items.slice(0, -1);
  const tail = items[items.length - 1];
  return `${head.join(", ")} ${conjunction} ${tail}`;
}
