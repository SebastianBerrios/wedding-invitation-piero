import { describe, expect, it } from "vitest";
import { APP_NAME } from "@/lib/sanity";

describe("Vitest environment sanity check", () => {
  it("resolves the '@/' path alias to src/ so later suites can trust it", () => {
    expect(APP_NAME).toBe("wedding-invitation-piero");
  });
});
