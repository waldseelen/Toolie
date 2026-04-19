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
    '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16">' +
      '<rect width="16" height="16" fill="#222"/>' +
      '<text x="8" y="12" text-anchor="middle" fill="#39ff14" font-size="10">?</text>' +
      "</svg>"
  );

/* ── App metadata ── */
export const APP_TITLE = "TOOLIE v1.0";
export const APP_DESCRIPTION =
  "Retro Araç Kataloğu — 378+ araç, 7 kategori, pixel-art tasarım";
