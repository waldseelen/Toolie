import {
  getCategoriesWithSubcategoriesAndTools,
  getFeaturedTools,
  getLatestTools,
} from "@/lib/db";
import type { CategoryData, ToolStats } from "@/lib/types";
import { ToolieApp } from "./ToolieApp";

/* ── Server Component: fetch data from DB ── */
export default async function HomePage() {
  const [categories, featuredTools, latestTools] = await Promise.all([
    getCategoriesWithSubcategoriesAndTools(),
    getFeaturedTools(8),
    getLatestTools(8),
  ]);

  /* Compute stats */
  const stats: ToolStats = {
    totalTools: categories.reduce(
      (sum, cat) =>
        sum +
        cat.subcategories.reduce((s, sub) => s + sub.tools.length, 0),
      0
    ),
    totalCategories: categories.length,
    totalSubcategories: categories.reduce(
      (sum, cat) => sum + cat.subcategories.length,
      0
    ),
  };

  return (
    <ToolieApp
      categories={categories as CategoryData[]}
      featuredTools={featuredTools}
      latestTools={latestTools}
      stats={stats}
    />
  );
}

