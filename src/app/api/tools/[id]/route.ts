import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTextToEnglish } from "@/lib/translate";

interface Params {
  params: Promise<{ id: string }>;
}

/* ── PUT /api/tools/[id] ── */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const { name, link, description, descriptionEn } = body;
    const hasDescriptionEn = Object.prototype.hasOwnProperty.call(
      body,
      "descriptionEn"
    );

    let resolvedDescriptionEn: string | null | undefined;

    if (hasDescriptionEn) {
      resolvedDescriptionEn = descriptionEn || null;
    } else if (description) {
      try {
        resolvedDescriptionEn = await translateTextToEnglish(description);
      } catch {
        resolvedDescriptionEn = undefined;
      }
    }

    const tool = await prisma.tool.update({
      where: { id },
      data: {
        ...(name && { name }),
        ...(link && { link }),
        ...(description && { description }),
        ...(resolvedDescriptionEn !== undefined && {
          descriptionEn: resolvedDescriptionEn,
        }),
        ...(link && {
          faviconUrl: (() => {
            try {
              const domain = new URL(link).hostname;
              return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
            } catch {
              return null;
            }
          })(),
        }),
      },
    });

    return NextResponse.json(tool);
  } catch (error) {
    console.error("PUT /api/tools/[id] error:", error);
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
    return NextResponse.json(
      { error: "Araç silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
