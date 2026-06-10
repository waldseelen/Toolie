import { NextResponse } from "next/server";
import { upvoteTool } from "@/lib/db";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    const newVotes = await upvoteTool(id);
    return NextResponse.json({ success: true, votes: newVotes });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upvote tool";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
