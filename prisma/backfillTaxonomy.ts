import { PrismaClient } from "@prisma/client";
import { TAXONOMY } from "../src/lib/taxonomy";

const prisma = new PrismaClient();

async function main() {
  console.log("🧭 Backfilling taxonomy metadata...");

  for (const [categoryIndex, categoryConfig] of TAXONOMY.entries()) {
    const category = await prisma.category.findUnique({
      where: { name: categoryConfig.key },
      select: { id: true, name: true },
    });

    if (!category) {
      throw new Error(`Missing category for key: ${categoryConfig.key}`);
    }

    await prisma.category.update({
      where: { id: category.id },
      data: {
        slug: categoryConfig.slug,
        nameTr: categoryConfig.nameTr,
        nameEn: categoryConfig.nameEn,
        icon: categoryConfig.icon,
        color: categoryConfig.color,
        sortOrder: categoryIndex,
      },
    });

    console.log(`📁 ${category.name} updated`);

    for (const [subcategoryIndex, subcategoryConfig] of categoryConfig.subcategories.entries()) {
      const subcategory = await prisma.subcategory.findFirst({
        where: {
          categoryId: category.id,
          name: subcategoryConfig.oldName,
        },
        select: { id: true, name: true },
      });

      if (!subcategory) {
        throw new Error(
          `Missing subcategory for ${categoryConfig.key} > ${subcategoryConfig.oldName}`
        );
      }

      await prisma.subcategory.update({
        where: { id: subcategory.id },
        data: {
          key: subcategoryConfig.key,
          slug: subcategoryConfig.slug,
          nameTr: subcategoryConfig.nameTr,
          nameEn: subcategoryConfig.nameEn,
          sortOrder: subcategoryIndex,
        },
      });

      const tools = await prisma.tool.findMany({
        where: { subcategoryId: subcategory.id },
        orderBy: [{ createdAt: "asc" }, { id: "asc" }],
        select: { id: true },
      });

      for (const [toolIndex, tool] of tools.entries()) {
        await prisma.tool.update({
          where: { id: tool.id },
          data: { sortOrder: toolIndex },
        });
      }

      console.log(
        `  └─ ${subcategory.name} -> ${subcategoryConfig.key} (${tools.length} tools)`
      );
    }
  }

  const uncategorizedSubcategories = await prisma.subcategory.findMany({
    where: { key: null },
    select: {
      name: true,
      sortOrder: true,
      category: { select: { name: true, sortOrder: true } },
    },
  });

  uncategorizedSubcategories.sort(
    (a, b) =>
      a.category.sortOrder - b.category.sortOrder || a.sortOrder - b.sortOrder
  );

  if (uncategorizedSubcategories.length > 0) {
    console.warn("⚠️ Subcategories without taxonomy key:");
    for (const subcategory of uncategorizedSubcategories) {
      console.warn(`- ${subcategory.category.name} > ${subcategory.name}`);
    }
  }

  console.log("✅ Taxonomy backfill complete.");
}

main()
  .catch((error) => {
    console.error("❌ Taxonomy backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
