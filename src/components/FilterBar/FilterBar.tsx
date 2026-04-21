"use client";

import styles from "./FilterBar.module.css";
import { useURLParams } from "@/hooks/useURLParams";
import type { TranslationKey } from "@/lib/i18n";

interface FilterBarProps {
  t: (key: TranslationKey) => string;
}

export function FilterBar({ t }: FilterBarProps) {
  const { pricing, platform, sort, setPricing, setPlatform, setSort } = useURLParams();

  return (
    <div className={styles.filterBar}>
      <div className={styles.filterGroup}>
        <label htmlFor="pricing" className={styles.label}>{t("filterPricing")}:</label>
        <select
          id="pricing"
          className={styles.select}
          value={pricing}
          onChange={(e) => setPricing(e.target.value)}
        >
          <option value="">{t("filterAll")}</option>
          <option value="free">{t("filterFree")}</option>
          <option value="freemium">{t("filterFreemium")}</option>
          <option value="paid">{t("filterPaid")}</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="platform" className={styles.label}>{t("filterPlatform")}:</label>
        <select
          id="platform"
          className={styles.select}
          value={platform}
          onChange={(e) => setPlatform(e.target.value)}
        >
          <option value="">{t("filterAll")}</option>
          <option value="web">{t("filterWeb")}</option>
          <option value="desktop">{t("filterDesktop")}</option>
          <option value="mobile">{t("filterMobile")}</option>
        </select>
      </div>

      <div className={styles.filterGroup}>
        <label htmlFor="sort" className={styles.label}>{t("filterSort")}:</label>
        <select
          id="sort"
          className={styles.select}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="">{t("filterAll")}</option>
          <option value="newest">{t("sortNewest")}</option>
          <option value="az">{t("sortAZ")}</option>
        </select>
      </div>
    </div>
  );
}
