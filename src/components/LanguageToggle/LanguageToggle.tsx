"use client";

import type { Locale, TranslationKey } from "@/lib/i18n";
import styles from "./LanguageToggle.module.css";

interface LanguageToggleProps {
  locale: Locale;
  onToggle: () => void;
  t: (key: TranslationKey) => string;
}

export function LanguageToggle({ locale, onToggle, t }: LanguageToggleProps) {
  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={onToggle}
      aria-label={t("switchLang")}
      title={t("switchLang")}
    >
      <span className={locale === "tr" ? styles.active : undefined}>TR</span>
      <span className={styles.divider} aria-hidden="true">|</span>
      <span className={locale === "en" ? styles.active : undefined}>EN</span>
    </button>
  );
}
