import { NextResponse } from "next/server";
import { createSubmission } from "@/lib/db";
import { TAXONOMY } from "@/lib/taxonomy";

function asTrimmedString(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  return trimmed.length > 0 ? trimmed : null;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const name = asTrimmedString(body.name);
    const link = asTrimmedString(body.link);
    const description = asTrimmedString(body.description);
    const categoryKey = asTrimmedString(body.categoryKey);

    if (!name || !link || !description) {
      return NextResponse.json(
        { error: "name, link, and description are required" },
        { status: 400 }
      );
    }

    const normalizedCategoryKey = TAXONOMY.some(
      (category) => category.key === categoryKey
    )
      ? categoryKey
      : null;

    const submission = await createSubmission({
      name,
      link,
      description,
      categoryKey: normalizedCategoryKey,
    });

    return NextResponse.json(submission, { status: 201 });
  } catch (error) {
    console.error("POST /api/submissions error:", error);
    return NextResponse.json(
      { error: "Submission could not be created" },
      { status: 500 }
    );
  }
}
