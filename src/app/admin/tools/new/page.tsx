import { getAllTags, getSubcategoriesForAdmin } from "@/lib/db";
import { EditToolForm } from "@/components/Admin/EditToolForm";

export default async function AdminNewToolPage() {
  const [allTags, allSubcategories] = await Promise.all([
    getAllTags(),
    getSubcategoriesForAdmin(),
  ]);

  // Dummy empty tool for the form
  const emptyTool = {
    id: "new",
    name: "",
    link: "",
    description: "",
    descriptionEn: null,
    subcategoryId: "",
    featured: false,
    featuredLabel: null,
    pricingModel: null,
    platforms: null,
    hasApi: false,
    isOpenSource: false,
    officialDocsUrl: null,
    githubUrl: null,
    logoUrl: null,
    status: "active",
    verified: false,
    tags: []
  };

  return (
    <div>
      <h2>Create New Tool</h2>
      <div style={{ marginTop: "2rem" }}>
        <EditToolForm
          mode="create"
          tool={emptyTool}
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

