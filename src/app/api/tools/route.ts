import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTextToEnglish } from "@/lib/translate";

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

function resolveFaviconUrl(link: string): string | null {
  try {
    const domain = new URL(link).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

async function getNextSortOrder(subcategoryId: string): Promise<number> {
  const result = await prisma.tool.aggregate({
    where: { subcategoryId },
    _max: { sortOrder: true },
  });

  return (result._max.sortOrder ?? -1) + 1;
}

/* ── GET /api/tools ── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = asTrimmedString(searchParams.get("cat"));
    const q = asTrimmedString(searchParams.get("q"));

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
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
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
    const name = asTrimmedString(body.name);
    const link = asTrimmedString(body.link);
    const description = asTrimmedString(body.description);
    const descriptionEn = asTrimmedString(body.descriptionEn);
    const subcategoryId = asTrimmedString(body.subcategoryId);

    if (!name || !link || !description || !subcategoryId) {
      return NextResponse.json(
        {
          error:
            "Tüm alanlar gereklidir: name, link, description, subcategoryId",
        },
        { status: 400 }
      );
    }

    const subcategory = await prisma.subcategory.findUnique({
      where: { id: subcategoryId },
      select: { id: true },
    });

    if (!subcategory) {
      return NextResponse.json(
        { error: "Geçersiz subcategoryId" },
        { status: 404 }
      );
    }

    let resolvedDescriptionEn: string | null = descriptionEn;

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
        faviconUrl: resolveFaviconUrl(link),
        sortOrder: await getNextSortOrder(subcategoryId),
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
