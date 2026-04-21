const path = require("path");
const { PrismaClient } = require("@prisma/client");

function toSqliteUrl(relativePath) {
  const absolutePath = path.resolve(__dirname, relativePath).replace(/\\/g, "/");
  return `file:${absolutePath}`;
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: toSqliteUrl("prisma/dev.db"),
    },
  },
});

(async () => {
  try {
    const tools = await prisma.tool.findMany({
      select: { id: true, name: true, description: true },
      take: 5,
      orderBy: { createdAt: "asc" },
    });

    console.log("Sample tools:");
    tools.forEach((tool) => {
      const description = tool.description?.trim()
        ? tool.description.slice(0, 80)
        : "(empty)";
      console.log(`  - ${tool.name}: ${description}`);
    });

    const [total, withDescriptions] = await Promise.all([
      prisma.tool.count(),
      prisma.tool.count({
        where: {
          description: {
            not: "",
          },
        },
      }),
    ]);

    console.log(`\nTotal: ${total}, With descriptions: ${withDescriptions}`);
  } finally {
    await prisma.$disconnect();
  }
})();
