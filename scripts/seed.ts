import { readFileSync, existsSync } from "fs";
import { join } from "path";
import * as admin from "firebase-admin";
import { TAXONOMY_BY_CATEGORY_KEY } from "../src/lib/taxonomy";

// Setup dotenv manually for script runtime
import "dotenv/config";

// Minimal inline Firebase setup for script execution
function getScriptDb(): admin.firestore.Firestore {
  if (admin.apps.length === 0) {
    const projectId = process.env.FIREBASE_PROJECT_ID || "origin-5ff2f";
    const clientEmail = process.env.FIREBASE_CLIENT_EMAIL;
    const privateKey = process.env.FIREBASE_PRIVATE_KEY;

    if (clientEmail && privateKey) {
      admin.initializeApp({
        credential: admin.credential.cert({
          projectId,
          clientEmail,
          privateKey: privateKey.replace(/\\n/g, "\n"),
        }),
      });
    } else {
      const localKeyPath = join(process.cwd(), "firebase-service-account.json");
      if (existsSync(localKeyPath)) {
        const localKey = JSON.parse(readFileSync(localKeyPath, "utf8"));
        admin.initializeApp({
          credential: admin.credential.cert(localKey),
        });
      } else {
        admin.initializeApp({ projectId });
      }
    }
  }
  return admin.firestore();
}

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

const seedTags = [
  "ai", "image", "video", "coding", "research", "open-source", 
  "free", "paid", "freemium", "api", "no-code", "windows", 
  "productivity", "audio", "writing", "security", "datasets"
];

async function clearCollection(db: admin.firestore.Firestore, name: string) {
  const snap = await db.collection(name).get();
  const batch = db.batch();
  snap.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}

async function main() {
  console.log("🌱 Connect to Firestore...");
  const db = getScriptDb();

  console.log("🧹 Resetting Firestore catalog tables...");
  await clearCollection(db, "tools");
  await clearCollection(db, "subcategories");
  await clearCollection(db, "categories");
  await clearCollection(db, "tags");

  console.log("🌱 Seeding tags...");
  const tagIdsMap = new Map<string, string>(); // slug -> tagId
  for (const tag of seedTags) {
    const name = tag.charAt(0).toUpperCase() + tag.slice(1).replace("-", " ");
    const slug = tag;
    const docRef = db.collection("tags").doc();
    await docRef.set({
      name,
      slug,
    });
    tagIdsMap.set(slug, docRef.id);
  }
  console.log(`  Added ${seedTags.length} tags.`);

  console.log("🌱 Seeding database from TOOLS.json ...");
  const jsonPath = join(process.cwd(), "TOOLS.json");
  const raw = readFileSync(jsonPath, "utf-8");
  const data: SeedCategory[] = JSON.parse(raw);

  let totalTools = 0;
  const now = new Date().toISOString();

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

    const categoryRef = db.collection("categories").doc();
    const categoryId = categoryRef.id;

    await categoryRef.set({
      name: catData.category,
      slug: meta.slug,
      nameTr: meta.nameTr,
      nameEn: meta.nameEn,
      icon: meta.icon,
      color: meta.color,
      sortOrder: catIdx,
      createdAt: now,
      updatedAt: now,
    });

    console.log(`  📁 Category: ${catData.category}`);

    for (let subIdx = 0; subIdx < catData.subcategories.length; subIdx++) {
      const subData = catData.subcategories[subIdx];

      const taxonomySubcategory = meta.subcategories.find(
        (entry) => entry.oldName === subData.subcategory
      );

      const subcategoryRef = db.collection("subcategories").doc();
      const subcategoryId = subcategoryRef.id;

      await subcategoryRef.set({
        name: subData.subcategory,
        key: taxonomySubcategory?.key ?? null,
        slug: taxonomySubcategory?.slug ?? null,
        nameTr: taxonomySubcategory?.nameTr ?? null,
        nameEn: taxonomySubcategory?.nameEn ?? null,
        categoryId: categoryId,
        sortOrder: subIdx,
        createdAt: now,
        updatedAt: now,
      });

      for (const [toolIdx, toolData] of subData.tools.entries()) {
        const domain = extractDomain(toolData.link);
        const description = toolData.description && toolData.description.trim()
          ? toolData.description
          : `${toolData.name} — ${subData.subcategory}`;

        const toolRef = db.collection("tools").doc();
        
        await toolRef.set({
          name: toolData.name,
          slug: slugify(toolData.name), // Generate a fallback unique slug
          link: toolData.link,
          description: description,
          descriptionEn: toolData.descriptionEn ?? null,
          subcategoryId: subcategoryId,
          faviconUrl: domain
            ? `https://www.google.com/s2/favicons?domain=${domain}&sz=32`
            : null,
          sortOrder: toolIdx,
          featured: false,
          featuredLabel: null,
          pricingModel: null,
          platforms: null,
          hasApi: false,
          isOpenSource: false,
          officialDocsUrl: null,
          githubUrl: null,
          logoUrl: null,
          status: "active",
          verified: false,
          lastCheckedAt: null,
          lastStatusCode: null,
          isBroken: false,
          createdAt: now,
          updatedAt: now,
          votes: 0,
          tagIds: [],
        });
        totalTools++;
      }

      console.log(
        `    └─ ${subData.subcategory} (${subData.tools.length} tools)`
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

function slugify(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}

main()
  .catch((e) => {
    console.error("❌ Seed failed:", e);
    process.exit(1);
  });
