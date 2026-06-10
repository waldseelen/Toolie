import { TAXONOMY } from "@/lib/taxonomy";

/* ── Category visual metadata ── */

export const CATEGORY_COLORS: Record<string, string> = Object.fromEntries(
  TAXONOMY.map((category) => [category.key, category.color])
);

export const CATEGORY_ICONS: Record<string, string> = Object.fromEntries(
  TAXONOMY.map((category) => [category.key, category.icon])
);

/* ── Pixel-art fallback SVG for missing favicons ── */
export const FAVICON_FALLBACK =
  "data:image/svg+xml," +
  encodeURIComponent(
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" shape-rendering="crispEdges">' +
      '<rect width="16" height="16" fill="#1e1e2e"/>' +
      '<path d="M2 2h10l2 2v10H2V2zm1 1v10h10V4.4L11.6 3H3z" fill="#a6e3a1"/>' +
      '<rect x="4" y="3" width="6" height="4" fill="#a6e3a1"/>' +
      '<rect x="5" y="8" width="6" height="5" fill="#313244"/>' +
      '<rect x="7" y="9" width="2" height="3" fill="#a6e3a1"/>' +
      '</svg>'
  );

/* ── App metadata ── */
export const APP_TITLE = "TOOLIE v1.0";
export const APP_DESCRIPTION =
  "Retro Araç Kataloğu — 378+ araç, 7 kategori, pixel-art tasarım";
