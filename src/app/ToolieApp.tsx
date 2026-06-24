"use client";

import {
  Suspense,
  startTransition,
  useMemo,
  useState,
  useCallback,
  useEffect,
} from "react";
import { Header } from "@/components/Header/Header";
import { SearchBar } from "@/components/SearchBar/SearchBar";
import { FilterBar } from "@/components/FilterBar/FilterBar";
import { CategoryNav } from "@/components/CategoryNav/CategoryNav";
import { ToolGrid } from "@/components/ToolGrid/ToolGrid";
import { Footer } from "@/components/Footer/Footer";
import { HomeSections } from "@/components/HomeSections/HomeSections";
import { CompareTray } from "@/components/CompareTray/CompareTray";
import { useLanguage } from "@/hooks/useLanguage";
import { useCompare } from "@/hooks/useCompare";
import { useToolSearch } from "@/hooks/useToolSearch";
import { useURLParams } from "@/hooks/useURLParams";
import type { CategoryData, ToolData, ToolStats } from "@/lib/types";
import appStyles from "./ToolieApp.module.css";

interface ToolieAppProps {
  categories: CategoryData[];
  featuredTools: ToolData[];
  latestTools: ToolData[];
  stats: ToolStats;
}

function ToolieAppInner({ categories, featuredTools, latestTools, stats }: ToolieAppProps) {
  const { locale, toggleLanguage, t } = useLanguage();

  const {
    activeCategory,
    searchQuery,
    tag,
    pricing,
    platform,
    sort,
    setCategory,
    setSearch,
  } = useURLParams();

  const [localSearch, setLocalSearch] = useState(searchQuery);
  const { ids: comparedIds, toggle: toggleCompare, clear: clearCompare } =

    useCompare();
  const allTools = useMemo(
    () =>
      categories.flatMap((category) =>
        category.subcategories.flatMap((subcategory) => subcategory.tools)
      ),
    [categories]
  );
  const { setSearchQuery, searchResults } = useToolSearch(allTools);

  const searchResultIds = useMemo(
    () =>
      localSearch.trim()
        ? new Set(searchResults.map((tool) => tool.id))
        : null,
    [localSearch, searchResults]
  );
  const comparedTools = useMemo(
    () =>
      comparedIds
        .map((id) => allTools.find((tool) => tool.id === id))
        .filter((tool): tool is ToolData => Boolean(tool)),
    [allTools, comparedIds]
  );

  useEffect(() => {
    setSearchQuery(localSearch);
    if (localSearch === searchQuery) {
      return;
    }

    startTransition(() => {
      setSearch(localSearch);
    });
  }, [localSearch, searchQuery, setSearch, setSearchQuery]);

  useEffect(() => {
    setLocalSearch(searchQuery);
  }, [searchQuery]);

  const handleCategoryChange = useCallback(
    (cat: string) => {
      setCategory(cat);
    },
    [setCategory]
  );

  const activeCategoryData = useMemo(
    () => categories.find((c) => c.name === activeCategory) || categories[0],
    [categories, activeCategory]
  );
  const shouldShowHomeSections =
    activeCategory === categories[0]?.name &&
    !localSearch.trim() &&
    !tag &&
    !pricing &&
    !platform;

  const hasTray = comparedIds.length > 0;

  return (
    <div className={`${appStyles.appWrapper} ${hasTray ? appStyles.trayActive : ''}`}>
      <Header
        stats={stats}
        locale={locale}
        toggleLanguage={toggleLanguage}
        t={t}
      />
      <SearchBar value={localSearch} onChange={setLocalSearch} t={t} />
      <FilterBar t={t} />
      {shouldShowHomeSections && (
        <HomeSections
          featuredTools={featuredTools}
          latestTools={latestTools}
          comparedIds={comparedIds}
          onToggleCompare={toggleCompare}
        />
      )}
      <CategoryNav
        categories={categories}
        activeCategory={activeCategory}
        locale={locale}
        onCategoryChange={handleCategoryChange}
        t={t}
      />
      <main id="main-content" style={{ padding: "16px", maxWidth: "1600px", margin: "0 auto" }}>
        {activeCategoryData && (
          <ToolGrid
            category={activeCategoryData}
            searchQuery={localSearch}
            tag={tag}
            pricing={pricing}
            platform={platform}
            sort={sort}
            searchResultIds={searchResultIds}
            comparedIds={comparedIds}
            onToggleCompare={toggleCompare}
          />
        )}
      </main>
      <CompareTray comparedTools={comparedTools} onClear={clearCompare} t={t} />
      <div className={appStyles.footerSpacer}>
        <Footer t={t} />
      </div>
    </div>
  );
}

export function ToolieApp({
  categories,
  featuredTools,
  latestTools,
  stats,
}: ToolieAppProps) {
  return (
    <Suspense>
      <ToolieAppInner
        categories={categories}
        featuredTools={featuredTools}
        latestTools={latestTools}
        stats={stats}
      />
    </Suspense>
  );
}
