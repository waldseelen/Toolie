"use client";

import { useRef, useEffect, useCallback, useState } from "react";
import styles from "./SearchBar.module.css";
import type { TranslationKey } from "@/lib/i18n";

interface SearchBarProps {
  value: string;
  onChange: (value: string) => void;
  t: (key: TranslationKey) => string;
}

export function SearchBar({ value, onChange, t }: SearchBarProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem("toolie-search-history");
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch {
        // ignore errors
      }
    }
  }, []);

  const saveToHistory = useCallback((query: string) => {
    const trimmed = query.trim();
    if (!trimmed) return;
    setHistory((prev) => {
      const filtered = prev.filter((item) => item !== trimmed);
      const next = [trimmed, ...filtered].slice(0, 5);
      localStorage.setItem("toolie-search-history", JSON.stringify(next));
      return next;
    });
  }, []);

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
      setShowHistory(false);
    }
  }, []);

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      saveToHistory(value);
      setShowHistory(false);
    }
  };

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
        onKeyDown={handleInputKeyDown}
        onFocus={() => setShowHistory(true)}
        onBlur={() => {
          // small timeout to let click events inside dropdown fire before it gets hidden
          setTimeout(() => setShowHistory(false), 200);
        }}
      />
      <span className={styles.shortcutHint} aria-hidden="true">
        <kbd className={styles.kbd}>Ctrl</kbd>+<kbd className={styles.kbd}>K</kbd>
      </span>

      {showHistory && history.length > 0 && (
        <div className={styles.historyDropdown}>
          {history.map((item, idx) => (
            <button
              key={idx}
              type="button"
              className={styles.historyItem}
              onClick={() => {
                onChange(item);
                saveToHistory(item);
                setShowHistory(false);
              }}
            >
              &gt; {item}
            </button>
          ))}
          <button
            type="button"
            className={styles.clearHistory}
            onClick={(e) => {
              e.stopPropagation();
              setHistory([]);
              localStorage.removeItem("toolie-search-history");
              setShowHistory(false);
            }}
          >
            [ {t("clearCompare").toUpperCase()} ]
          </button>
        </div>
      )}
    </div>
  );
}

function isFocusedInput(): boolean {
  const el = document.activeElement;
  if (!el) return false;
  const tag = el.tagName.toLowerCase();
  return tag === "input" || tag === "textarea" || tag === "select";
}
