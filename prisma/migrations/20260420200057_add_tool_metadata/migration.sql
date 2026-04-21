-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Tool" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "slug" TEXT,
    "link" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "descriptionEn" TEXT,
    "subcategoryId" TEXT NOT NULL,
    "faviconUrl" TEXT,
    "pricingModel" TEXT,
    "platforms" TEXT,
    "featured" BOOLEAN NOT NULL DEFAULT false,
    "hasApi" BOOLEAN NOT NULL DEFAULT false,
    "isOpenSource" BOOLEAN NOT NULL DEFAULT false,
    "officialDocsUrl" TEXT,
    "githubUrl" TEXT,
    "logoUrl" TEXT,
    "status" TEXT NOT NULL DEFAULT 'active',
    "verified" BOOLEAN NOT NULL DEFAULT false,
    "lastCheckedAt" DATETIME,
    "lastStatusCode" INTEGER,
    "isBroken" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "Tool_subcategoryId_fkey" FOREIGN KEY ("subcategoryId") REFERENCES "Subcategory" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_Tool" ("createdAt", "description", "descriptionEn", "faviconUrl", "featured", "id", "link", "name", "platforms", "pricingModel", "slug", "sortOrder", "subcategoryId", "updatedAt") SELECT "createdAt", "description", "descriptionEn", "faviconUrl", "featured", "id", "link", "name", "platforms", "pricingModel", "slug", "sortOrder", "subcategoryId", "updatedAt" FROM "Tool";
DROP TABLE "Tool";
ALTER TABLE "new_Tool" RENAME TO "Tool";
CREATE UNIQUE INDEX "Tool_slug_key" ON "Tool"("slug");
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
