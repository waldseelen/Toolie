import { getLocalizedName, type SupportedLocale } from "@/lib/taxonomy";
import type {
  CategorySummaryData,
  SubcategorySummaryData,
  TagData,
  ToolData,
} from "@/lib/types";

export const PRICING_MODE_VALUES = ["free", "freemium", "paid"] as const;
export const PLATFORM_VALUES = ["web", "desktop", "mobile"] as const;
export const STATUS_VALUES = ["active", "dead", "redirected"] as const;

type ToolCategoryShape = {
  id: string;
  name: string;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
  icon: string;
  color: string;
};

type ToolSubcategoryShape = {
  id: string;
  name: string;
  key: string | null;
  slug: string | null;
  nameTr: string | null;
  nameEn: string | null;
  category?: ToolCategoryShape;
};

type ToolShape = {
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
  lastCheckedAt?: Date | string | null;
  lastStatusCode?: number | null;
  isBroken?: boolean;
  createdAt?: Date | string | null;
  updatedAt?: Date | string | null;
  tags?: TagData[];
  subcategory?: ToolSubcategoryShape;
};

function toIsoString(value?: Date | string | null): string | null {
  if (!value) {
    return null;
  }

  if (typeof value === "string") {
    return value;
  }

  return value.toISOString();
}

function mapCategory(category?: ToolCategoryShape): CategorySummaryData | undefined {
  if (!category) {
    return undefined;
  }

  return {
    id: category.id,
    name: category.name,
    slug: category.slug,
    nameTr: category.nameTr,
    nameEn: category.nameEn,
    icon: category.icon,
    color: category.color,
  };
}

function mapSubcategory(
  subcategory?: ToolSubcategoryShape
): SubcategorySummaryData | undefined {
  if (!subcategory) {
    return undefined;
  }

  return {
    id: subcategory.id,
    name: subcategory.name,
    key: subcategory.key,
    slug: subcategory.slug,
    nameTr: subcategory.nameTr,
    nameEn: subcategory.nameEn,
  };
}

export function mapToolToData(tool: ToolShape): ToolData {
  return {
    id: tool.id,
    name: tool.name,
    slug: tool.slug,
    link: tool.link,
    description: tool.description,
    descriptionEn: tool.descriptionEn,
    faviconUrl: tool.faviconUrl,
    featured: tool.featured ?? false,
    featuredLabel: tool.featuredLabel ?? null,
    pricingModel: tool.pricingModel ?? null,
    platforms: tool.platforms ?? null,
    hasApi: tool.hasApi ?? false,
    isOpenSource: tool.isOpenSource ?? false,
    officialDocsUrl: tool.officialDocsUrl ?? null,
    githubUrl: tool.githubUrl ?? null,
    logoUrl: tool.logoUrl ?? null,
    status: tool.status ?? "active",
    verified: tool.verified ?? false,
    lastCheckedAt: toIsoString(tool.lastCheckedAt),
    lastStatusCode: tool.lastStatusCode ?? null,
    isBroken: tool.isBroken ?? false,
    createdAt: toIsoString(tool.createdAt),
    updatedAt: toIsoString(tool.updatedAt),
    tags: tool.tags ?? [],
    category: mapCategory(tool.subcategory?.category),
    subcategory: mapSubcategory(tool.subcategory),
  };
}

export function mapToolsToData(tools: ToolShape[]): ToolData[] {
  return tools.map(mapToolToData);
}

export function getLocalizedToolDescription(
  tool: Pick<ToolData, "description" | "descriptionEn">,
  locale: SupportedLocale
): string {
  return locale === "en" && tool.descriptionEn
    ? tool.descriptionEn
    : tool.description;
}

export function getLocalizedCategoryName(
  category: Pick<CategorySummaryData, "name" | "nameTr" | "nameEn">,
  locale: SupportedLocale
): string {
  return getLocalizedName(locale, category.nameTr, category.nameEn, category.name);
}

export function getLocalizedSubcategoryName(
  subcategory: Pick<SubcategorySummaryData, "name" | "nameTr" | "nameEn">,
  locale: SupportedLocale
): string {
  return getLocalizedName(
    locale,
    subcategory.nameTr,
    subcategory.nameEn,
    subcategory.name
  );
}

export function splitPlatforms(platforms?: string | null): string[] {
  if (!platforms) {
    return [];
  }

  return platforms
    .split(",")
    .map((value) => value.trim().toLowerCase())
    .filter(Boolean);
}
