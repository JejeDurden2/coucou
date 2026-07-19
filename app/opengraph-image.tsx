import { ImageResponse } from "next/og";
import { tagline } from "@/content/site";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt =
  "Coucou IA : conseil et développement IA pour PME et ETI. On sait par où commencer.";

// Couleurs en dur car ImageResponse ne lit pas les tokens CSS de app/globals.css.
// Elles miroitent exactement --background, --foreground et --primary du design system.
const BACKGROUND = "#090b10";
const FOREGROUND = "#f3f5fa";
const BLUE = "#2fb6ff";

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
        <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
          <svg width="52" height="52" viewBox="0 0 32 32">
            <polygon
              fill={BLUE}
              points="12.25,6.3 5.53,8.93 2.6,16 5.53,23.07 12.25,25.7"
            />
            <path
              fill={BLUE}
              fillRule="evenodd"
              d="M12.95 6.15V25.85L19.67 23.07L22.45 17.74L22.11 12.91L19.79 9.05ZM15.1 12.1a2.1 2.1 0 1 0 4.2 0a2.1 2.1 0 1 0-4.2 0Z"
            />
            <polygon
              fill={BLUE}
              points="21.16,10.07 30.3,13.5 23.03,16.63 22.72,12.72"
            />
          </svg>
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
          <div style={{ display: "flex", width: 72, height: 4, backgroundColor: BLUE }} />
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
