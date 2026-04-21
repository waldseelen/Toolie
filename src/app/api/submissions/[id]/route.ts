import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { translateTextToEnglish } from "@/lib/translate";
import { createUniqueSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
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

async function createToolSlug(name: string): Promise<string> {
  const existingTools = await prisma.tool.findMany({
    where: { slug: { not: null } },
    select: { slug: true },
  });
  const usedSlugs = new Set(existingTools.map((tool) => tool.slug!));

  return createUniqueSlug(name, usedSlugs);
}

async function resolveSubcategoryId(categoryKey: string | null): Promise<string | null> {
  const fallback = await prisma.subcategory.findFirst({
    where: { category: { name: "GENERAL" } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  if (!categoryKey) {
    return fallback?.id ?? null;
  }

  const match = await prisma.subcategory.findFirst({
    where: { category: { name: categoryKey } },
    orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
    select: { id: true },
  });

  return match?.id ?? fallback?.id ?? null;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;

    if (!action) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const submission = await prisma.submission.findUnique({
      where: { id },
    });

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (action === "reject") {
      const rejected = await prisma.submission.update({
        where: { id },
        data: { status: "rejected" },
      });

      return NextResponse.json(rejected);
    }

    const subcategoryId = await resolveSubcategoryId(submission.categoryKey);

    if (!subcategoryId) {
      return NextResponse.json(
        { error: "No subcategory available for approval" },
        { status: 500 }
      );
    }

    let descriptionEn: string | null = null;

    try {
      descriptionEn = await translateTextToEnglish(submission.description);
    } catch {
      descriptionEn = null;
    }

    await prisma.$transaction(async (tx) => {
      await tx.tool.create({
        data: {
          name: submission.name,
          slug: await createToolSlug(submission.name),
          link: submission.link,
          description: submission.description,
          descriptionEn,
          subcategoryId,
          faviconUrl: resolveFaviconUrl(submission.link),
          sortOrder: await getNextSortOrder(subcategoryId),
        },
      });

      await tx.submission.update({
        where: { id },
        data: { status: "approved" },
      });
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/submissions/[id] error:", error);
    return NextResponse.json(
      { error: "Submission action failed" },
      { status: 500 }
    );
  }
}
