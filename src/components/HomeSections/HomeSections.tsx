"use client";

import styles from "./HomeSections.module.css";
import { ToolCard } from "@/components/ToolCard/ToolCard";
import type { Locale, TranslationKey } from "@/lib/i18n";
import type { CollectionData, ToolData } from "@/lib/types";

interface HomeSectionsProps {
  locale: Locale;
  featuredTools: ToolData[];
  latestTools: ToolData[];
  favorites: string[];
  comparedIds: string[];
  collections: CollectionData[];
  onCreateCollection: (name: string, initialToolId?: string) => string | null;
  onToggleCollection: (collectionId: string, toolId: string) => void;
  onToggleCompare: (id: string) => void;
  onToggleFavorite: (id: string) => void;
  t: (key: TranslationKey) => string;
}

export function HomeSections({
  locale,
  featuredTools,
  latestTools,
  favorites,
  comparedIds,
  collections,
  onCreateCollection,
  onToggleCollection,
  onToggleCompare,
  onToggleFavorite,
  t,
}: HomeSectionsProps) {
  if (featuredTools.length === 0 && latestTools.length === 0) {
    return null;
  }

  return (
    <div className={styles.sections}>
      {featuredTools.length > 0 && (
        <section className={styles.section} aria-label={t("featuredToolsTitle")}>
          <div className={styles.headingRow}>
            <h2 className={styles.title}>{t("featuredToolsTitle")}</h2>
            <p className={styles.copy}>{t("featuredToolsCopy")}</p>
          </div>
          <div
            className={styles.featuredGrid}
            role="list"
            style={{ "--grid-cols": Math.ceil(featuredTools.length / 2) } as React.CSSProperties}
          >
            {featuredTools.map((tool) => (
              <div key={tool.id} className={styles.featuredCard}>
                <ToolCard
                  tool={tool}
                  locale={locale}
                  accentColor={tool.category?.color ?? "var(--green)"}
                  isFavorite={favorites.includes(tool.id)}
                  isCompared={comparedIds.includes(tool.id)}
                  collections={collections}
                  onCreateCollection={onCreateCollection}
                  onToggleCollection={onToggleCollection}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  t={t}
                />
              </div>
            ))}
          </div>
        </section>
      )}

      {latestTools.length > 0 && (
        <section className={styles.section} aria-label={t("newAdditionsTitle")}>
          <div className={styles.headingRow}>
            <h2 className={styles.title}>{t("newAdditionsTitle")}</h2>
            <p className={styles.copy}>{t("newAdditionsCopy")}</p>
          </div>
          <div className={styles.latestRail} role="list">
            {latestTools.map((tool) => (
              <div key={tool.id} className={styles.latestCard}>
                <ToolCard
                  tool={tool}
                  locale={locale}
                  accentColor={tool.category?.color ?? "var(--cyan)"}
                  isFavorite={favorites.includes(tool.id)}
                  isCompared={comparedIds.includes(tool.id)}
                  collections={collections}
                  onCreateCollection={onCreateCollection}
                  onToggleCollection={onToggleCollection}
                  onToggleFavorite={onToggleFavorite}
                  onToggleCompare={onToggleCompare}
                  t={t}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
