import { NextResponse } from "next/server";
import { getFeaturedTools } from "@/lib/db";

export async function GET() {
  try {
    const tools = await getFeaturedTools(8);
    return NextResponse.json(tools);
  } catch (error) {
    console.error("GET /api/tools/featured error:", error);
    return NextResponse.json(
      { error: "Featured tools could not be loaded" },
      { status: 500 }
    );
  }
}
