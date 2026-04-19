import { prisma } from "@/lib/prisma";
import type { CategoryData, ToolStats } from "@/lib/types";
import { ToolieApp } from "./ToolieApp";

/* ── Server Component: fetch data from DB ── */
export default async function HomePage() {
  const categories = await prisma.category.findMany({
    orderBy: { sortOrder: "asc" },
    include: {
      subcategories: {
        orderBy: { sortOrder: "asc" },
        include: {
          tools: {
            orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
          },
        },
      },
    },
  });

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
      tools: sub.tools.map((tool) => ({
        id: tool.id,
        name: tool.name,
        link: tool.link,
        description: tool.description,
        descriptionEn: tool.descriptionEn,
        faviconUrl: tool.faviconUrl,
      })),
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

  return <ToolieApp categories={categoryData} stats={stats} />;
}
