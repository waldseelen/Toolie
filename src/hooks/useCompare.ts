"use client";

import { useCallback, useEffect, useState } from "react";

const STORAGE_KEY = "toolie-compare";
const MAX_COMPARE_ITEMS = 4;

export function useCompare() {
  const [ids, setIds] = useState<string[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) {
        return;
      }

      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setIds(parsed.filter((value): value is string => typeof value === "string"));
      }
    } catch {
      /* ignore invalid storage */
    }
  }, []);

  const persist = useCallback((nextIds: string[]) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(nextIds));
    } catch {
      /* ignore storage errors */
    }
  }, []);

  const toggle = useCallback(
    (id: string) => {
      setIds((prev) => {
        let nextIds: string[];

        if (prev.includes(id)) {
          nextIds = prev.filter((currentId) => currentId !== id);
        } else if (prev.length >= MAX_COMPARE_ITEMS) {
          nextIds = [...prev.slice(1), id];
        } else {
          nextIds = [...prev, id];
        }

        persist(nextIds);
        return nextIds;
      });
    },
    [persist]
  );

  const clear = useCallback(() => {
    setIds([]);
    persist([]);
  }, [persist]);

  return { ids, toggle, clear, maxItems: MAX_COMPARE_ITEMS };
}
