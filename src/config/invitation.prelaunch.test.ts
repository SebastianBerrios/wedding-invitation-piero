import { describe, expect, it } from "vitest";
import { invitationConfig } from "@/config/invitation";
import { findPlaceholders } from "@/config/invitation.validate";

/**
 * Placeholders are legal pre-launch — this suite only runs as part of the
 * explicit pre-launch checklist (`PRELAUNCH=1 npm run test`), never as part
 * of the regular `npm run test` gate.
 */
describe.skipIf(!process.env.PRELAUNCH)("invitationConfig (pre-launch)", () => {
  it("contains no placeholder sentinels", () => {
    expect(findPlaceholders(invitationConfig)).toEqual([]);
  });
});
