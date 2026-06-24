"use client";

import { useEffect, useState } from "react";
import type { ToolData } from "@/lib/types";

export function useToolSearch(tools: ToolData[]) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ToolData[]>(tools);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const trimmed = query.trim();
    if (!trimmed) {
      setResults(tools);
      setIsSearching(false);
      return;
    }

    setIsSearching(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(trimmed)}`);
        const ids: string[] = await res.json();
        setResults(tools.filter(t => ids.includes(t.id)));
      } catch (err) {
        console.error("Search failed", err);
        setResults([]);
      } finally {
        setIsSearching(false);
      }
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [query, tools]);

  return {
    setSearchQuery: setQuery,
    searchResults: results,
    isSearching
  };
}
