import { prisma } from "../src/lib/prisma";

const seedTags = [
  "ai", "image", "video", "coding", "research", "open-source", 
  "free", "paid", "freemium", "api", "no-code", "windows", 
  "productivity", "audio", "writing", "security", "datasets"
];

async function main() {
  console.log("🌱 Seeding tags...");
  
  let count = 0;
  for (const tag of seedTags) {
    const name = tag.charAt(0).toUpperCase() + tag.slice(1).replace("-", " ");
    const slug = tag;
    
    await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: {
        name,
        slug
      }
    });
    count++;
  }
  
  console.log(`✅ Seed tags complete: ${count} tags processed.`);
}

main()
  .catch((e) => {
    console.error("❌ Seed tags failed:", e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
