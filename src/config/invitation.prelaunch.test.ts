import { describe, expect, it } from "vitest";
import { invitationConfig } from "@/config/invitation";
import {
  findPlaceholders,
  findMissingAssets,
} from "@/config/invitation.validate";

/**
 * Placeholders are legal pre-launch — this suite only runs as part of the
 * explicit pre-launch checklist (`PRELAUNCH=1 npm run test`), never as part
 * of the regular `npm run test` gate.
 */
describe.skipIf(!process.env.PRELAUNCH)("invitationConfig (pre-launch)", () => {
  it("contains no placeholder sentinels", () => {
    expect(findPlaceholders(invitationConfig)).toEqual([]);
  });

  /**
   * Visible asset placeholders exist so the couple/developer can SEE exactly
   * what is missing and where to drop it — but that only works as a
   * safeguard if a page with any of them still unfilled cannot reach guests.
   * This assertion is the gate: it fails, and Vitest's diff enumerates every
   * remaining slot by its exact config path, for as long as one asset slot
   * has not been filled in.
   */
  it("has every optional asset slot filled in (no visible placeholders left)", () => {
    expect(findMissingAssets(invitationConfig)).toEqual([]);
  });
});
