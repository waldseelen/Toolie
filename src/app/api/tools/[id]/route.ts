import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { getToolById, updateTool, deleteTool, getNextSortOrder } from "@/lib/db";
import { translateTextToEnglish } from "@/lib/translate";
import { STATUS_VALUES } from "@/lib/tool-data";

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

function asBoolean(value: unknown): boolean | undefined {
  return typeof value === "boolean" ? value : undefined;
}

function asStatus(value: unknown): string | undefined {
  const normalized = asTrimmedString(value);

  if (!normalized) {
    return undefined;
  }

  return STATUS_VALUES.includes(normalized as (typeof STATUS_VALUES)[number])
    ? normalized
    : undefined;
}

/* ── PUT /api/tools/[id] ── */
export async function PUT(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const existingTool = await getToolById(id);

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
    const pricingModel = asTrimmedString(body.pricingModel);
    const platforms = asTrimmedString(body.platforms);
    const featured = asBoolean(body.featured);
    const featuredLabel = asTrimmedString(body.featuredLabel);
    const hasApi = asBoolean(body.hasApi);
    const isOpenSource = asBoolean(body.isOpenSource);
    const officialDocsUrl = asTrimmedString(body.officialDocsUrl);
    const githubUrl = asTrimmedString(body.githubUrl);
    const logoUrl = asTrimmedString(body.logoUrl);
    const status = asStatus(body.status);
    const verified = asBoolean(body.verified);
    const lastStatusCode =
      typeof body.lastStatusCode === "number" ? body.lastStatusCode : undefined;
    const isBroken = asBoolean(body.isBroken);
    const tags = Array.isArray(body.tags) ? body.tags : undefined;

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
      const db = getDb();
      const subcategoryDoc = await db.collection("subcategories").doc(subcategoryId).get();

      if (!subcategoryDoc.exists) {
        return NextResponse.json(
          { error: "Geçersiz subcategoryId" },
          { status: 404 }
        );
      }

      resolvedSubcategoryId = subcategoryDoc.id;
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
      resolvedSubcategoryId !== existingTool.subcategory?.id;

    const targetSubcategoryId = isMovingToAnotherSubcategory
      ? resolvedSubcategoryId
      : undefined;

    const movedSortOrder = targetSubcategoryId
      ? await getNextSortOrder(targetSubcategoryId)
      : undefined;

    const tool = await updateTool(id, {
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
      ...(pricingModel !== undefined && { pricingModel }),
      ...(platforms !== undefined && { platforms }),
      ...(featured !== undefined && { featured }),
      ...(featuredLabel !== undefined && { featuredLabel }),
      ...(hasApi !== undefined && { hasApi }),
      ...(isOpenSource !== undefined && { isOpenSource }),
      ...(officialDocsUrl !== undefined && { officialDocsUrl }),
      ...(githubUrl !== undefined && { githubUrl }),
      ...(logoUrl !== undefined && { logoUrl }),
      ...(status !== undefined && { status }),
      ...(verified !== undefined && { verified }),
      ...(lastStatusCode !== undefined && { lastStatusCode }),
      ...(isBroken !== undefined && { isBroken }),
      ...(tags !== undefined && { tagIds: tags }),
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
    const existingTool = await getToolById(id);

    if (!existingTool) {
      return NextResponse.json(
        { error: "Araç bulunamadı" },
        { status: 404 }
      );
    }

    await deleteTool(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("DELETE /api/tools/[id] error:", error);
    return NextResponse.json(
      { error: "Araç silinirken hata oluştu" },
      { status: 500 }
    );
  }
}
