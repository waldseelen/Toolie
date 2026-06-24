import type { MetadataRoute } from "next";
import { getAllTools, getCategoriesWithSubcategoriesAndTools, getAllTags } from "@/lib/db";
import { absoluteUrl } from "@/lib/site";
import type { CategoryData, TagData } from "@/lib/types";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, tags] = await Promise.all([
    getAllTools(),
    getCategoriesWithSubcategoriesAndTools(),
    getAllTags(),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
    },
    ...tools
      .filter((tool) => tool.slug)
      .map((tool) => ({
        url: absoluteUrl(`/tool/${tool.slug}`),
        lastModified: tool.updatedAt ? new Date(tool.updatedAt) : new Date(),
      })),
    ...(categories as CategoryData[])
      .filter((category: CategoryData) => category.slug)
      .map((category: CategoryData) => ({
        url: absoluteUrl(`/category/${category.slug}`),
        lastModified: new Date(),
      })),
    ...(tags as TagData[])
      .filter((tag: TagData) => tag.slug)
      .map((tag: TagData) => ({
        url: absoluteUrl(`/tag/${tag.slug}`),
        lastModified: new Date(),
      })),
  ];
}

