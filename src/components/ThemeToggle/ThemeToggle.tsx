"use client";

import { useTheme } from "@/hooks/useTheme";
import type { TranslationKey } from "@/lib/i18n";
import styles from "./ThemeToggle.module.css";

interface ThemeToggleProps {
  t: (key: TranslationKey) => string;
}

export function ThemeToggle({ t }: ThemeToggleProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      type="button"
      className={styles.toggle}
      onClick={toggleTheme}
      aria-label={theme === "dark" ? t("switchToLight") : t("switchToDark")}
      title={theme === "dark" ? t("lightTheme") : t("darkTheme")}
    >
      {theme === "dark" ? "☀" : "☾"}
    </button>
  );
}
