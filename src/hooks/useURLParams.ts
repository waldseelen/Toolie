"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";

export function useURLParams() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const activeCategory = searchParams.get("cat") || "GENERAL";
  const searchQuery = searchParams.get("q") || "";
  const tag = searchParams.get("tag") || "";
  const pricing = searchParams.get("pricing") || "";
  const platform = searchParams.get("platform") || "";
  const sort = searchParams.get("sort") || "";

  const updateParams = useCallback(
    (updates: { cat?: string; q?: string; tag?: string; pricing?: string; platform?: string; sort?: string }) => {
      const params = new URLSearchParams(searchParams.toString());

      const handleParam = (key: string, value: string | undefined, defaultValue: string = "") => {
        if (value !== undefined) {
          if (value === defaultValue) {
            params.delete(key);
          } else {
            params.set(key, value);
          }
        }
      };

      handleParam("cat", updates.cat, "GENERAL");
      handleParam("q", updates.q, "");
      handleParam("tag", updates.tag, "");
      handleParam("pricing", updates.pricing, "");
      handleParam("platform", updates.platform, "");
      handleParam("sort", updates.sort, "");

      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const setCategory = useCallback((cat: string) => updateParams({ cat }), [updateParams]);
  const setSearch = useCallback((q: string) => updateParams({ q }), [updateParams]);
  const setTag = useCallback((tag: string) => updateParams({ tag }), [updateParams]);
  const setPricing = useCallback((pricing: string) => updateParams({ pricing }), [updateParams]);
  const setPlatform = useCallback((platform: string) => updateParams({ platform }), [updateParams]);
  const setSort = useCallback((sort: string) => updateParams({ sort }), [updateParams]);

  return useMemo(
    () => ({
      activeCategory,
      searchQuery,
      tag,
      pricing,
      platform,
      sort,
      setCategory,
      setSearch,
      setTag,
      setPricing,
      setPlatform,
      setSort,
    }),
    [
      activeCategory, searchQuery, tag, pricing, platform, sort,
      setCategory, setSearch, setTag, setPricing, setPlatform, setSort
    ]
  );
}
