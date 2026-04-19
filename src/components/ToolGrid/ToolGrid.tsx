"use client";

import styles from "./ToolGrid.module.css";
import type { CategoryData } from "@/lib/types";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { getLocalizedName } from "@/lib/taxonomy";
import { ToolCard } from "../ToolCard/ToolCard";

interface ToolGridProps {
  category: CategoryData;
  locale: Locale;
  searchQuery: string;
  favorites: string[];
  onToggleFavorite: (id: string) => void;
  t: (key: TranslationKey) => string;
}

export function ToolGrid({
  category,
  locale,
  searchQuery,
  favorites,
  onToggleFavorite,
  t,
}: ToolGridProps) {
  const query = searchQuery.toLowerCase().trim();
  const categoryName = getLocalizedName(
    locale,
    category.nameTr,
    category.nameEn,
    category.name
  );

  let totalVisibleTools = 0;

  const filteredSubcategories = category.subcategories
    .map((sub) => {
      const filteredTools = query
        ? sub.tools.filter((tool) => {
            const descriptionEn = tool.descriptionEn?.toLowerCase() ?? "";

            return (
              tool.name.toLowerCase().includes(query) ||
              tool.description.toLowerCase().includes(query) ||
              descriptionEn.includes(query)
            );
          })
        : sub.tools;

      totalVisibleTools += filteredTools.length;
      return {
        ...sub,
        displayName: getLocalizedName(locale, sub.nameTr, sub.nameEn, sub.name),
        tools: filteredTools,
      };
    })
    .filter((sub) => sub.tools.length > 0);

  const totalCatTools = category.subcategories.reduce(
    (sum, sub) => sum + sub.tools.length,
    0
  );

  if (filteredSubcategories.length === 0) {
    return (
      <div className={styles.noResults} aria-live="polite">
        <span className={styles.noResultsIcon} aria-hidden="true">
          ◇
        </span>
        {query
          ? `"${searchQuery}" ${t("noResultsFor")}`
          : t("noToolsInCategory")}
      </div>
    );
  }

  return (
    <div
      className={styles.panel}
      id={`panel-${category.name}`}
      role="tabpanel"
      aria-label={categoryName}
    >
      <div
        className={styles.catHeader}
        style={{ "--accent-color": category.color } as React.CSSProperties}
      >
        <span className={styles.catIcon}>{category.icon}</span>
        <h2 className={styles.catTitle}>░░ {categoryName} ░░</h2>
        <span className={styles.catCount}>
          {query
            ? `${totalVisibleTools}/${totalCatTools} ${t("toolCountUpper")}`
            : `${totalCatTools} ${t("toolCountUpper")}`}
        </span>
      </div>

      {filteredSubcategories.map((sub) => (
        <section
          key={sub.id}
          className={styles.subcategory}
          aria-label={sub.displayName}
        >
          <h3 className={styles.subHeader}>
            <span className={styles.subBracket}>[</span>
            {sub.displayName}
            <span className={styles.subBracket}>]</span>
            <span className={styles.subCount}>
              {sub.tools.length} {t("toolCount")}
            </span>
          </h3>
          <div className={styles.grid} role="list">
            {sub.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                locale={locale}
                accentColor={category.color}
                isFavorite={favorites.includes(tool.id)}
                onToggleFavorite={onToggleFavorite}
                t={t}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
