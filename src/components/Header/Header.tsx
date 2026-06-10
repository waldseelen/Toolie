"use client";

import dynamic from "next/dynamic";
import styles from "./Header.module.css";
import type { ToolStats } from "@/lib/types";
import type { Locale, TranslationKey } from "@/lib/i18n";
import { useCRT } from "@/hooks/useCRT";
import { useHighContrast } from "@/hooks/useHighContrast";

const ThemeToggle = dynamic(
  () => import("../ThemeToggle/ThemeToggle").then((mod) => mod.ThemeToggle),
  { ssr: false }
);

interface HeaderProps {
  stats: ToolStats;
  locale: Locale;
  toggleLanguage: () => void;
  t: (key: TranslationKey) => string;
}

export function Header({ stats, locale, toggleLanguage, t }: HeaderProps) {
  useCRT();
  useHighContrast();

  return (
    <header className={styles.header}>
      <div className={styles.ascii} aria-hidden="true">
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      </div>

      <div className={styles.headerRow}>
        <h1 className={styles.title}>
          [ TOOLIE v1.0 ]
          <span className={styles.cursor} aria-hidden="true">
            ▋
          </span>
        </h1>
        <div className={styles.controls}>
          <ThemeToggle t={t} />

          <button
            type="button"
            className={styles.langToggle}
            onClick={toggleLanguage}
            aria-label={t("switchLang")}
            title={t("switchLang")}
          >
            <span className={styles.langBracket} aria-hidden="true">[</span>
            <span className={locale === "tr" ? styles.langActive : undefined}>TR</span>
            <span className={styles.langDivider} aria-hidden="true">/</span>
            <span className={locale === "en" ? styles.langActive : undefined}>EN</span>
            <span className={styles.langBracket} aria-hidden="true">]</span>
          </button>
        </div>
      </div>

      <p className={styles.subtitle}>{t("headerSubtitle")}</p>
      <p className={styles.stats}>
        {stats.totalTools} {t("statsTools")} · {stats.totalCategories} {" "}
        {t("statsCategories")} · {stats.totalSubcategories} {" "}
        {t("statsSubcategories")}
      </p>

      <div className={styles.asciiBottom} aria-hidden="true">
        ░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░░
      </div>
    </header>
  );
}
