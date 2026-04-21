import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { EditToolForm } from "@/components/Admin/EditToolForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditToolPage({ params }: Props) {
  const { id } = await params;
  
  const [tool, allTags, allSubcategories] = await Promise.all([
    prisma.tool.findUnique({
      where: { id },
      include: {
        tags: { select: { id: true, name: true, slug: true } }
      }
    }),
    prisma.tag.findMany({
      orderBy: { name: "asc" },
      select: { id: true, name: true, slug: true }
    }),
    prisma.subcategory.findMany({
      orderBy: [{ category: { sortOrder: "asc" } }, { sortOrder: "asc" }],
      include: { category: true },
    }),
  ]);

  if (!tool) {
    notFound();
  }

  return (
    <div>
      <h2>Edit Tool: {tool.name}</h2>
      <div style={{ marginTop: "2rem" }}>
        <EditToolForm
          mode="edit"
          tool={tool}
          allTags={allTags}
          allSubcategories={allSubcategories.map((subcategory) => ({
            id: subcategory.id,
            name: subcategory.name,
            key: subcategory.key,
            slug: subcategory.slug,
            nameTr: subcategory.nameTr,
            nameEn: subcategory.nameEn,
            categoryName: subcategory.category.name,
          }))}
        />
      </div>
    </div>
  );
}
