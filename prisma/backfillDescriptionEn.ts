import { prisma } from "../src/lib/prisma";
import { translateTextToEnglish } from "../src/lib/translate";

const BATCH_SIZE = 8;

async function main() {
  const tools = await prisma.tool.findMany({
    where: {
      OR: [{ descriptionEn: null }, { descriptionEn: "" }],
    },
    select: {
      id: true,
      name: true,
      description: true,
    },
    orderBy: { createdAt: "asc" },
  });

  console.log(`🌍 Backfilling English descriptions for ${tools.length} tools...`);

  for (let index = 0; index < tools.length; index += BATCH_SIZE) {
    const batch = tools.slice(index, index + BATCH_SIZE);

    await Promise.all(
      batch.map(async (tool) => {
        try {
          const descriptionEn = await translateTextToEnglish(tool.description);

          if (!descriptionEn) {
            console.warn(`⚠️ Skipped ${tool.name}: empty translation`);
            return;
          }

          await prisma.tool.update({
            where: { id: tool.id },
            data: { descriptionEn },
          });

          console.log(`✓ ${tool.name}`);
        } catch (error) {
          console.error(`✗ ${tool.name}`, error);
        }
      })
    );

    if (index + BATCH_SIZE < tools.length) {
      await wait(250);
    }
  }

  console.log("✅ English description backfill completed.");
}

function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main()
  .catch((error) => {
    console.error("❌ Backfill failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
