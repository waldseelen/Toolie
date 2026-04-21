import path from "path";
import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

function resolvePrismaDatasourceUrl() {
  const databaseUrl = process.env.DATABASE_URL;

  if (!databaseUrl?.startsWith("file:")) {
    return databaseUrl;
  }

  const rawPath = databaseUrl.slice("file:".length);

  if (!rawPath) {
    return databaseUrl;
  }

  const isAbsolutePath =
    rawPath.startsWith("/") || /^[A-Za-z]:[\\/]/.test(rawPath);

  if (isAbsolutePath) {
    return `file:${rawPath.replace(/\\/g, "/")}`;
  }

  const schemaDirectory = path.join(process.cwd(), "prisma");
  const absolutePath = path.resolve(schemaDirectory, rawPath);

  return `file:${absolutePath.replace(/\\/g, "/")}`;
}

const datasourceUrl = resolvePrismaDatasourceUrl();
const prismaClient =
  globalForPrisma.prisma ||
  new PrismaClient(
    datasourceUrl
      ? {
          datasources: {
            db: {
              url: datasourceUrl,
            },
          },
        }
      : undefined
  );

export const prisma = prismaClient;

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
