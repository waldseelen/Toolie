import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { isAdminRequest } from "@/lib/admin-auth";
import {
  getCategoriesWithSubcategoriesAndTools,
  createTool,
  getAllTags,
  getNextSortOrder,
} from "@/lib/db";
import { translateTextToEnglish } from "@/lib/translate";
import { createUniqueSlug } from "@/lib/slug";
import { STATUS_VALUES } from "@/lib/tool-data";

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

async function createToolSlug(name: string): Promise<string> {
  const db = getDb();
  const snap = await db.collection("tools").get();
  const usedSlugs = new Set(
    snap.docs.map((doc) => doc.data().slug).filter(Boolean) as string[]
  );

  return createUniqueSlug(name, usedSlugs);
}

/* ── GET /api/tools ── */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const cat = asTrimmedString(searchParams.get("cat"));
    const tag = asTrimmedString(searchParams.get("tag"));
    const pricing = asTrimmedString(searchParams.get("pricing"));
    const platform = asTrimmedString(searchParams.get("platform"));
    const sort = asTrimmedString(searchParams.get("sort"));

    const categories = await getCategoriesWithSubcategoriesAndTools({
      cat,
      tag,
      pricing,
      platform,
      sort,
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
    if (!isAdminRequest(request)) {
      return NextResponse.json({ error: "Yetkisiz" }, { status: 401 });
    }

    const body = await request.json();
    const name = asTrimmedString(body.name);
    const link = asTrimmedString(body.link);
    const description = asTrimmedString(body.description);
    const descriptionEn = asTrimmedString(body.descriptionEn);
    const subcategoryId = asTrimmedString(body.subcategoryId);
    const pricingModel = asTrimmedString(body.pricingModel);
    const platforms = asTrimmedString(body.platforms);
    const featured = asBoolean(body.featured) ?? false;
    const featuredLabel = asTrimmedString(body.featuredLabel);
    const hasApi = asBoolean(body.hasApi) ?? false;
    const isOpenSource = asBoolean(body.isOpenSource) ?? false;
    const officialDocsUrl = asTrimmedString(body.officialDocsUrl);
    const githubUrl = asTrimmedString(body.githubUrl);
    const logoUrl = asTrimmedString(body.logoUrl);
    const status = asStatus(body.status) ?? "active";
    const verified = asBoolean(body.verified) ?? false;
    const tags = Array.isArray(body.tags) ? body.tags : [];

    if (!name || !link || !description || !subcategoryId) {
      return NextResponse.json(
        {
          error:
            "Tüm alanlar gereklidir: name, link, description, subcategoryId",
        },
        { status: 400 }
      );
    }

    const db = getDb();
    const subcategoryDoc = await db.collection("subcategories").doc(subcategoryId).get();

    if (!subcategoryDoc.exists) {
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

    const slug = await createToolSlug(name);
    const sortOrder = await getNextSortOrder(subcategoryId);

    const tool = await createTool({
      name,
      slug,
      link,
      description,
      descriptionEn: resolvedDescriptionEn,
      subcategoryId,
      faviconUrl: resolveFaviconUrl(link),
      pricingModel,
      platforms,
      featured,
      featuredLabel,
      hasApi,
      isOpenSource,
      officialDocsUrl,
      githubUrl,
      logoUrl,
      status,
      verified,
      sortOrder,
      tagIds: tags,
    });

    const allTags = await getAllTags();
    const tagsMap = new Map(allTags.map((t) => [t.id, t]));
    const toolTags = tags.map((id: string) => tagsMap.get(id)).filter(Boolean);

    return NextResponse.json({ ...tool, tags: toolTags }, { status: 201 });
  } catch (error) {
    console.error("POST /api/tools error:", error);
    return NextResponse.json(
      { error: "Araç eklenirken hata oluştu" },
      { status: 500 }
    );
  }
}
