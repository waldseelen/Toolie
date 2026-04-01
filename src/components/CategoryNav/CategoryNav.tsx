"use client";

import styles from "./CategoryNav.module.css";
import type { CategoryData } from "@/lib/types";
import type { TranslationKey } from "@/lib/i18n";

interface CategoryNavProps {
  categories: CategoryData[];
  activeCategory: string;
  onCategoryChange: (name: string) => void;
  t: (key: TranslationKey) => string;
}

export function CategoryNav({
  categories,
  activeCategory,
  onCategoryChange,
  t,
}: CategoryNavProps) {
  return (
    <nav
      className={styles.nav}
      role="tablist"
      aria-label={t("categoryAriaLabel")}
    >
      {categories.map((cat) => {
        const isActive = activeCategory === cat.name;
        return (
          <button
            key={cat.id}
            type="button"
            className={`${styles.tabBtn} ${isActive ? styles.active : ""}`}
            onClick={() => onCategoryChange(cat.name)}
            role="tab"
            aria-selected={isActive}
            aria-controls={`panel-${cat.name}`}
            aria-label={`${cat.name} ${t("categorySwitch")}`}
            style={
              isActive
                ? ({
                    "--green": cat.color,
                    borderColor: cat.color,
                    backgroundColor: cat.color,
                  } as React.CSSProperties)
                : undefined
            }
          >
            <span className={styles.tabIcon}>{cat.icon}</span>
            <span className={styles.tabLabel}>{cat.name}</span>
          </button>
        );
      })}
    </nav>
  );
}
