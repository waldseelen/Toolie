"use client";

import {
  Suspense,
  startTransition,
  useDeferredValue,
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
import { useFavorites } from "@/hooks/useFavorites";
import { useLanguage } from "@/hooks/useLanguage";
import { useCompare } from "@/hooks/useCompare";
import { useCollections } from "@/hooks/useCollections";
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
  const deferredSearch = useDeferredValue(localSearch);
  const { favorites, toggleFavorite } = useFavorites();
  const { ids: comparedIds, toggle: toggleCompare, clear: clearCompare } =
    useCompare();
  const {
    collections,
    createCollection,
    toggleTool: toggleCollectionTool,
  } = useCollections();
  const allTools = useMemo(
    () =>
      categories.flatMap((category) =>
        category.subcategories.flatMap((subcategory) => subcategory.tools)
      ),
    [categories]
  );
  const { search } = useToolSearch(allTools);
  const searchResults = useMemo(
    () => search(deferredSearch),
    [deferredSearch, search]
  );
  const searchResultIds = useMemo(
    () =>
      deferredSearch.trim()
        ? new Set(searchResults.map((tool) => tool.id))
        : null,
    [deferredSearch, searchResults]
  );
  const comparedTools = useMemo(
    () =>
      comparedIds
        .map((id) => allTools.find((tool) => tool.id === id))
        .filter((tool): tool is ToolData => Boolean(tool)),
    [allTools, comparedIds]
  );

  useEffect(() => {
    if (localSearch === searchQuery) {
      return;
    }

    startTransition(() => {
      setSearch(localSearch);
    });
  }, [localSearch, searchQuery, setSearch]);

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
          locale={locale}
          featuredTools={featuredTools}
          latestTools={latestTools}
          favorites={favorites}
          comparedIds={comparedIds}
          collections={collections}
          onCreateCollection={createCollection}
          onToggleCollection={toggleCollectionTool}
          onToggleCompare={toggleCompare}
          onToggleFavorite={toggleFavorite}
          t={t}
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
            locale={locale}
            searchQuery={localSearch}
            tag={tag}
            pricing={pricing}
            platform={platform}
            sort={sort}
            searchResultIds={searchResultIds}
            favorites={favorites}
            comparedIds={comparedIds}
            collections={collections}
            onCreateCollection={createCollection}
            onToggleCollection={toggleCollectionTool}
            onToggleFavorite={toggleFavorite}
            onToggleCompare={toggleCompare}
            t={t}
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
