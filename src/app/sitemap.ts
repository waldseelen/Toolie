import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { absoluteUrl } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [tools, categories, tags] = await Promise.all([
    prisma.tool.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.category.findMany({
      where: { slug: { not: null } },
      select: { slug: true, updatedAt: true },
    }),
    prisma.tag.findMany({
      select: { slug: true },
    }),
  ]);

  return [
    {
      url: absoluteUrl("/"),
      lastModified: new Date(),
    },
    ...tools.map((tool) => ({
      url: absoluteUrl(`/tool/${tool.slug}`),
      lastModified: tool.updatedAt,
    })),
    ...categories.map((category) => ({
      url: absoluteUrl(`/category/${category.slug}`),
      lastModified: category.updatedAt,
    })),
    ...tags.map((tag) => ({
      url: absoluteUrl(`/tag/${tag.slug}`),
      lastModified: new Date(),
    })),
  ];
}
