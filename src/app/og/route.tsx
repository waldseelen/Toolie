import { ImageResponse } from "@vercel/og";

export const runtime = "edge";
const imageSize = {
  width: 1200,
  height: 630,
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title") || "TOOLIE";
  const subtitle = searchParams.get("subtitle") || "Retro Tool Catalog";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: "48px",
          background:
            "radial-gradient(circle at top left, #89dceb 0%, #313244 32%, #1e1e2e 100%)",
          color: "#f5e0dc",
          fontFamily: "monospace",
          border: "12px solid #a6e3a1",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between" }}>
          <div style={{ fontSize: 26, letterSpacing: 4 }}>[ TOOLIE ]</div>
          <div style={{ fontSize: 22, color: "#a6e3a1" }}>RETRO DISCOVERY</div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
          <div
            style={{
              fontSize: 72,
              lineHeight: 1.1,
              fontWeight: 700,
              maxWidth: "92%",
            }}
          >
            {title}
          </div>
          <div
            style={{
              fontSize: 30,
              lineHeight: 1.4,
              color: "#cdd6f4",
              maxWidth: "88%",
            }}
          >
            {subtitle}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            fontSize: 22,
            color: "#89dceb",
          }}
        >
          <span>toolie</span>
          <span>pixel-art catalog</span>
        </div>
      </div>
    ),
    imageSize
  );
}
