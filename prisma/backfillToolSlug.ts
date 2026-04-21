import { prisma } from "../src/lib/prisma";
import { createUniqueSlug } from "../src/lib/slug";

async function main() {
  console.log("🛠️ Backfilling tool slugs...");

  const tools = await prisma.tool.findMany({
    where: { slug: null },
  });

  let updatedCount = 0;
  const usedSlugs = new Set<string>();

  // Fetch already existing slugs if any
  const existingTools = await prisma.tool.findMany({
    where: { slug: { not: null } },
    select: { slug: true }
  });
  existingTools.forEach(t => usedSlugs.add(t.slug!));

  for (const tool of tools) {
    const finalSlug = createUniqueSlug(tool.name, usedSlugs);

    usedSlugs.add(finalSlug);

    await prisma.tool.update({
      where: { id: tool.id },
      data: { slug: finalSlug },
    });
    
    updatedCount++;
    console.log(`Updated: ${tool.name} -> ${finalSlug}`);
  }

  console.log(`✅ Backfill complete. Updated ${updatedCount} tools.`);
}

main()
  .catch((e) => {
    console.error("❌ Backfill failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
