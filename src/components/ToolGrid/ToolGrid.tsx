"use client";

import styles from "./ToolGrid.module.css";
import type { CategoryData } from "@/lib/types";
import { getLocalizedName } from "@/lib/taxonomy";
import { ToolCard } from "../ToolCard/ToolCard";
import { useAppStore } from "@/store/useAppStore";
import { t as translate } from "@/lib/i18n";

interface ToolGridProps {
  category: CategoryData;
  searchQuery: string;
  searchResultIds?: Set<string> | null;
  tag?: string;
  pricing?: string;
  platform?: string;
  sort?: string;
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
}

export function ToolGrid({
  category,
  searchQuery,
  searchResultIds,
  tag,
  pricing,
  platform,
  sort,
  comparedIds,
  onToggleCompare,
}: ToolGridProps) {
  const locale = useAppStore((state) => state.locale);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
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
      let filteredTools = [...sub.tools];
      
      if (query && searchResultIds) {
        filteredTools = filteredTools.filter((tool) => searchResultIds.has(tool.id));
      }

      if (tag) {
        filteredTools = filteredTools.filter((tool) => 
          tool.tags?.some(t => t.slug === tag)
        );
      }

      if (pricing) {
        filteredTools = filteredTools.filter((tool) => tool.pricingModel === pricing);
      }

      if (platform) {
        filteredTools = filteredTools.filter((tool) => tool.platforms?.includes(platform));
      }

      if (sort === "newest") {
        filteredTools.sort(
          (a, b) =>
            new Date(b.createdAt ?? 0).getTime() -
            new Date(a.createdAt ?? 0).getTime()
        );
      } else if (sort === "az") {
        filteredTools.sort((a, b) => a.name.localeCompare(b.name));
      } else {
        // Default sort (sortOrder implicitly preserved from server)
      }

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
        <h2 className={styles.catTitle}>{categoryName}</h2>
        <span className={styles.catCount} aria-live="polite">
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
            {sub.displayName}
            <span className={styles.subCount}>
              {sub.tools.length} {t("toolCount")}
            </span>
          </h3>
          <div
            className={styles.grid}
            role="list"
          >
            {sub.tools.map((tool) => (
              <ToolCard
                key={tool.id}
                tool={tool}
                accentColor={category.color}
                isCompared={comparedIds.includes(tool.id)}
                onToggleCompare={onToggleCompare}
              />
            ))}
          </div>
        </section>
      ))}
    </div>
  );
}
