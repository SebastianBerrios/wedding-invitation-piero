import { ImageResponse } from "next/og";
import { invitationConfig } from "@/config/invitation";

/**
 * Replaces the `create-next-app` scaffold favicon (25.9 KB, ASSETS.md
 * flagged it as a non-blocking pre-launch polish item) with a tiny,
 * self-authored monogram icon generated at build time — no external asset,
 * no runtime cost (prerendered once, same as every other static route
 * output). Visually consistent with `decor/Monogram.tsx`'s seal treatment:
 * ink ring + initials on the cream surface color, just rasterized small.
 */
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#fef9f0",
          border: "1.5px solid #0f1015",
          borderRadius: "50%",
          color: "#0f1015",
          fontSize: 13,
          letterSpacing: 1,
        }}
      >
        {invitationConfig.couple.monogram}
      </div>
    ),
    { ...size },
  );
}
