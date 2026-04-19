import { Prisma } from "@prisma/client";
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTextToEnglish } from "@/lib/translate";

interface Params {
  params: Promise<{ id: string }>;
}

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

/* ── PUT /api/tools/[id] ── */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existingTool = await prisma.tool.findUnique({
      where: { id },
      select: { id: true, subcategoryId: true },
    });

    if (!existingTool) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      );
    }

    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasLink = Object.prototype.hasOwnProperty.call(body, "link");
    const hasDescription = Object.prototype.hasOwnProperty.call(
      body,
      "description"
    );
    const hasDescriptionEn = Object.prototype.hasOwnProperty.call(
      body,
      "descriptionEn"
    );
    const hasSubcategoryId = Object.prototype.hasOwnProperty.call(
      body,
      "subcategoryId"
    );

    const name = asTrimmedString(body.name);
    const link = asTrimmedString(body.link);
    const description = asTrimmedString(body.description);
    const descriptionEn = asTrimmedString(body.descriptionEn);
    const subcategoryId = asTrimmedString(body.subcategoryId);

    if (hasName && !name) {
      return NextResponse.json(
        { error: "name boş olamaz" },
        { status: 400 }
      );
    }

    if (hasLink && !link) {
      return NextResponse.json(
        { error: "link boş olamaz" },
        { status: 400 }
      );
    }

    if (hasDescription && !description) {
      return NextResponse.json(
        { error: "description boş olamaz" },
        { status: 400 }
      );
    }

    if (hasSubcategoryId && !subcategoryId) {
      return NextResponse.json(
        { error: "subcategoryId boş olamaz" },
        { status: 400 }
      );
    }

    let resolvedSubcategoryId: string | undefined;

    if (subcategoryId) {
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

      resolvedSubcategoryId = subcategory.id;
    }

    let resolvedDescriptionEn: string | null | undefined;

    if (hasDescriptionEn) {
      resolvedDescriptionEn = descriptionEn;
    } else if (description) {
      try {
        resolvedDescriptionEn = await translateTextToEnglish(description);
      } catch {
        resolvedDescriptionEn = undefined;
      }
    }

    const isMovingToAnotherSubcategory =
      resolvedSubcategoryId !== undefined &&
      resolvedSubcategoryId !== existingTool.subcategoryId;

    const targetSubcategoryId = isMovingToAnotherSubcategory
      ? resolvedSubcategoryId
      : undefined;

    const movedSortOrder = targetSubcategoryId
      ? await getNextSortOrder(targetSubcategoryId)
      : undefined;

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(link && {
          link,
          faviconUrl: resolveFaviconUrl(link),
        }),
        ...(description && { description }),
        ...(resolvedDescriptionEn !== undefined && {
          descriptionEn: resolvedDescriptionEn,
        }),
        ...(resolvedSubcategoryId && { subcategoryId: resolvedSubcategoryId }),
        ...(movedSortOrder !== undefined && {
          sortOrder: movedSortOrder,
        }),
      },
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error("PUT /api/tools/[id] error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Araç güncellenirken kayıt bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Araç güncellenirken hata oluştu" },
      { status: 500 }
    );
  }
}

/* ── DELETE /api/tools/[id] ── */
export async function DELETE(_request: Request, { params }: Params) {
  try {
    const { id } = await params;

    await prisma.tool.delete({ where: { id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tools/[id] error:", error);

    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: "Araç silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
