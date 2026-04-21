import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import { getRequestLocale } from "@/lib/request-locale";
import { absoluteUrl, buildOgImageUrl } from "@/lib/site";
import { mapToolsToData } from "@/lib/tool-data";
import { ListingPage } from "@/components/ListingPage/ListingPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
  });

  if (!tag) {
    return { title: "Not Found — TOOLIE" };
  }

  const title = locale === "en" ? `#${tag.slug} Tools — TOOLIE` : `#${tag.slug} Araçları — TOOLIE`;
  const description =
    locale === "en"
      ? `Browse TOOLIE tools tagged with ${tag.name}.`
      : `${tag.name} etiketiyle işaretlenmiş TOOLIE araçlarını inceleyin.`;

  return {
    title,
    description,
    alternates: {
      canonical: absoluteUrl(`/tag/${slug}`),
    },
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/tag/${slug}`),
      images: [
        {
          url: buildOgImageUrl(`#${tag.slug}`, description),
        },
      ],
    },
  };
}

export default async function TagPage({ params }: Props) {
  const locale = await getRequestLocale();
  const { slug } = await params;

  const tag = await prisma.tag.findUnique({
    where: { slug },
    include: {
      tools: {
        orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
        include: {
          tags: { select: { id: true, name: true, slug: true } },
          subcategory: {
            include: {
              category: true,
            },
          },
        },
      },
    },
  });

  if (!tag) {
    notFound();
  }

  const copy =
    locale === "en"
      ? `Cross-category tools currently tagged with ${tag.name}.`
      : `${tag.name} etiketiyle işaretlenmiş kategoriler arası araçlar.`;

  return (
    <ListingPage
      accentColor="var(--cyan)"
      description={copy}
      eyebrow={locale === "en" ? "TAG" : "ETIKET"}
      locale={locale}
      title={`#${tag.slug}`}
      tools={mapToolsToData(tag.tools)}
    />
  );
}
