import { PrismaClient } from "@prisma/client";
import { readFileSync } from "fs";
import { join } from "path";

const prisma = new PrismaClient();

/* ── Category metadata ── */
const CATEGORY_META: Record<string, { icon: string; color: string }> = {
  GENERAL: { icon: "◈", color: "#39ff14" },
  SOURCES: { icon: "◉", color: "#00d4ff" },
  DESIGN: { icon: "◆", color: "#ff6bff" },
  MEDIA: { icon: "◎", color: "#ff6b35" },
  DEVELOP: { icon: "◑", color: "#ffdd00" },
  CYBERSEC: { icon: "◒", color: "#ff2244" },
  SUPERUSER: { icon: "◓", color: "#a0ff60" },
};

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

  let totalTools = 0;

  for (let catIdx = 0; catIdx < data.length; catIdx++) {
    const catData = data[catIdx];
    const meta = CATEGORY_META[catData.category] ?? {
      icon: "◈",
      color: "#39ff14",
    };

    const category = await prisma.category.upsert({
      where: { name: catData.category },
      update: { icon: meta.icon, color: meta.color, sortOrder: catIdx },
      create: {
        name: catData.category,
        icon: meta.icon,
        color: meta.color,
        sortOrder: catIdx,
      },
    });

    console.log(`  📁 ${category.name}`);

    for (let subIdx = 0; subIdx < catData.subcategories.length; subIdx++) {
      const subData = catData.subcategories[subIdx];

      const subcategory = await prisma.subcategory.upsert({
        where: {
          categoryId_name: {
            categoryId: category.id,
            name: subData.subcategory,
          },
        },
        update: { sortOrder: subIdx },
        create: {
          name: subData.subcategory,
          categoryId: category.id,
          sortOrder: subIdx,
        },
      });

      for (const toolData of subData.tools) {
        const domain = extractDomain(toolData.link);
        await prisma.tool.create({
          data: {
            name: toolData.name,
            link: toolData.link,
            description: toolData.description,
            descriptionEn: toolData.descriptionEn ?? null,
            subcategoryId: subcategory.id,
            faviconUrl: domain
              ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
              : null,
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
