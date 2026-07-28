import { describe, expect, it, vi } from "vitest";
import { copyToClipboard } from "@/lib/clipboard";

describe("copyToClipboard", () => {
  it("1. returns 'unsupported' when the clipboard is undefined", async () => {
    expect(await copyToClipboard("123", undefined)).toBe("unsupported");
  });

  it("2. returns 'unsupported' when the clipboard is null", async () => {
    expect(await copyToClipboard("123", null)).toBe("unsupported");
  });

  it("3. returns 'unsupported' when writeText is not a function", async () => {
    // @ts-expect-error - intentionally malformed clipboard-like object
    expect(await copyToClipboard("123", {})).toBe("unsupported");
  });

  it("4. calls writeText with the exact text and returns 'copied' on success", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    const result = await copyToClipboard("194-1234567-0-12", { writeText });
    expect(result).toBe("copied");
    expect(writeText).toHaveBeenCalledWith("194-1234567-0-12");
    expect(writeText).toHaveBeenCalledTimes(1);
  });

  it("5. returns 'failed' when writeText rejects, without throwing", async () => {
    const writeText = vi.fn().mockRejectedValue(new Error("denied"));
    const result = await copyToClipboard("123", { writeText });
    expect(result).toBe("failed");
  });
});
