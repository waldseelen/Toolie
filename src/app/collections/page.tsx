import { prisma } from "@/lib/prisma";
import { mapToolsToData } from "@/lib/tool-data";
import { CollectionsPageClient } from "@/components/CollectionsPageClient/CollectionsPageClient";

export default async function CollectionsPage() {
  const tools = mapToolsToData(
    await prisma.tool.findMany({
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        subcategory: {
          include: {
            category: true,
          },
        },
      },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "desc" }],
    })
  );

  return <CollectionsPageClient tools={tools} />;
}
