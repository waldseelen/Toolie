"use client";

import styles from "./HomeSections.module.css";
import { ToolCard } from "@/components/ToolCard/ToolCard";
import { useAppStore } from "@/store/useAppStore";
import { t as translate } from "@/lib/i18n";
import type { ToolData } from "@/lib/types";

interface HomeSectionsProps {
  featuredTools: ToolData[];
  latestTools: ToolData[];
  comparedIds: string[];
  onToggleCompare: (id: string) => void;
}

export function HomeSections({
  featuredTools,
  latestTools,
  comparedIds,
  onToggleCompare,
}: HomeSectionsProps) {
  const locale = useAppStore((state) => state.locale);
  const t = (key: Parameters<typeof translate>[1]) => translate(locale, key);
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
          >
            {featuredTools.map((tool) => (
              <div key={tool.id} className={styles.featuredCard}>
                <ToolCard
                  tool={tool}
                  accentColor={tool.category?.color ?? "var(--green)"}
                  isCompared={comparedIds.includes(tool.id)}
                  onToggleCompare={onToggleCompare}
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
                  accentColor={tool.category?.color ?? "var(--cyan)"}
                  isCompared={comparedIds.includes(tool.id)}
                  onToggleCompare={onToggleCompare}
                />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
