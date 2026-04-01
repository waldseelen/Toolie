export async function translateTextToEnglish(
  text: string
): Promise<string | null> {
  const trimmed = text.trim();

  if (!trimmed) {
    return null;
  }

  const url = new URL(
    "https://translate.googleapis.com/translate_a/single"
  );
  url.searchParams.set("client", "gtx");
  url.searchParams.set("sl", "tr");
  url.searchParams.set("tl", "en");
  url.searchParams.set("dt", "t");
  url.searchParams.set("q", trimmed);

  const response = await fetch(url.toString(), {
    headers: {
      "User-Agent": "Toolie/1.0",
    },
  });

  if (!response.ok) {
    throw new Error(`Translation request failed: ${response.status}`);
  }

  const data = (await response.json()) as unknown;

  if (!Array.isArray(data) || !Array.isArray(data[0])) {
    return null;
  }

  const translated = (data[0] as unknown[])
    .map((part) =>
      Array.isArray(part) && typeof part[0] === "string" ? part[0] : ""
    )
    .join("")
    .trim();

  return translated || null;
}
