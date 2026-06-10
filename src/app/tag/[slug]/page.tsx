import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getTagBySlug, getToolsByTagSlug } from "@/lib/db";
import { getRequestLocale } from "@/lib/request-locale";
import { absoluteUrl, buildOgImageUrl } from "@/lib/site";
import { ListingPage } from "@/components/ListingPage/ListingPage";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const tag = await getTagBySlug(slug);

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

  const tag = await getTagBySlug(slug);
  if (!tag) {
    notFound();
  }

  const tools = await getToolsByTagSlug(slug);

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
      tools={tools}
    />
  );
}

