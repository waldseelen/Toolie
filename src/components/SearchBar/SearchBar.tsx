"use client";

import { useRef, useEffect, useCallback } from "react";
import styles from "./SearchBar.module.css";
import type { TranslationKey } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  t: (key: TranslationKey) => string;
}

export function SearchBar({ value, onChange, t }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (
      ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") ||
      (e.key === "/" && !isFocusedInput())
    ) {
      e.preventDefault();
      inputRef.current?.focus();
    }

    if (e.key === "Escape" && document.activeElement === inputRef.current) {
      inputRef.current?.blur();
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className={styles.wrapper}>
      <label htmlFor="searchInput" className="srOnly">
        {t("searchAriaLabel")}
      </label>
      <input
        ref={inputRef}
        type="search"
        className={styles.searchBox}
        placeholder={t("searchPlaceholder")}
        aria-label={t("searchAriaLabel")}
        aria-keyshortcuts="Control+K"
        id="searchInput"
        autoComplete="off"
        spellCheck={false}
        value={value}
        onChange={(e) => onChange(e.target.value)}
      />
      <span className={styles.shortcutHint} aria-hidden="true">
        Ctrl+K
      </span>
    </div>
  );
}

function isFocusedInput(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}
