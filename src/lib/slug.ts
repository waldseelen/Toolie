const TURKISH_CHAR_MAP: Record<string, string> = {
  c: "c",
  C: "c",
  g: "g",
  G: "g",
  i: "i",
  I: "i",
  o: "o",
  O: "o",
  s: "s",
  S: "s",
  u: "u",
  U: "u",
};

const TURKISH_CHAR_REGEX = /[çÇğĞıİöÖşŞüÜ]/g;

export function slugify(text: string): string {
  return text
    .replace(TURKISH_CHAR_REGEX, (char) => {
      switch (char) {
        case "ç":
        case "Ç":
          return TURKISH_CHAR_MAP.c;
        case "ğ":
        case "Ğ":
          return TURKISH_CHAR_MAP.g;
        case "ı":
        case "İ":
          return TURKISH_CHAR_MAP.i;
        case "ö":
        case "Ö":
          return TURKISH_CHAR_MAP.o;
        case "ş":
        case "Ş":
          return TURKISH_CHAR_MAP.s;
        case "ü":
        case "Ü":
          return TURKISH_CHAR_MAP.u;
        default:
          return char;
      }
    })
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function createUniqueSlug(
  text: string,
  usedSlugs: ReadonlySet<string>
): string {
  const baseSlug = slugify(text) || "tool";

  if (!usedSlugs.has(baseSlug)) {
    return baseSlug;
  }

  let counter = 2;
  let candidate = `${baseSlug}-${counter}`;

  while (usedSlugs.has(candidate)) {
    counter += 1;
    candidate = `${baseSlug}-${counter}`;
  }

  return candidate;
}
