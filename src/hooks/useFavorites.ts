"use client";

import { useState, useEffect, useCallback } from "react";

const STORAGE_KEY = "toolie-favorites";

export function useFavorites() {
  const [favorites, setFavorites] = useState<string[]>([]);

  /* Load from localStorage */
  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) {
          setFavorites(parsed);
        }
      }
    } catch {
      /* ignore corrupt data */
    }
  }, []);

  /* Persist to localStorage */
  const persist = useCallback((fav: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(fav));
    } catch {
      /* storage full or unavailable */
    }
  }, []);

  const toggleFavorite = useCallback(
    (id: string) => {
      setFavorites((prev) => {
        const next = prev.includes(id)
          ? prev.filter((f) => f !== id)
          : [...prev, id];
        persist(next);
        return next;
      });
    },
    [persist]
  );

  const isFavorite = useCallback(
    (id: string) => favorites.includes(id),
    [favorites]
  );

  return { favorites, toggleFavorite, isFavorite };
}
