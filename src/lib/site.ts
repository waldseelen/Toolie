const DEFAULT_SITE_URL = "http://localhost:3000";

export const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || DEFAULT_SITE_URL
).replace(/\/+$/, "");

export function absoluteUrl(path = "/"): string {
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${siteUrl}${normalizedPath}`;
}

export function buildOgImageUrl(title: string, subtitle?: string): string {
  const params = new URLSearchParams({ title });

  if (subtitle) {
    params.set("subtitle", subtitle);
  }

  return absoluteUrl(`/og?${params.toString()}`);
}
