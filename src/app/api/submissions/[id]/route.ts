import { NextResponse } from "next/server";
import { getDb } from "@/lib/firebase";
import { getSubmissionById, updateSubmissionStatus, getNextSortOrder } from "@/lib/db";
import { translateTextToEnglish } from "@/lib/translate";
import { createUniqueSlug } from "@/lib/slug";

interface Params {
  params: Promise<{ id: string }>;
}

function resolveFaviconUrl(link: string): string | null {
  try {
    const domain = new URL(link).hostname;
    return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
  } catch {
    return null;
  }
}

async function createToolSlug(name: string): Promise<string> {
  const db = getDb();
  const snap = await db.collection("tools").get();
  const usedSlugs = new Set(
    snap.docs.map((doc) => doc.data().slug).filter(Boolean) as string[]
  );

  return createUniqueSlug(name, usedSlugs);
}

async function resolveSubcategoryId(categoryKey: string | null): Promise<string | null> {
  const db = getDb();

  const findSubcategoryForCategory = async (catName: string): Promise<string | null> => {
    const catSnap = await db.collection("categories").where("name", "==", catName).limit(1).get();
    if (catSnap.empty) return null;
    const subSnap = await db
      .collection("subcategories")
      .where("categoryId", "==", catSnap.docs[0].id)
      .orderBy("sortOrder", "asc")
      .limit(1)
      .get();
    return subSnap.empty ? null : subSnap.docs[0].id;
  };

  const fallbackId = await findSubcategoryForCategory("GENERAL");

  if (!categoryKey) {
    return fallbackId;
  }

  const matchId = await findSubcategoryForCategory(categoryKey);
  return matchId || fallbackId;
}

export async function PATCH(request: Request, { params }: Params) {
  try {
    const { id } = await params;
    const body = await request.json();
    const action = body.action === "approve" ? "approve" : body.action === "reject" ? "reject" : null;

    if (!action) {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const submission = await getSubmissionById(id);

    if (!submission) {
      return NextResponse.json({ error: "Submission not found" }, { status: 404 });
    }

    if (action === "reject") {
      const rejected = await updateSubmissionStatus(id, "rejected");
      return NextResponse.json(rejected);
    }

    const subcategoryId = await resolveSubcategoryId(submission.categoryKey);

    if (!subcategoryId) {
      return NextResponse.json(
        { error: "No subcategory available for approval" },
        { status: 500 }
      );
    }

    let descriptionEn: string | null = null;

    try {
      descriptionEn = await translateTextToEnglish(submission.description);
    } catch {
      descriptionEn = null;
    }

    const db = getDb();
    const batch = db.batch();
    const toolRef = db.collection("tools").doc();
    const now = new Date().toISOString();

    const slug = await createToolSlug(submission.name);
    const sortOrder = await getNextSortOrder(subcategoryId);

    batch.set(toolRef, {
      name: submission.name,
      slug,
      link: submission.link,
      description: submission.description,
      descriptionEn,
      subcategoryId,
      faviconUrl: resolveFaviconUrl(submission.link),
      sortOrder,
      createdAt: now,
      updatedAt: now,
      votes: 0,
      tagIds: [],
    });

    const submissionRef = db.collection("submissions").doc(id);
    batch.update(submissionRef, { status: "approved" });

    await batch.commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("PATCH /api/submissions/[id] error:", error);
    return NextResponse.json(
      { error: "Submission action failed" },
      { status: 500 }
    );
  }
}
