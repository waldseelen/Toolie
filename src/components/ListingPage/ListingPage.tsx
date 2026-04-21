import Link from "next/link";
import styles from "./ListingPage.module.css";
import { FAVICON_FALLBACK } from "@/lib/constants";
import type { Locale } from "@/lib/i18n";
import type { ToolData } from "@/lib/types";
import {
  getLocalizedCategoryName,
  getLocalizedSubcategoryName,
  getLocalizedToolDescription,
} from "@/lib/tool-data";

interface ListingPageProps {
  accentColor: string;
  description: string;
  eyebrow: string;
  locale: Locale;
  title: string;
  tools: ToolData[];
}

export function ListingPage({
  accentColor,
  description,
  eyebrow,
  locale,
  title,
  tools,
}: ListingPageProps) {
  return (
    <div className={styles.page}>
      <section
        className={styles.hero}
        style={{ "--accent-color": accentColor } as React.CSSProperties}
      >
        <span className={styles.eyebrow}>{eyebrow}</span>
        <h1 className={styles.title}>{title}</h1>
        <p className={styles.description}>{description}</p>
      </section>

      {tools.length > 0 ? (
        <div className={styles.grid}>
          {tools.map((tool) => (
            <Link
              key={tool.id}
              href={tool.slug ? `/tool/${tool.slug}` : tool.link}
              className={styles.card}
              style={
                { "--accent-color": tool.category?.color ?? accentColor } as React.CSSProperties
              }
            >
              <div className={styles.cardTitleRow}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={tool.logoUrl || tool.faviconUrl || FAVICON_FALLBACK}
                  alt=""
                  className={styles.logo}
                  width="32"
                  height="32"
                />
                <div>
                  <h2 className={styles.cardTitle}>{tool.name}</h2>
                  <p className={styles.meta}>
                    {tool.category && getLocalizedCategoryName(tool.category, locale)}
                    {tool.subcategory && ` / ${getLocalizedSubcategoryName(tool.subcategory, locale)}`}
                  </p>
                </div>
              </div>
              <p className={styles.copy}>
                {getLocalizedToolDescription(tool, locale)}
              </p>
              {tool.tags && tool.tags.length > 0 && (
                <div className={styles.tagRow}>
                  {tool.tags.map((tag) => (
                    <span key={tag.id} className={styles.tag}>
                      #{tag.slug}
                    </span>
                  ))}
                </div>
              )}
            </Link>
          ))}
        </div>
      ) : (
        <div className={styles.empty}>No tools found.</div>
      )}
    </div>
  );
}
