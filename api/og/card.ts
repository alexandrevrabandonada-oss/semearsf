import { createElement } from "react";

type OgKind = "dados" | "blog" | "acervo" | "relatorios" | "dossies" | "boletim" | "corredores" | string;

type OgParams = {
  kind: OgKind;
  title: string;
  subtitle: string;
  footer: string;
  pm25?: string;
  pm10?: string;
  time?: string;
};

const DEFAULT_FOOTER = "SEMEAR • UFF • EMENDA PARLAMENTAR";
const WIDTH = 1200;
const HEIGHT = 630;

function escapeHtml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function normalizeText(value: unknown, maxLength: number) {
  return escapeHtml(String(value ?? "")).slice(0, maxLength);
}

function getKindLabel(kind: string) {
  switch (kind.toUpperCase()) {
    case "DADOS":
      return "DADOS EM TEMPO REAL";
    case "BLOG":
      return "BLOG";
    case "ACERVO":
      return "ACERVO";
    case "RELATORIOS":
      return "RELATORIOS";
    case "DOSSIES":
      return "DOSSIES";
    case "BOLETIM":
      return "BOLETIM";
    case "CORREDORES":
      return "CORREDORES";
    default:
      return "SEMEAR";
  }
}

function buildSvg(params: OgParams) {
  const safeTitle = normalizeText(params.title, 100);
  const safeSubtitle = normalizeText(params.subtitle, 180);
  const safeFooter = normalizeText(params.footer || DEFAULT_FOOTER, 100);
  const safeKind = escapeHtml(getKindLabel(params.kind));

  const metrics = params.kind.toUpperCase() === "DADOS" && params.pm25 && params.pm10 && params.time
    ? `
      <g transform="translate(86, 290)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#94A3B8">PM2.5</text>
        <text x="0" y="70" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="#10B981">${escapeHtml(params.pm25)} <tspan font-size="24" fill="#CBD5E1">µg/m³</tspan></text>
      </g>
      <g transform="translate(390, 290)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#94A3B8">PM10</text>
        <text x="0" y="70" font-family="Inter, Arial, sans-serif" font-size="64" font-weight="900" fill="#F59E0B">${escapeHtml(params.pm10)} <tspan font-size="24" fill="#CBD5E1">µg/m³</tspan></text>
      </g>
      <g transform="translate(86, 480)">
        <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="24" font-weight="700" fill="#94A3B8">Atualizado</text>
        <text x="0" y="38" font-family="Inter, Arial, sans-serif" font-size="28" font-weight="800" fill="#E2E8F0">${escapeHtml(params.time)}</text>
      </g>
    `
    : "";

  const subtitleBlock = safeSubtitle
    ? `
      <foreignObject x="86" y="250" width="1030" height="220">
        <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; color: #94A3B8; font-size: 28px; line-height: 1.4; font-weight: 500; display: flex; align-items: center;">
          <div style="display: -webkit-box; -webkit-line-clamp: 3; -webkit-box-orient: vertical; overflow: hidden;">${safeSubtitle}</div>
        </div>
      </foreignObject>
    `
    : "";

  return `<?xml version="1.0" encoding="UTF-8"?>
<svg width="${WIDTH}" height="${HEIGHT}" viewBox="0 0 ${WIDTH} ${HEIGHT}" fill="none" xmlns="http://www.w3.org/2000/svg" role="img" aria-labelledby="title desc">
  <title id="title">${safeTitle}</title>
  <desc id="desc">${safeSubtitle}</desc>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1200" y2="630" gradientUnits="userSpaceOnUse">
      <stop offset="0" stop-color="#09121B" />
      <stop offset="0.55" stop-color="#0E1724" />
      <stop offset="1" stop-color="#0A0F16" />
    </linearGradient>
    <radialGradient id="glow" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(940 120) rotate(140) scale(540 340)">
      <stop stop-color="#22D3EE" stop-opacity="0.36" />
      <stop offset="1" stop-color="#22D3EE" stop-opacity="0" />
    </radialGradient>
    <radialGradient id="accent" cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(190 520) rotate(45) scale(420 220)">
      <stop stop-color="#10B981" stop-opacity="0.26" />
      <stop offset="1" stop-color="#10B981" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="${WIDTH}" height="${HEIGHT}" fill="url(#bg)" />
  <rect width="${WIDTH}" height="8" fill="#22D3EE" />
  <circle cx="1000" cy="110" r="260" fill="url(#glow)" />
  <circle cx="210" cy="520" r="220" fill="url(#accent)" />
  <g transform="translate(86, 98)">
    <rect x="0" y="0" width="142" height="54" rx="18" fill="rgba(255,255,255,0.06)" stroke="rgba(255,255,255,0.10)" />
    <text x="24" y="35" font-family="Inter, Arial, sans-serif" font-size="22" font-weight="800" fill="#22D3EE" letter-spacing="4">${safeKind}</text>
  </g>
  <foreignObject x="86" y="170" width="1030" height="120">
    <div xmlns="http://www.w3.org/1999/xhtml" style="font-family: Inter, Arial, sans-serif; display: flex; flex-direction: column; gap: 12px;">
      <div style="font-size: 64px; line-height: 1.08; font-weight: 900; color: #F8FAFC; letter-spacing: -0.03em;">${safeTitle}</div>
    </div>
  </foreignObject>
  ${subtitleBlock}
  ${metrics}
  <g transform="translate(86, 572)">
    <text x="0" y="0" font-family="Inter, Arial, sans-serif" font-size="18" font-weight="800" fill="#94A3B8" letter-spacing="2">${safeFooter}</text>
  </g>
</svg>`;
}

async function tryBuildPng(params: OgParams): Promise<Uint8Array | null> {
  try {
    const { ImageResponse } = await import("@vercel/og");

    const png = new ImageResponse(
      createElement(
        "div",
        {
          style: {
            width: "100%",
            height: "100%",
            display: "flex",
            position: "relative",
            color: "#F8FAFC",
            background: "linear-gradient(135deg, #09121B 0%, #0E1724 55%, #0A0F16 100%)",
            fontFamily: "Inter, Arial, sans-serif",
            overflow: "hidden"
          }
        },
        createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            background: "radial-gradient(circle at 80% 18%, rgba(34,211,238,0.35), transparent 36%), radial-gradient(circle at 18% 82%, rgba(16,185,129,0.24), transparent 30%)"
          }
        }),
        createElement("div", {
          style: {
            position: "absolute",
            inset: 0,
            borderTop: "8px solid #22D3EE"
          }
        }),
        createElement(
          "div",
          {
            style: {
              display: "flex",
              flexDirection: "column",
              padding: "72px 86px",
              width: "100%",
              position: "relative"
            }
          },
          createElement(
            "div",
            {
              style: {
                display: "inline-flex",
                alignItems: "center",
                alignSelf: "flex-start",
                padding: "14px 22px",
                borderRadius: 18,
                backgroundColor: "rgba(255,255,255,0.06)",
                border: "1px solid rgba(255,255,255,0.08)",
                color: "#22D3EE",
                fontSize: 22,
                fontWeight: 800,
                letterSpacing: 4
              }
            },
            getKindLabel(params.kind)
          ),
          createElement(
            "div",
            {
              style: {
                marginTop: 26,
                fontSize: 64,
                lineHeight: 1.08,
                fontWeight: 900,
                letterSpacing: "-0.03em",
                color: "#F8FAFC",
                maxWidth: 1060
              }
            },
            params.title
          ),
          params.subtitle
            ? createElement(
                "div",
                {
                  style: {
                    marginTop: 24,
                    fontSize: 30,
                    lineHeight: 1.35,
                    color: "#94A3B8",
                    maxWidth: 1040,
                    display: "-webkit-box",
                    WebkitLineClamp: 3,
                    WebkitBoxOrient: "vertical",
                    overflow: "hidden"
                  }
                },
                params.subtitle
              )
            : null,
          params.kind.toUpperCase() === "DADOS" && params.pm25 && params.pm10 && params.time
            ? createElement(
                "div",
                {
                  style: {
                    display: "flex",
                    gap: 48,
                    marginTop: 48
                  }
                },
                createElement(
                  "div",
                  { style: { display: "flex", flexDirection: "column" } },
                  createElement(
                    "div",
                    { style: { fontSize: 24, color: "#94A3B8", textTransform: "uppercase", fontWeight: 800, letterSpacing: 2 } },
                    "PM2.5"
                  ),
                  createElement(
                    "div",
                    { style: { fontSize: 58, fontWeight: 900, color: "#10B981", marginTop: 10 } },
                    params.pm25,
                    createElement("span", { style: { fontSize: 24, color: "#CBD5E1", marginLeft: 10 } }, "µg/m³")
                  )
                ),
                createElement(
                  "div",
                  { style: { display: "flex", flexDirection: "column" } },
                  createElement(
                    "div",
                    { style: { fontSize: 24, color: "#94A3B8", textTransform: "uppercase", fontWeight: 800, letterSpacing: 2 } },
                    "PM10"
                  ),
                  createElement(
                    "div",
                    { style: { fontSize: 58, fontWeight: 900, color: "#F59E0B", marginTop: 10 } },
                    params.pm10,
                    createElement("span", { style: { fontSize: 24, color: "#CBD5E1", marginLeft: 10 } }, "µg/m³")
                  )
                )
              )
            : null,
          params.kind.toUpperCase() === "DADOS" && params.time
            ? createElement(
                "div",
                { style: { marginTop: 28, fontSize: 24, fontWeight: 800, color: "#94A3B8" } },
                `Atualizado: ${params.time}`
              )
            : null,
          createElement(
            "div",
            {
              style: {
                marginTop: "auto",
                paddingTop: 48,
                fontSize: 18,
                fontWeight: 800,
                color: "#94A3B8",
                letterSpacing: 2
              }
            },
            params.footer || DEFAULT_FOOTER
          )
        )
      ),
      {
        width: WIDTH,
        height: HEIGHT,
        headers: {
          "Cache-Control": "public, max-age=86400, immutable"
        }
      }
    );

    return new Uint8Array(await png.arrayBuffer());
  } catch (error) {
    console.warn("[og/card] PNG render unavailable, falling back to SVG:", error);
    return null;
  }
}

export default async function handler(req: any, res: any) {
  const { kind = "SEMEAR", title = "", subtitle = "", footer = "", pm25, pm10, time } = req.query;

  const params: OgParams = {
    kind: String(kind),
    title: String(title),
    subtitle: String(subtitle),
    footer: String(footer || DEFAULT_FOOTER),
    pm25: typeof pm25 === "string" ? pm25 : undefined,
    pm10: typeof pm10 === "string" ? pm10 : undefined,
    time: typeof time === "string" ? time : undefined
  };

  const png = await tryBuildPng(params);
  if (png) {
    res.setHeader("Content-Type", "image/png");
    res.setHeader("Cache-Control", "public, max-age=86400, immutable");
    return res.status(200).send(Buffer.from(png));
  }

  const svg = buildSvg(params);
  res.setHeader("Content-Type", "image/svg+xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=86400, immutable");
  return res.status(200).send(svg);
}
