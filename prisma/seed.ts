import { readFileSync } from "fs";
import { join } from "path";
import { prisma } from "../src/lib/prisma";
import { TAXONOMY_BY_CATEGORY_KEY } from "../src/lib/taxonomy";

interface SeedTool {
  name: string;
  link: string;
  description: string;
  descriptionEn?: string;
}

interface SeedSubcategory {
  subcategory: string;
  tools: SeedTool[];
}

interface SeedCategory {
  category: string;
  subcategories: SeedSubcategory[];
}

async function main() {
  console.log("🌱 Seeding database from TOOLS.json ...");

  const jsonPath = join(process.cwd(), "TOOLS.json");
  const raw = readFileSync(jsonPath, "utf-8");
  const data: SeedCategory[] = JSON.parse(raw);

  console.log("🧹 Resetting catalog tables ...");
  await prisma.tool.deleteMany();
  await prisma.subcategory.deleteMany();
  await prisma.category.deleteMany();

  let totalTools = 0;

  for (let catIdx = 0; catIdx < data.length; catIdx++) {
    const catData = data[catIdx];
    const taxonomyCategory = TAXONOMY_BY_CATEGORY_KEY[catData.category];

    const meta = taxonomyCategory ?? {
      icon: "◈",
      color: "#39ff14",
      slug: null,
      nameTr: null,
      nameEn: null,
      subcategories: [],
    };

    const category = await prisma.category.create({
      data: {
        name: catData.category,
        slug: meta.slug,
        nameTr: meta.nameTr,
        nameEn: meta.nameEn,
        icon: meta.icon,
        color: meta.color,
        sortOrder: catIdx,
      },
    });

    console.log(`  📁 ${category.name}`);

    for (let subIdx = 0; subIdx < catData.subcategories.length; subIdx++) {
      const subData = catData.subcategories[subIdx];

      const taxonomySubcategory = meta.subcategories.find(
        (entry) => entry.oldName === subData.subcategory
      );

      const subcategory = await prisma.subcategory.create({
        data: {
          name: subData.subcategory,
          key: taxonomySubcategory?.key ?? null,
          slug: taxonomySubcategory?.slug ?? null,
          nameTr: taxonomySubcategory?.nameTr ?? null,
          nameEn: taxonomySubcategory?.nameEn ?? null,
          categoryId: category.id,
          sortOrder: subIdx,
        },
      });

      for (const [toolIdx, toolData] of subData.tools.entries()) {
        const domain = extractDomain(toolData.link);
        // Eğer description boşsa, tool name'i kullan
        const description = toolData.description && toolData.description.trim()
          ? toolData.description
          : `${toolData.name} — ${subData.subcategory}`;

        await prisma.tool.create({
          data: {
            name: toolData.name,
            link: toolData.link,
            description: description,
            descriptionEn: toolData.descriptionEn ?? null,
            subcategoryId: subcategory.id,
            faviconUrl: domain
              ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
              : null,
            sortOrder: toolIdx,
          },
        });
        totalTools++;
      }

      console.log(
        `    └─ ${subData.subcategory} (${subData.tools.length} araç)`
      );
    }
  }

  console.log(`\n✅ Seed complete: ${totalTools} tools loaded.`);
}

function extractDomain(url: string): string | null {
  try {
    return new URL(url).hostname;
  } catch {
    return null;
  }
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
