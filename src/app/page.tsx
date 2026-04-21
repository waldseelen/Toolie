import { prisma } from "@/lib/prisma";
import type { CategoryData, ToolStats } from "@/lib/types";
import { mapToolsToData, mapToolToData } from "@/lib/tool-data";
import { ToolieApp } from "./ToolieApp";

/* ── Server Component: fetch data from DB ── */
export default async function HomePage() {
  const [categories, featuredTools, latestTools] = await Promise.all([
    prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      include: {
        subcategories: {
          orderBy: { sortOrder: "asc" },
          include: {
            tools: {
              orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
              include: { tags: { select: { id: true, name: true, slug: true } } },
            },
          },
        },
      },
    }),
    prisma.tool.findMany({
      where: { featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      take: 8,
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    }),
    prisma.tool.findMany({
      orderBy: { createdAt: "desc" },
      take: 8,
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    }),
  ]);

  /* Map Prisma result to our types */
  const categoryData: CategoryData[] = categories.map((cat) => ({
    id: cat.id,
    name: cat.name,
    slug: cat.slug,
    nameTr: cat.nameTr,
    nameEn: cat.nameEn,
    icon: cat.icon,
    color: cat.color,
    sortOrder: cat.sortOrder,
    subcategories: cat.subcategories.map((sub) => ({
      id: sub.id,
      name: sub.name,
      key: sub.key,
      slug: sub.slug,
      nameTr: sub.nameTr,
      nameEn: sub.nameEn,
      sortOrder: sub.sortOrder,
      tools: sub.tools.map((tool) =>
        mapToolToData({
          ...tool,
          subcategory: {
            id: sub.id,
            name: sub.name,
            key: sub.key,
            slug: sub.slug,
            nameTr: sub.nameTr,
            nameEn: sub.nameEn,
            category: {
              id: cat.id,
              name: cat.name,
              slug: cat.slug,
              nameTr: cat.nameTr,
              nameEn: cat.nameEn,
              icon: cat.icon,
              color: cat.color,
            },
          },
        })
      ),
    })),
  }));

  /* Compute stats */
  const stats: ToolStats = {
    totalTools: categoryData.reduce(
      (sum, cat) =>
        sum +
        cat.subcategories.reduce((s, sub) => s + sub.tools.length, 0),
      0
    ),
    totalCategories: categoryData.length,
    totalSubcategories: categoryData.reduce(
      (sum, cat) => sum + cat.subcategories.length,
      0
    ),
  };

  return (
    <ToolieApp
      categories={categoryData}
      featuredTools={mapToolsToData(featuredTools)}
      latestTools={mapToolsToData(latestTools)}
      stats={stats}
    />
  );
}
