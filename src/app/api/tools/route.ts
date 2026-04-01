import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTextToEnglish } from "@/lib/translate";

/* ── GET /api/tools ── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = searchParams.get("cat");
    const q = searchParams.get("q");

    const categories = await prisma.category.findMany({
      where: cat ? { name: cat } : undefined,
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            tools: {
              where: q
                ? {
                    OR: [
                      { name: { contains: q } },
                      { description: { contains: q } },
                      { descriptionEn: { contains: q } },
                    ],
                  }
                : undefined,
              orderBy: { createdAt: "asc" },
            },
          },
        },
      },
    });

    return NextResponse.json(categories);
  } catch (error) {
    console.error("GET /api/tools error:", error);
    return NextResponse.json(
      { error: "Araçlar yüklenirken hata oluştu" },
      { status: 500 }
    );
  }
}

/* ── POST /api/tools ── */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, link, description, descriptionEn, subcategoryId } = body;

    if (!name || !link || !description || !subcategoryId) {
      return NextResponse.json(
        { error: "Tüm alanlar gereklidir: name, link, description, subcategoryId" },
        { status: 400 }
      );
    }

    let faviconUrl: string | null = null;
    try {
      const domain = new URL(link).hostname;
      faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
    } catch {
      /* invalid URL */
    }

    let resolvedDescriptionEn: string | null = descriptionEn ?? null;

    if (!resolvedDescriptionEn) {
      try {
        resolvedDescriptionEn = await translateTextToEnglish(description);
      } catch {
        resolvedDescriptionEn = null;
      }
    }

    const tool = await prisma.tool.create({
      data: {
        name,
        link,
        description,
        descriptionEn: resolvedDescriptionEn,
        subcategoryId,
        faviconUrl,
      },
    });

    return NextResponse.json(tool, { status: 201 });
  } catch (error) {
    console.error("POST /api/tools error:", error);
    return NextResponse.json(
      { error: "Araç eklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
