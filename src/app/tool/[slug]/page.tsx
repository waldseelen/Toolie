import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { prisma } from "@/lib/prisma";
import styles from "./ToolDetail.module.css";
import { FAVICON_FALLBACK } from "@/lib/constants";
import { translations } from "@/lib/i18n";
import { getRequestLocale } from "@/lib/request-locale";
import { absoluteUrl, buildOgImageUrl } from "@/lib/site";
import {
  getLocalizedCategoryName,
  getLocalizedSubcategoryName,
  getLocalizedToolDescription,
  mapToolToData,
  mapToolsToData,
  splitPlatforms,
} from "@/lib/tool-data";

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const locale = await getRequestLocale();
  const { slug } = await params;
  const tool = await prisma.tool.findUnique({
    where: { slug },
    include: {
      subcategory: {
        include: {
          category: true,
        },
      },
    },
  });
  
  if (!tool) {
    return { title: "Not Found — TOOLIE" };
  }
  const mappedTool = mapToolToData(tool);
  const description = getLocalizedToolDescription(mappedTool, locale);
  const title = `${tool.name} — TOOLIE`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: absoluteUrl(`/tool/${tool.slug}`),
      images: [
        {
          url: buildOgImageUrl(tool.name, description),
        },
      ],
    },
    alternates: {
      canonical: absoluteUrl(`/tool/${tool.slug}`),
    },
  };
}

export default async function ToolDetailPage({ params }: Props) {
  const { slug } = await params;
  const locale = await getRequestLocale();
  const copy = translations[locale];

  const toolRecord = await prisma.tool.findUnique({
    where: { slug },
    include: {
      subcategory: {
        include: { category: true }
      },
      tags: { select: { id: true, name: true, slug: true } }
    }
  });

  if (!toolRecord) {
    notFound();
  }
  const tool = mapToolToData(toolRecord);

  const localizedDescription = getLocalizedToolDescription(tool, locale);
  const localizedCatName = tool.category
    ? getLocalizedCategoryName(tool.category, locale)
    : "";
  const localizedSubName = tool.subcategory
    ? getLocalizedSubcategoryName(tool.subcategory, locale)
    : "";
  const platformList = splitPlatforms(tool.platforms);
  const statusLabel =
    tool.status === "dead"
      ? copy.statusDead
      : tool.status === "redirected"
        ? copy.statusRedirected
        : copy.statusActive;
  const healthLabel = tool.lastCheckedAt
    ? tool.isBroken
      ? copy.healthBroken
      : copy.healthHealthy
    : copy.healthUnknown;

  const similarTools = mapToolsToData(await prisma.tool.findMany({
    where: {
      subcategoryId: toolRecord.subcategoryId,
      id: { not: toolRecord.id }
    },
    take: 6,
    orderBy: { sortOrder: "asc" },
    include: {
      tags: { select: { id: true, name: true, slug: true } },
      subcategory: {
        include: {
          category: true,
        },
      },
    },
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: tool.name,
    description: localizedDescription,
    applicationCategory: localizedCatName,
    operatingSystem: platformList.length > 0 ? platformList.join(", ") : undefined,
    url: absoluteUrl(`/tool/${tool.slug}`),
    sameAs: [tool.link, tool.officialDocsUrl, tool.githubUrl].filter(Boolean),
    offers: tool.pricingModel
      ? {
          "@type": "Offer",
          price: tool.pricingModel === "paid" ? "1" : "0",
          priceCurrency: "USD",
        }
      : undefined,
  };

  return (
    <div className={styles.container}>
      <nav className={styles.breadcrumb}>
        <Link href="/" className={styles.backLink}>← {copy.backToCatalog}</Link>
        <span className={styles.separator}>/</span>
        <span className={styles.categoryPath}>{localizedCatName}</span>
        <span className={styles.separator}>/</span>
        <span className={styles.categoryPath}>{localizedSubName}</span>
      </nav>

      <main className={styles.content}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <header className={styles.header}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={tool.logoUrl || tool.faviconUrl || FAVICON_FALLBACK}
            alt={`${tool.name} icon`}
            className={styles.favicon}
            width="64"
            height="64"
          />
          <div>
            <h1 className={styles.title}>{tool.name}</h1>
            {tool.featured && tool.featuredLabel && (
              <p className={styles.featuredLabel}>{tool.featuredLabel}</p>
            )}
            <div className={styles.badges}>
              {tool.pricingModel && (
                <span className={styles.infoBadge}>{tool.pricingModel}</span>
              )}
              {tool.hasApi && <span className={styles.infoBadge}>{copy.badgeApi}</span>}
              {tool.isOpenSource && (
                <span className={styles.infoBadge}>{copy.badgeOpenSource}</span>
              )}
              {tool.verified && (
                <span className={styles.infoBadge}>{copy.badgeVerified}</span>
              )}
            </div>
            {tool.tags && tool.tags.length > 0 && (
              <div className={styles.tags}>
                {tool.tags.map((tag) => (
                  <span key={tag.id} className={styles.tagChip}>
                    #{tag.slug}
                  </span>
                ))}
              </div>
            )}
          </div>
        </header>

        <section className={styles.details}>
          <p className={styles.description}>{localizedDescription}</p>
          <dl className={styles.metaGrid}>
            <div className={styles.metaCard}>
              <dt className={styles.metaLabel}>{copy.currentStatus}</dt>
              <dd className={styles.metaValue}>{statusLabel}</dd>
            </div>
            <div className={styles.metaCard}>
              <dt className={styles.metaLabel}>{copy.toolHealth}</dt>
              <dd className={styles.metaValue}>{healthLabel}</dd>
            </div>
            <div className={styles.metaCard}>
              <dt className={styles.metaLabel}>{copy.platformsLabel}</dt>
              <dd className={styles.metaValue}>
                {platformList.length > 0 ? platformList.join(", ") : "-"}
              </dd>
            </div>
            <div className={styles.metaCard}>
              <dt className={styles.metaLabel}>{copy.lastChecked}</dt>
              <dd className={styles.metaValue}>
                {tool.lastCheckedAt
                  ? new Date(tool.lastCheckedAt).toLocaleString(locale)
                  : "-"}
              </dd>
            </div>
          </dl>
          
          <div className={styles.actions}>
            <a 
              href={tool.link}
              target="_blank" 
              rel="noopener noreferrer" 
              className={styles.visitButton}
            >
              {copy.visitOfficialSite} ↗
            </a>
            {tool.officialDocsUrl && (
              <a
                href={tool.officialDocsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                {copy.officialDocs}
              </a>
            )}
            {tool.githubUrl && (
              <a
                href={tool.githubUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.secondaryButton}
              >
                {copy.sourceCode}
              </a>
            )}
          </div>
        </section>

        {similarTools.length > 0 && (
          <section className={styles.similar}>
            <h2 className={styles.similarTitle}>{copy.similarToolsTitle}</h2>
            <div className={styles.similarGrid}>
              {similarTools.map((t) => {
                const simDesc = getLocalizedToolDescription(t, locale);
                return (
                  <Link key={t.id} href={`/tool/${t.slug}`} className={styles.similarCard}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={t.logoUrl || t.faviconUrl || FAVICON_FALLBACK}
                      alt=""
                      className={styles.similarIcon}
                      width="24"
                      height="24"
                    />
                    <div>
                      <h3 className={styles.similarName}>{t.name}</h3>
                      <p className={styles.similarDesc}>{simDesc}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          </section>
        )}
      </main>
    </div>
  );
}
