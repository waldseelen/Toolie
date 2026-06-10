/* eslint-disable @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars */
import { getDb } from "./firebase";
import type {
  CategoryData,
  SubcategoryData,
  ToolData,
  TagData,
  SubmissionData,
  CategorySummaryData,
  SubcategorySummaryData,
} from "./types";

// Helper to safely convert Firestore timestamps or dates to ISO strings
function toIsoString(val: any): string | null {
  if (!val) return null;
  if (typeof val === "string") return val;
  if (val.toDate && typeof val.toDate === "function") {
    return val.toDate().toISOString();
  }
  if (val instanceof Date) {
    return val.toISOString();
  }
  if (typeof val === "object" && val._seconds !== undefined) {
    return new Date(val._seconds * 1000).toISOString();
  }
  return null;
}

export interface dbFilters {
  cat?: string | null;
  tag?: string | null;
  pricing?: string | null;
  platform?: string | null;
  sort?: string | null;
}

export async function getCategoriesWithSubcategoriesAndTools(filters: dbFilters = {}) {
  try {
    const db = getDb();

    // 1. Fetch categories
    let categoriesQuery = db.collection("categories").orderBy("sortOrder", "asc");
    if (filters.cat) {
      categoriesQuery = categoriesQuery.where("name", "==", filters.cat);
    }
    const categoriesSnap = await categoriesQuery.get();
    const categories = categoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toIsoString(doc.data().createdAt),
      updatedAt: toIsoString(doc.data().updatedAt),
    })) as any[];

    if (categories.length === 0) {
      return [];
    }

    // 2. Fetch subcategories
    const subcategoriesSnap = await db
      .collection("subcategories")
      .orderBy("sortOrder", "asc")
      .get();
    const subcategories = subcategoriesSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
      createdAt: toIsoString(doc.data().createdAt),
      updatedAt: toIsoString(doc.data().updatedAt),
    })) as any[];

    // 3. Fetch tags
    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    })) as TagData[];
    const tagsMap = new Map(tags.map((t) => [t.id, t]));
    const tagsBySlugMap = new Map(tags.map((t) => [t.slug, t]));

    // 4. Fetch tools
    const toolsSnap = await db.collection("tools").get();
    const tools = toolsSnap.docs.map((doc) => {
      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        subcategoryId: data.subcategoryId || "",
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        sortOrder: data.sortOrder ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        votes: data.votes ?? 0,
        tags: toolTags,
        tagIds: data.tagIds || [],
      };
    }) as any[];

    // Prepare maps for quick lookup
    const subcategoriesMap = new Map(subcategories.map((s) => [s.id, s]));
    const categoriesMap = new Map(categories.map((c) => [c.id, c]));

    // Filter tools in-memory
    let filteredTools = tools;

    if (filters.tag) {
      const targetTag = tagsBySlugMap.get(filters.tag);
      if (targetTag) {
        filteredTools = filteredTools.filter((t) =>
          (t.tagIds || []).includes(targetTag.id)
        );
      } else {
        filteredTools = [];
      }
    }

    if (filters.pricing) {
      filteredTools = filteredTools.filter(
        (t) => t.pricingModel === filters.pricing
      );
    }

    if (filters.platform) {
      filteredTools = filteredTools.filter((t) =>
        t.platforms?.toLowerCase().includes(filters.platform!.toLowerCase())
      );
    }

    // Sort tools
    if (filters.sort === "newest") {
      filteredTools.sort(
        (a, b) =>
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
      );
    } else if (filters.sort === "az") {
      filteredTools.sort((a, b) => a.name.localeCompare(b.name));
    } else {
      // default sort: sortOrder asc, then createdAt asc
      filteredTools.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return (
          new Date(a.createdAt || 0).getTime() -
          new Date(b.createdAt || 0).getTime()
        );
      });
    }

    // Construct CategoryData hierarchy
    const subcategoryIdToTools = new Map<string, any[]>();
    for (const tool of filteredTools) {
      const subId = tool.subcategoryId;
      if (!subcategoryIdToTools.has(subId)) {
        subcategoryIdToTools.set(subId, []);
      }
      subcategoryIdToTools.get(subId)!.push(tool);
    }

    const categoryIdToSubcategories = new Map<string, any[]>();
    for (const sub of subcategories) {
      const catId = sub.categoryId;
      if (!categoryIdToSubcategories.has(catId)) {
        categoryIdToSubcategories.set(catId, []);
      }

      const subTools = subcategoryIdToTools.get(sub.id) || [];

      // Map subcategory for tools
      const mappedTools = subTools.map((t) => {
        const cat = categoriesMap.get(catId);
        return {
          ...t,
          category: cat
            ? ({
                id: cat.id,
                name: cat.name,
                slug: cat.slug,
                nameTr: cat.nameTr,
                nameEn: cat.nameEn,
                icon: cat.icon,
                color: cat.color,
              } as CategorySummaryData)
            : undefined,
          subcategory: {
            id: sub.id,
            name: sub.name,
            key: sub.key,
            slug: sub.slug,
            nameTr: sub.nameTr,
            nameEn: sub.nameEn,
          } as SubcategorySummaryData,
        };
      });

      categoryIdToSubcategories.get(catId)!.push({
        id: sub.id,
        name: sub.name,
        key: sub.key,
        slug: sub.slug,
        nameTr: sub.nameTr,
        nameEn: sub.nameEn,
        sortOrder: sub.sortOrder,
        tools: mappedTools,
      });
    }

    const result: CategoryData[] = [];
    for (const cat of categories) {
      const catSubs = categoryIdToSubcategories.get(cat.id) || [];
      // Ensure subcategories are sorted by sortOrder asc
      catSubs.sort((a, b) => a.sortOrder - b.sortOrder);

      result.push({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        nameTr: cat.nameTr,
        nameEn: cat.nameEn,
        icon: cat.icon,
        color: cat.color,
        sortOrder: cat.sortOrder,
        subcategories: catSubs as SubcategoryData[],
      });
    }

    return result;
  } catch (e) {
    console.warn("Firestore connection not ready/credentials missing during build.", e);
    return [];
  }
}

export async function getToolBySlug(slug: string): Promise<ToolData | null> {
  try {
    const db = getDb();
    const toolsSnap = await db.collection("tools").where("slug", "==", slug).limit(1).get();
    if (toolsSnap.empty) {
      return null;
    }

    const doc = toolsSnap.docs[0];
    const data = doc.data();

    // Fetch tag details
    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TagData));
    const tagsMap = new Map(tags.map((t) => [t.id, t]));
    const toolTags = (data.tagIds || [])
      .map((tid: string) => tagsMap.get(tid))
      .filter(Boolean) as TagData[];

    // Fetch subcategory and category
    const subDoc = await db.collection("subcategories").doc(data.subcategoryId).get();
    let subcategoryData: SubcategorySummaryData | undefined;
    let categoryData: CategorySummaryData | undefined;

    if (subDoc.exists) {
      const subData = subDoc.data()!;
      subcategoryData = {
        id: subDoc.id,
        name: subData.name || "",
        key: subData.key || null,
        slug: subData.slug || null,
        nameTr: subData.nameTr || null,
        nameEn: subData.nameEn || null,
      };

      const catDoc = await db.collection("categories").doc(subData.categoryId).get();
      if (catDoc.exists) {
        const catData = catDoc.data()!;
        categoryData = {
          id: catDoc.id,
          name: catData.name || "",
          slug: catData.slug || null,
          nameTr: catData.nameTr || null,
          nameEn: catData.nameEn || null,
          icon: catData.icon || "◈",
          color: catData.color || "#39ff14",
        };
      }
    }

    return {
      id: doc.id,
      name: data.name || "",
      slug: data.slug || null,
      link: data.link || "",
      description: data.description || "",
      descriptionEn: data.descriptionEn || null,
      faviconUrl: data.faviconUrl || null,
      featured: data.featured ?? false,
      featuredLabel: data.featuredLabel || null,
      pricingModel: data.pricingModel || null,
      platforms: data.platforms || null,
      hasApi: data.hasApi ?? false,
      isOpenSource: data.isOpenSource ?? false,
      officialDocsUrl: data.officialDocsUrl || null,
      githubUrl: data.githubUrl || null,
      logoUrl: data.logoUrl || null,
      status: data.status || "active",
      verified: data.verified ?? false,
      lastCheckedAt: toIsoString(data.lastCheckedAt),
      lastStatusCode: data.lastStatusCode ?? null,
      isBroken: data.isBroken ?? false,
      votes: data.votes ?? 0,
      createdAt: toIsoString(data.createdAt),
      updatedAt: toIsoString(data.updatedAt),
      tags: toolTags,
      category: categoryData,
      subcategory: subcategoryData,
    };
  } catch (e) {
    console.warn("Firestore connection error in getToolBySlug:", e);
    return null;
  }
}

export async function getToolById(id: string): Promise<ToolData | null> {
  try {
    const db = getDb();
    const doc = await db.collection("tools").doc(id).get();
    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;

    // Fetch tag details
    const tagsSnap = await db.collection("tags").get();
    const tags = tagsSnap.docs.map((d) => ({ id: d.id, ...d.data() } as TagData));
    const tagsMap = new Map(tags.map((t) => [t.id, t]));
    const toolTags = (data.tagIds || [])
      .map((tid: string) => tagsMap.get(tid))
      .filter(Boolean) as TagData[];

    // Fetch subcategory and category
    const subDoc = await db.collection("subcategories").doc(data.subcategoryId).get();
    let subcategoryData: SubcategorySummaryData | undefined;
    let categoryData: CategorySummaryData | undefined;

    if (subDoc.exists) {
      const subData = subDoc.data()!;
      subcategoryData = {
        id: subDoc.id,
        name: subData.name || "",
        key: subData.key || null,
        slug: subData.slug || null,
        nameTr: subData.nameTr || null,
        nameEn: subData.nameEn || null,
      };

      const catDoc = await db.collection("categories").doc(subData.categoryId).get();
      if (catDoc.exists) {
        const catData = catDoc.data()!;
        categoryData = {
          id: catDoc.id,
          name: catData.name || "",
          slug: catData.slug || null,
          nameTr: catData.nameTr || null,
          nameEn: catData.nameEn || null,
          icon: catDoc.data()!.icon || "◈",
          color: catDoc.data()!.color || "#39ff14",
        };
      }
    }

    return {
      id: doc.id,
      name: data.name || "",
      slug: data.slug || null,
      link: data.link || "",
      description: data.description || "",
      descriptionEn: data.descriptionEn || null,
      faviconUrl: data.faviconUrl || null,
      featured: data.featured ?? false,
      featuredLabel: data.featuredLabel || null,
      pricingModel: data.pricingModel || null,
      platforms: data.platforms || null,
      hasApi: data.hasApi ?? false,
      isOpenSource: data.isOpenSource ?? false,
      officialDocsUrl: data.officialDocsUrl || null,
      githubUrl: data.githubUrl || null,
      logoUrl: data.logoUrl || null,
      status: data.status || "active",
      verified: data.verified ?? false,
      lastCheckedAt: toIsoString(data.lastCheckedAt),
      lastStatusCode: data.lastStatusCode ?? null,
      isBroken: data.isBroken ?? false,
      votes: data.votes ?? 0,
      createdAt: toIsoString(data.createdAt),
      updatedAt: toIsoString(data.updatedAt),
      tags: toolTags,
      category: categoryData,
      subcategory: subcategoryData,
    };
  } catch (e) {
    console.warn("Firestore connection error in getToolById:", e);
    return null;
  }
}

export async function getSimilarTools(
  subcategoryId: string,
  excludeId: string,
  limit: number = 6
): Promise<ToolData[]> {
  try {
    const db = getDb();
    const toolsSnap = await db
      .collection("tools")
      .where("subcategoryId", "==", subcategoryId)
      .orderBy("sortOrder", "asc")
      .get();

    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const subDoc = await db.collection("subcategories").doc(subcategoryId).get();
    let subcategorySummary: SubcategorySummaryData | undefined;
    let categorySummary: CategorySummaryData | undefined;

    if (subDoc.exists) {
      const subData = subDoc.data()!;
      subcategorySummary = {
        id: subDoc.id,
        name: subData.name,
        key: subData.key,
        slug: subData.slug,
        nameTr: subData.nameTr,
        nameEn: subData.nameEn,
      };
      const catDoc = await db.collection("categories").doc(subData.categoryId).get();
      if (catDoc.exists) {
        const catData = catDoc.data()!;
        categorySummary = {
          id: catDoc.id,
          name: catData.name,
          slug: catData.slug,
          nameTr: catData.nameTr,
          nameEn: catData.nameEn,
          icon: catData.icon,
          color: catData.color,
        };
      }
    }

    const results: ToolData[] = [];
    for (const doc of toolsSnap.docs) {
      if (doc.id === excludeId) continue;
      if (results.length >= limit) break;

      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      results.push({
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        subcategory: subcategorySummary,
        category: categorySummary,
      });
    }

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getSimilarTools:", e);
    return [];
  }
}

export async function getFeaturedTools(limit: number = 8): Promise<ToolData[]> {
  try {
    const db = getDb();
    const toolsSnap = await db
      .collection("tools")
      .where("featured", "==", true)
      .orderBy("sortOrder", "asc")
      .get();

    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const subcategoriesSnap = await db.collection("subcategories").get();
    const subcategoriesMap = new Map(subcategoriesSnap.docs.map((s) => [s.id, s.data()]));

    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(categoriesSnap.docs.map((c) => [c.id, c.data()]));

    const results: ToolData[] = [];
    for (const doc of toolsSnap.docs) {
      if (results.length >= limit) break;

      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      let subcategorySummary: SubcategorySummaryData | undefined;
      let categorySummary: CategorySummaryData | undefined;

      const subData = subcategoriesMap.get(data.subcategoryId);
      if (subData) {
        subcategorySummary = {
          id: data.subcategoryId,
          name: subData.name,
          key: subData.key,
          slug: subData.slug,
          nameTr: subData.nameTr,
          nameEn: subData.nameEn,
        };

        const catData = categoriesMap.get(subData.categoryId);
        if (catData) {
          categorySummary = {
            id: subData.categoryId,
            name: catData.name,
            slug: catData.slug,
            nameTr: catData.nameTr,
            nameEn: catData.nameEn,
            icon: catData.icon,
            color: catData.color,
          };
        }
      }

      results.push({
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        subcategory: subcategorySummary,
        category: categorySummary,
      });
    }

    // Double check client sorting
    results.sort((a, b) => {
      if ((a.sortOrder ?? 0) !== (b.sortOrder ?? 0)) {
        return (a.sortOrder ?? 0) - (b.sortOrder ?? 0);
      }
      return (
        new Date(a.createdAt || 0).getTime() -
        new Date(b.createdAt || 0).getTime()
      );
    });

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getFeaturedTools:", e);
    return [];
  }
}

export async function getLatestTools(limit: number = 8): Promise<ToolData[]> {
  try {
    const db = getDb();
    const toolsSnap = await db.collection("tools").get();

    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const subcategoriesSnap = await db.collection("subcategories").get();
    const subcategoriesMap = new Map(subcategoriesSnap.docs.map((s) => [s.id, s.data()]));

    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(categoriesSnap.docs.map((c) => [c.id, c.data()]));

    const allTools = toolsSnap.docs.map((doc) => {
      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      let subcategorySummary: SubcategorySummaryData | undefined;
      let categorySummary: CategorySummaryData | undefined;

      const subData = subcategoriesMap.get(data.subcategoryId);
      if (subData) {
        subcategorySummary = {
          id: data.subcategoryId,
          name: subData.name,
          key: subData.key,
          slug: subData.slug,
          nameTr: subData.nameTr,
          nameEn: subData.nameEn,
        };

        const catData = categoriesMap.get(subData.categoryId);
        if (catData) {
          categorySummary = {
            id: subData.categoryId,
            name: catData.name,
            slug: catData.slug,
            nameTr: catData.nameTr,
            nameEn: catData.nameEn,
            icon: catData.icon,
            color: catData.color,
          };
        }
      }

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        subcategory: subcategorySummary,
        category: categorySummary,
        sortOrder: data.sortOrder ?? 0,
      };
    });

    // Sort by createdAt desc
    allTools.sort(
      (a, b) =>
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
    );

    return allTools.slice(0, limit);
  } catch (e) {
    console.warn("Firestore connection error in getLatestTools:", e);
    return [];
  }
}

export async function upvoteTool(id: string): Promise<number> {
  const db = getDb();
  const docRef = db.collection("tools").doc(id);
  
  return await db.runTransaction(async (transaction) => {
    const doc = await transaction.get(docRef);
    if (!doc.exists) {
      throw new Error("Tool not found");
    }

    const newVotes = (doc.data()?.votes ?? 0) + 1;
    transaction.update(docRef, { votes: newVotes });
    return newVotes;
  });
}

export async function getNextSortOrder(subcategoryId: string): Promise<number> {
  try {
    const db = getDb();
    const snap = await db
      .collection("tools")
      .where("subcategoryId", "==", subcategoryId)
      .get();

    let maxSort = -1;
    snap.forEach((doc) => {
      const order = doc.data().sortOrder;
      if (typeof order === "number" && order > maxSort) {
        maxSort = order;
      }
    });

    return maxSort + 1;
  } catch (e) {
    return 0;
  }
}

export async function createTool(data: any): Promise<any> {
  const db = getDb();
  const id = db.collection("tools").doc().id;
  const now = new Date().toISOString();

  const docRef = db.collection("tools").doc(id);
  const payload = {
    name: data.name,
    slug: data.slug,
    link: data.link,
    description: data.description,
    descriptionEn: data.descriptionEn || null,
    subcategoryId: data.subcategoryId,
    faviconUrl: data.faviconUrl || null,
    featured: data.featured ?? false,
    featuredLabel: data.featuredLabel || null,
    pricingModel: data.pricingModel || null,
    platforms: data.platforms || null,
    hasApi: data.hasApi ?? false,
    isOpenSource: data.isOpenSource ?? false,
    officialDocsUrl: data.officialDocsUrl || null,
    githubUrl: data.githubUrl || null,
    logoUrl: data.logoUrl || null,
    status: data.status || "active",
    verified: data.verified ?? false,
    lastCheckedAt: data.lastCheckedAt || null,
    lastStatusCode: data.lastStatusCode || null,
    isBroken: data.isBroken ?? false,
    sortOrder: data.sortOrder ?? 0,
    createdAt: now,
    updatedAt: now,
    votes: 0,
    tagIds: data.tagIds || [],
  };

  await docRef.set(payload);

  return { id, ...payload };
}

export async function updateTool(id: string, data: any): Promise<any> {
  const db = getDb();
  const docRef = db.collection("tools").doc(id);
  const now = new Date().toISOString();

  const payload: any = {
    updatedAt: now,
  };

  const fields = [
    "name",
    "slug",
    "link",
    "description",
    "descriptionEn",
    "subcategoryId",
    "faviconUrl",
    "featured",
    "featuredLabel",
    "pricingModel",
    "platforms",
    "hasApi",
    "isOpenSource",
    "officialDocsUrl",
    "githubUrl",
    "logoUrl",
    "status",
    "verified",
    "lastCheckedAt",
    "lastStatusCode",
    "isBroken",
    "sortOrder",
    "tagIds",
  ];

  for (const field of fields) {
    if (data[field] !== undefined) {
      payload[field] = data[field];
    }
  }

  await docRef.update(payload);
  const updatedDoc = await docRef.get();
  return { id, ...updatedDoc.data() };
}

export async function deleteTool(id: string): Promise<void> {
  const db = getDb();
  await db.collection("tools").doc(id).delete();
}

export async function getAllTags(): Promise<TagData[]> {
  try {
    const db = getDb();
    const snap = await db.collection("tags").orderBy("name", "asc").get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      slug: doc.data().slug || "",
    }));
  } catch (e) {
    console.warn("Firestore connection error in getAllTags:", e);
    return [];
  }
}

export async function getTagBySlug(slug: string): Promise<TagData | null> {
  try {
    const db = getDb();
    const snap = await db.collection("tags").where("slug", "==", slug).limit(1).get();
    if (snap.empty) {
      return null;
    }
    const doc = snap.docs[0];
    return {
      id: doc.id,
      name: doc.data().name || "",
      slug: doc.data().slug || "",
    };
  } catch (e) {
    console.warn("Firestore connection error in getTagBySlug:", e);
    return null;
  }
}

export async function getToolsByTagSlug(slug: string): Promise<ToolData[]> {
  try {
    const tag = await getTagBySlug(slug);
    if (!tag) {
      return [];
    }

    const db = getDb();
    const toolsSnap = await db.collection("tools").where("tagIds", "array-contains", tag.id).get();

    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const subcategoriesSnap = await db.collection("subcategories").get();
    const subcategoriesMap = new Map(subcategoriesSnap.docs.map((s) => [s.id, s.data()]));

    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(categoriesSnap.docs.map((c) => [c.id, c.data()]));

    const results = toolsSnap.docs.map((doc) => {
      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      let subcategorySummary: SubcategorySummaryData | undefined;
      let categorySummary: CategorySummaryData | undefined;

      const subData = subcategoriesMap.get(data.subcategoryId);
      if (subData) {
        subcategorySummary = {
          id: data.subcategoryId,
          name: subData.name,
          key: subData.key,
          slug: subData.slug,
          nameTr: subData.nameTr,
          nameEn: subData.nameEn,
        };

        const catData = categoriesMap.get(subData.categoryId);
        if (catData) {
          categorySummary = {
            id: subData.categoryId,
            name: catData.name,
            slug: catData.slug,
            nameTr: catData.nameTr,
            nameEn: catData.nameEn,
            icon: catData.icon,
            color: catData.color,
          };
        }
      }

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        subcategory: subcategorySummary,
        category: categorySummary,
        sortOrder: data.sortOrder ?? 0,
      };
    });

    // Default sort: sortOrder asc, then createdAt desc
    results.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getToolsByTagSlug:", e);
    return [];
  }
}

export async function getCategoryBySlug(slug: string): Promise<CategoryData | null> {
  try {
    const db = getDb();
    const catSnap = await db
      .collection("categories")
      .where("slug", "==", slug)
      .limit(1)
      .get();

    if (catSnap.empty) {
      return null;
    }

    const doc = catSnap.docs[0];
    const catData = doc.data();

    // Fetch subcategories for this category
    const subSnap = await db
      .collection("subcategories")
      .where("categoryId", "==", doc.id)
      .orderBy("sortOrder", "asc")
      .get();

    const subcategories = subSnap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      tools: [],
    })) as any[];

    // Fetch tools for all these subcategories
    const subIds = subcategories.map((s) => s.id);
    if (subIds.length === 0) {
      return {
        id: doc.id,
        name: catData.name || "",
        slug: catData.slug || null,
        nameTr: catData.nameTr || null,
        nameEn: catData.nameEn || null,
        icon: catData.icon || "◈",
        color: catData.color || "#39ff14",
        sortOrder: catData.sortOrder ?? 0,
        subcategories: [],
      };
    }

    // Fetch tag details to assign to tools
    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const toolsSnap = await db
      .collection("tools")
      .where("subcategoryId", "in", subIds)
      .get();

    const subIdToTools = new Map<string, any[]>();
    toolsSnap.docs.forEach((d) => {
      const data = d.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      const subId = data.subcategoryId;
      if (!subIdToTools.has(subId)) {
        subIdToTools.set(subId, []);
      }

      subIdToTools.get(subId)!.push({
        id: d.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        sortOrder: data.sortOrder ?? 0,
      });
    });

    const subcategoryData: SubcategoryData[] = subcategories.map((sub) => {
      const subTools = subIdToTools.get(sub.id) || [];
      // Sort tools: sortOrder asc, then createdAt desc
      subTools.sort((a, b) => {
        if (a.sortOrder !== b.sortOrder) {
          return a.sortOrder - b.sortOrder;
        }
        return (
          new Date(b.createdAt || 0).getTime() -
          new Date(a.createdAt || 0).getTime()
        );
      });

      const mappedTools = subTools.map((t) => ({
        ...t,
        subcategory: {
          id: sub.id,
          name: sub.name,
          key: sub.key,
          slug: sub.slug,
          nameTr: sub.nameTr,
          nameEn: sub.nameEn,
        },
        category: {
          id: doc.id,
          name: catData.name || "",
          slug: catData.slug || null,
          nameTr: catData.nameTr || null,
          nameEn: catData.nameEn || null,
          icon: catData.icon || "◈",
          color: catData.color || "#39ff14",
        },
      }));

      return {
        id: sub.id,
        name: sub.name,
        key: sub.key,
        slug: sub.slug,
        nameTr: sub.nameTr,
        nameEn: sub.nameEn,
        sortOrder: sub.sortOrder,
        tools: mappedTools,
      };
    });

    return {
      id: doc.id,
      name: catData.name || "",
      slug: catData.slug || null,
      nameTr: catData.nameTr || null,
      nameEn: catData.nameEn || null,
      icon: catData.icon || "◈",
      color: catData.color || "#39ff14",
      sortOrder: catData.sortOrder ?? 0,
      subcategories: subcategoryData,
    };
  } catch (e) {
    console.warn("Firestore connection error in getCategoryBySlug:", e);
    return null;
  }
}

export async function getSubcategoriesForAdmin() {
  try {
    const db = getDb();
    const subSnap = await db.collection("subcategories").orderBy("sortOrder", "asc").get();
    
    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(
      categoriesSnap.docs.map((c) => [c.id, { id: c.id, ...c.data() } as any])
    );

    const results = subSnap.docs.map((doc) => {
      const data = doc.data();
      const category = categoriesMap.get(data.categoryId);
      return {
        id: doc.id,
        name: data.name || "",
        key: data.key || null,
        slug: data.slug || null,
        nameTr: data.nameTr || null,
        nameEn: data.nameEn || null,
        sortOrder: data.sortOrder ?? 0,
        categoryId: data.categoryId,
        category: category || null,
      };
    });

    // Sort: category sortOrder asc, then subcategory sortOrder asc
    results.sort((a, b) => {
      const catAOrder = a.category?.sortOrder ?? 0;
      const catBOrder = b.category?.sortOrder ?? 0;
      if (catAOrder !== catBOrder) {
        return catAOrder - catBOrder;
      }
      return a.sortOrder - b.sortOrder;
    });

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getSubcategoriesForAdmin:", e);
    return [];
  }
}

export async function createSubmission(data: any): Promise<SubmissionData> {
  const db = getDb();
  const id = db.collection("submissions").doc().id;
  const now = new Date().toISOString();

  const docRef = db.collection("submissions").doc(id);
  const payload = {
    name: data.name,
    link: data.link,
    description: data.description,
    categoryKey: data.categoryKey || null,
    submittedAt: now,
    status: "pending",
  };

  await docRef.set(payload);
  return { id, ...payload, submittedAt: now };
}

export async function getPendingSubmissions(): Promise<SubmissionData[]> {
  try {
    const db = getDb();
    const snap = await db
      .collection("submissions")
      .where("status", "==", "pending")
      .get();

    const results = snap.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        name: data.name || "",
        link: data.link || "",
        description: data.description || "",
        categoryKey: data.categoryKey || null,
        submittedAt: toIsoString(data.submittedAt) || new Date().toISOString(),
        status: data.status || "pending",
      };
    });

    // Sort by submittedAt desc
    results.sort(
      (a, b) =>
        new Date(b.submittedAt).getTime() - new Date(a.submittedAt).getTime()
    );

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getPendingSubmissions:", e);
    return [];
  }
}

export async function getSubmissionById(id: string): Promise<SubmissionData | null> {
  try {
    const db = getDb();
    const doc = await db.collection("submissions").doc(id).get();
    if (!doc.exists) {
      return null;
    }

    const data = doc.data()!;
    return {
      id: doc.id,
      name: data.name || "",
      link: data.link || "",
      description: data.description || "",
      categoryKey: data.categoryKey || null,
      submittedAt: toIsoString(data.submittedAt) || new Date().toISOString(),
      status: data.status || "pending",
    };
  } catch (e) {
    console.warn("Firestore connection error in getSubmissionById:", e);
    return null;
  }
}

export async function updateSubmissionStatus(id: string, status: string): Promise<any> {
  const db = getDb();
  const docRef = db.collection("submissions").doc(id);
  await docRef.update({ status });
  const updatedDoc = await docRef.get();
  return { id, ...updatedDoc.data() };
}

export async function getSubcategoryFirstByCategoryId(categoryId: string): Promise<any | null> {
  try {
    const db = getDb();
    const snap = await db
      .collection("subcategories")
      .where("categoryId", "==", categoryId)
      .orderBy("sortOrder", "asc")
      .limit(1)
      .get();

    if (snap.empty) {
      return null;
    }

    return { id: snap.docs[0].id, ...snap.docs[0].data() };
  } catch (e) {
    return null;
  }
}

export async function getSubcategoryFirstByCategoryName(categoryName: string): Promise<any | null> {
  try {
    const db = getDb();
    const catSnap = await db
      .collection("categories")
      .where("name", "==", categoryName)
      .limit(1)
      .get();

    if (catSnap.empty) {
      return null;
    }

    return await getSubcategoryFirstByCategoryId(catSnap.docs[0].id);
  } catch (e) {
    return null;
  }
}

export async function getBrokenTools(): Promise<any[]> {
  try {
    const db = getDb();
    const snap = await db.collection("tools").where("isBroken", "==", true).get();
    
    const allSubcategoriesSnap = await db.collection("subcategories").get();
    const subcategoriesMap = new Map(
      allSubcategoriesSnap.docs.map((s) => [s.id, { id: s.id, ...s.data() } as any])
    );

    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(
      categoriesSnap.docs.map((c) => [c.id, { id: c.id, ...c.data() } as any])
    );

    const results = snap.docs.map((doc) => {
      const data = doc.data();
      const subcategory = subcategoriesMap.get(data.subcategoryId);
      const category = subcategory ? categoriesMap.get(subcategory.categoryId) : null;
      
      return {
        id: doc.id,
        name: data.name || "",
        link: data.link || "",
        isBroken: data.isBroken ?? false,
        lastStatusCode: data.lastStatusCode ?? null,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        subcategory: subcategory
          ? {
              ...subcategory,
              category: category || null,
            }
          : null,
      };
    });

    // Sort by lastCheckedAt desc, then name asc
    results.sort((a, b) => {
      const timeA = new Date(a.lastCheckedAt || 0).getTime();
      const timeB = new Date(b.lastCheckedAt || 0).getTime();
      if (timeA !== timeB) {
        return timeB - timeA;
      }
      return a.name.localeCompare(b.name);
    });

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getBrokenTools:", e);
    return [];
  }
}

export async function getAllTools(): Promise<ToolData[]> {
  try {
    const db = getDb();
    const toolsSnap = await db.collection("tools").get();

    const allTagsSnap = await db.collection("tags").get();
    const tagsMap = new Map(
      allTagsSnap.docs.map((d) => [d.id, { id: d.id, ...d.data() } as TagData])
    );

    const subcategoriesSnap = await db.collection("subcategories").get();
    const subcategoriesMap = new Map(subcategoriesSnap.docs.map((s) => [s.id, s.data()]));

    const categoriesSnap = await db.collection("categories").get();
    const categoriesMap = new Map(categoriesSnap.docs.map((c) => [c.id, c.data()]));

    const results = toolsSnap.docs.map((doc) => {
      const data = doc.data();
      const toolTags = (data.tagIds || [])
        .map((tid: string) => tagsMap.get(tid))
        .filter(Boolean) as TagData[];

      let subcategorySummary: SubcategorySummaryData | undefined;
      let categorySummary: CategorySummaryData | undefined;

      const subData = subcategoriesMap.get(data.subcategoryId);
      if (subData) {
        subcategorySummary = {
          id: data.subcategoryId,
          name: subData.name,
          key: subData.key,
          slug: subData.slug,
          nameTr: subData.nameTr,
          nameEn: subData.nameEn,
        };

        const catData = categoriesMap.get(subData.categoryId);
        if (catData) {
          categorySummary = {
            id: subData.categoryId,
            name: catData.name,
            slug: catData.slug,
            nameTr: catData.nameTr,
            nameEn: catData.nameEn,
            icon: catData.icon,
            color: catData.color,
          };
        }
      }

      return {
        id: doc.id,
        name: data.name || "",
        slug: data.slug || null,
        link: data.link || "",
        description: data.description || "",
        descriptionEn: data.descriptionEn || null,
        faviconUrl: data.faviconUrl || null,
        featured: data.featured ?? false,
        featuredLabel: data.featuredLabel || null,
        pricingModel: data.pricingModel || null,
        platforms: data.platforms || null,
        hasApi: data.hasApi ?? false,
        isOpenSource: data.isOpenSource ?? false,
        officialDocsUrl: data.officialDocsUrl || null,
        githubUrl: data.githubUrl || null,
        logoUrl: data.logoUrl || null,
        status: data.status || "active",
        verified: data.verified ?? false,
        lastCheckedAt: toIsoString(data.lastCheckedAt),
        lastStatusCode: data.lastStatusCode ?? null,
        isBroken: data.isBroken ?? false,
        votes: data.votes ?? 0,
        createdAt: toIsoString(data.createdAt),
        updatedAt: toIsoString(data.updatedAt),
        tags: toolTags,
        subcategory: subcategorySummary,
        category: categorySummary,
        sortOrder: data.sortOrder ?? 0,
      };
    });

    // Sort tools: sortOrder asc, then createdAt desc
    results.sort((a, b) => {
      if (a.sortOrder !== b.sortOrder) {
        return a.sortOrder - b.sortOrder;
      }
      return (
        new Date(b.createdAt || 0).getTime() -
        new Date(a.createdAt || 0).getTime()
      );
    });

    return results;
  } catch (e) {
    console.warn("Firestore connection error in getAllTools:", e);
    return [];
  }
}

export async function getAllToolsMinimal(): Promise<any[]> {
  try {
    const db = getDb();
    const snap = await db.collection("tools").get();
    return snap.docs.map((doc) => ({
      id: doc.id,
      name: doc.data().name || "",
      link: doc.data().link || "",
    }));
  } catch (e) {
    return [];
  }
}
