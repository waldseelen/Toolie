"use client";

import { Suspense, useMemo, useState, useCallback, useEffect } from "react";
import { Header } from "@/components/Header/Header";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { ToolGrid } from "@/components/ToolGrid/ToolGrid";
import { Footer } from "@/components/Footer/Footer";
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/hooks/useLanguage";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import type { CategoryData, ToolStats } from "@/lib/types";

interface ToolieAppProps {
  categories: CategoryData[];
  stats: ToolStats;
}

function ToolieAppInner({ categories, stats }: ToolieAppProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const { locale, toggleLanguage, t } = useLanguage();

  const activeCategory = searchParams.get("cat") || "GENERAL";
  const searchQuery = searchParams.get("q") || "";

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { favorites, toggleFavorite } = useFavorites();

  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (localSearch) {
        params.set("q", localSearch);
      } else {
        params.delete("q");
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [localSearch, searchParams, router, pathname]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (cat === "GENERAL") {
        params.delete("cat");
      } else {
        params.set("cat", cat);
      }
      const qs = params.toString();
      router.replace(`${pathname}${qs ? `?${qs}` : ""}`, { scroll: false });
    },
    [searchParams, router, pathname]
  );

  const activeCategoryData = useMemo(
    () => categories.find((c) => c.name === activeCategory) || categories[0],
    [categories, activeCategory]
  );

  return (
    <>
      <Header
        stats={stats}
        locale={locale}
        toggleLanguage={toggleLanguage}
        t={t}
      />
      <SearchBar value={localSearch} onChange={setLocalSearch} t={t} />
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        onCategoryChange={handleCategoryChange}
        t={t}
      />
      <main id="main-content" style={{ padding: "16px", maxWidth: "1600px", margin: "0 auto" }}>
        {activeCategoryData && (
          <ToolGrid
            category={activeCategoryData}
            locale={locale}
            searchQuery={localSearch}
            favorites={favorites}
            onToggleFavorite={toggleFavorite}
            t={t}
          />
        )}
      </main>
      <Footer t={t} />
    </>
  );
}

export function ToolieApp({ categories, stats }: ToolieAppProps) {
  return (
    <Suspense>
      <ToolieAppInner categories={categories} stats={stats} />
    </Suspense>
  );
}
