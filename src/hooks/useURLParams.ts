"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useURLParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategory = searchParams.get("cat") || "GENERAL";
  const searchQuery = searchParams.get("q") || "";

  const updateParams = useCallback(
    (updates: { cat?: string; q?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      if (updates.cat !== undefined) {
        if (updates.cat === "GENERAL") {
          params.delete("cat");
        } else {
          params.set("cat", updates.cat);
        }
      }

      if (updates.q !== undefined) {
        if (updates.q === "") {
          params.delete("q");
        } else {
          params.set("q", updates.q);
        }
      }

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setCategory = useCallback(
    (cat: string) => updateParams({ cat }),
    [updateParams]
  );

  const setSearch = useCallback(
    (q: string) => updateParams({ q }),
    [updateParams]
  );

  return useMemo(
    () => ({
      activeCategory,
      searchQuery,
      setCategory,
      setSearch,
    }),
    [activeCategory, searchQuery, setCategory, setSearch]
  );
}
