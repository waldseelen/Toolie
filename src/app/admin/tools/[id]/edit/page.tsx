import { notFound } from "next/navigation";
import { getToolById, getAllTags, getSubcategoriesForAdmin } from "@/lib/db";
import { EditToolForm } from "@/components/Admin/EditToolForm";

interface Props {
  params: Promise<{ id: string }>;
}

export default async function AdminEditToolPage({ params }: Props) {
  const { id } = await params;
  
  const [tool, allTags, allSubcategories] = await Promise.all([
    getToolById(id),
    getAllTags(),
    getSubcategoriesForAdmin(),
  ]);

  if (!tool) {
    notFound();
  }

  const editToolData = {
    ...tool,
    subcategoryId: tool.subcategory?.id || "",
    featured: tool.featured || false,
    pricingModel: tool.pricingModel || null,
    platforms: tool.platforms || null,
    tags: tool.tags || [],
  };

  return (
    <div>
      <h2>Edit Tool: {tool.name}</h2>
      <div style={{ marginTop: "2rem" }}>
        <EditToolForm
          mode="edit"
          tool={editToolData}
          allTags={allTags}
          allSubcategories={allSubcategories.map((subcategory) => ({
            id: subcategory.id,
            name: subcategory.name,
            key: subcategory.key,
            slug: subcategory.slug,
            nameTr: subcategory.nameTr,
            nameEn: subcategory.nameEn,
            categoryName: subcategory.category?.name || "GENERAL",
          }))}
        />
      </div>
    </div>
  );
}

