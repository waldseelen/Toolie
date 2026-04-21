import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { mapToolsToData } from "@/lib/tool-data";

export async function GET() {
  try {
    const tools = await prisma.tool.findMany({
      where: { featured: true },
      orderBy: [{ sortOrder: "asc" }, { createdAt: "asc" }],
      include: {
        tags: { select: { id: true, name: true, slug: true } },
        subcategory: {
          include: {
            category: true,
          },
        },
      },
    });

    return NextResponse.json(mapToolsToData(tools));
  } catch (error) {
    console.error("GET /api/tools/featured error:", error);
    return NextResponse.json(
      { error: "Featured tools could not be loaded" },
      { status: 500 }
    );
  }
}
