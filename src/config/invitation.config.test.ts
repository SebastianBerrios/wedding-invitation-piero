import { describe, expect, it } from "vitest";
import { invitationConfig } from "@/config/invitation";
import { validateInvitationConfig } from "@/config/invitation.validate";

describe("invitationConfig", () => {
  it("passes every structural and semantic invariant", () => {
    expect(validateInvitationConfig(invitationConfig)).toEqual([]);
  });
});
