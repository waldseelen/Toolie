"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { type Locale, translations, type TranslationKey } from "@/lib/i18n";

const STORAGE_KEY = "toolie-lang";

export function useLanguage() {
  const [locale, setLocale] = useState<Locale>("tr");

  /* Initialize from localStorage */
  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY) as Locale | null;
    if (stored === "tr" || stored === "en") {
      setLocale(stored);
      document.documentElement.setAttribute("lang", stored);
    }
  }, []);

  const toggleLanguage = useCallback(() => {
    setLocale((prev) => {
      const next: Locale = prev === "tr" ? "en" : "tr";
      localStorage.setItem(STORAGE_KEY, next);
      document.documentElement.setAttribute("lang", next);
      return next;
    });
  }, []);

  const t = useCallback(
    (key: TranslationKey): string => {
      return translations[locale][key];
    },
    [locale]
  );

  return useMemo(
    () => ({ locale, toggleLanguage, t }),
    [locale, toggleLanguage, t]
  );
}
