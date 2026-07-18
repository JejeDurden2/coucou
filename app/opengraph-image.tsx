import { ImageResponse } from "next/og";
import { tagline } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Coucou IA : conseil et développement IA pour PME et ETI, ROI garanti.";

// Couleurs en dur car ImageResponse ne lit pas les tokens CSS de app/globals.css.
// Elles miroitent exactement --background, --foreground et --primary du design system.
const BACKGROUND = "#090a0d";
const FOREGROUND = "#f3f5f8";
const LIME = "#aff03c";

export default function OpengraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          width: "100%",
          height: "100%",
          backgroundColor: BACKGROUND,
          padding: "80px",
          fontFamily: "system-ui, sans-serif",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{ width: 16, height: 16, backgroundColor: LIME }} />
          <span
            style={{
              fontSize: 34,
              fontWeight: 700,
              color: FOREGROUND,
              letterSpacing: "-0.02em",
            }}
          >
            Coucou IA
          </span>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 28 }}>
          <div style={{ display: "flex", width: 72, height: 4, backgroundColor: LIME }} />
          <div
            style={{
              display: "flex",
              fontSize: 54,
              fontWeight: 700,
              lineHeight: 1.2,
              color: FOREGROUND,
              maxWidth: 980,
              letterSpacing: "-0.02em",
            }}
          >
            {tagline}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
