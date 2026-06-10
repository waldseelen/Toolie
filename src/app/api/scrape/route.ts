import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const targetUrl = searchParams.get("url");

  if (!targetUrl) {
    return NextResponse.json({ error: "Missing url parameter" }, { status: 400 });
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 6000);

    const res = await fetch(targetUrl, {
      signal: controller.signal,
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
      },
    });
    clearTimeout(timeoutId);

    if (!res.ok) {
      return NextResponse.json({ error: `Failed to fetch URL, status ${res.status}` }, { status: 400 });
    }

    const html = await res.text();

    // Clean html comments first to prevent false matches
    const cleanHtml = html.replace(/<!--[\s\S]*?-->/g, "");

    // extract <title>...</title>
    const titleMatch = cleanHtml.match(/<title[^>]*>([\s\S]*?)<\/title>/i);
    let title = titleMatch ? titleMatch[1].trim() : "";
    // Decode basic html entities
    title = title
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    // extract <meta name="description" content="..." /> or og:description
    const descMatch = 
      cleanHtml.match(/<meta[^>]+name=["']description["'][^>]+content=["']([\s\S]*?)["']/i) ||
      cleanHtml.match(/<meta[^>]+content=["']([\s\S]*?)["'][^>]+name=["']description["']/i) ||
      cleanHtml.match(/<meta[^>]+property=["']og:description["'][^>]+content=["']([\s\S]*?)["']/i);
    
    let description = descMatch ? descMatch[1].trim() : "";
    description = description
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");

    return NextResponse.json({ title, description });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to scrape metadata";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
