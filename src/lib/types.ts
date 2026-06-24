/* ── Shared TypeScript types for Toolie ── */

export interface TagData {
  id: string;
  name: string;
  slug: string;
}

export interface CategorySummaryData {
  id: string;
  name: string;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
  icon: string;
  color: string;
}

export interface SubcategorySummaryData {
  id: string;
  name: string;
  key: string | null;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
}

export interface ToolData {
  id: string;
  name: string;
  slug: string | null;
  link: string;
  description: string;
  descriptionEn: string | null;
  faviconUrl: string | null;
  featured?: boolean;
  featuredLabel?: string | null;
  pricingModel?: string | null;
  platforms?: string | null;
  hasApi?: boolean;
  isOpenSource?: boolean;
  officialDocsUrl?: string | null;
  githubUrl?: string | null;
  logoUrl?: string | null;
  status?: string;
  verified?: boolean;
  lastCheckedAt?: string | null;
  lastStatusCode?: number | null;
  isBroken?: boolean;
  votes?: number;
  sortOrder?: number;
  createdAt?: string | null;
  updatedAt?: string | null;
  tags?: TagData[];
  category?: CategorySummaryData;
  subcategory?: SubcategorySummaryData;
  subcategoryId?: string;
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

export interface SubmissionData {
  id: string;
  name: string;
  link: string;
  description: string;
  categoryKey: string | null;
  submittedAt: string;
  status: string;
}

export interface CompareState {
  ids: string[];
}

export interface CollectionData {
  id: string;
  name: string;
  toolIds: string[];
}
