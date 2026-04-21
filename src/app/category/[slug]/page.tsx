import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/request-locale";
import { absoluteUrl, buildOgImageUrl } from "@/lib/site";
import { mapToolsToData } from "@/lib/tool-data";
import { ListingPage } from "@/components/ListingPage/ListingPage";
import { getLocalizedName } from "@/lib/taxonomy";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
  });

  if (!category) {
    return { title: "Not Found — TOOLIE" };
  }

  const categoryName = getLocalizedName(
    locale,
    category.nameTr,
    category.nameEn,
    category.name
  );
  const description =
    locale === "en"
      ? `${categoryName} tools and resources on TOOLIE.`
      : `${categoryName} kategorisindeki araçlar ve kaynaklar.`;

  return {
    title: `${categoryName} — TOOLIE`,
    description,
    alternates: {
      canonical: absoluteUrl(`/category/${slug}`),
    },
    openGraph: {
      title: `${categoryName} — TOOLIE`,
      description,
      url: absoluteUrl(`/category/${slug}`),
      images: [
        {
          url: buildOgImageUrl(categoryName, description),
        },
      ],
    },
  };
}

export default async function CategoryPage({ params }: Props) {
  const locale = await getRequestLocale();
  const { slug } = await params;

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      subcategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          tools: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
            include: {
              tags: { select: { id: true, name: true, slug: true } },
            },
          },
        },
      },
    },
  });

  if (!category) {
    notFound();
  }

  const categoryName = getLocalizedName(
    locale,
    category.nameTr,
    category.nameEn,
    category.name
  );
  const copy =
    locale === "en"
      ? `${categoryName} tools collected across ${category.subcategories.length} subcategories.`
      : `${category.subcategories.length} alt kategori boyunca toplanan ${categoryName} araçları.`;

  const tools = mapToolsToData(
    category.subcategories.flatMap((subcategory) =>
      subcategory.tools.map((tool) => ({
        ...tool,
        subcategory: {
          id: subcategory.id,
          name: subcategory.name,
          key: subcategory.key,
          slug: subcategory.slug,
          nameTr: subcategory.nameTr,
          nameEn: subcategory.nameEn,
          category: {
            id: category.id,
            name: category.name,
            slug: category.slug,
            nameTr: category.nameTr,
            nameEn: category.nameEn,
            icon: category.icon,
            color: category.color,
          },
        },
      }))
    )
  );

  return (
    <ListingPage
      accentColor={category.color}
      description={copy}
      eyebrow={locale === "en" ? "CATEGORY" : "KATEGORI"}
      locale={locale}
      title={categoryName}
      tools={tools}
    />
  );
}
