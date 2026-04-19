/* ── Shared TypeScript types for Toolie ── */

export interface ToolData {
  id: string;
  name: string;
  link: string;
  description: string;
  descriptionEn: string | null;
  faviconUrl: string | null;
}

export interface SubcategoryData {
  id: string;
  name: string;
  key: string | null;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
  sortOrder: number;
  tools: ToolData[];
}

export interface CategoryData {
  id: string;
  name: string;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
  icon: string;
  color: string;
  sortOrder: number;
  subcategories: SubcategoryData[];
}

export interface ToolStats {
  totalTools: number;
  totalCategories: number;
  totalSubcategories: number;
}
