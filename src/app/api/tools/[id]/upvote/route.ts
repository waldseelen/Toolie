import { NextResponse } from "next/server";
import { upvoteTool } from "@/lib/db";

const VOTED_COOKIE = "toolie-voted";
const MAX_TRACKED_VOTES = 500;

function parseVoted(request: Request): string[] {
  const cookieHeader = request.headers.get("cookie") ?? "";
  const entry = cookieHeader
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${VOTED_COOKIE}=`));

  if (!entry) {
    return [];
  }

  return decodeURIComponent(entry.slice(VOTED_COOKIE.length + 1))
    .split(",")
    .filter(Boolean);
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const voted = parseVoted(request);

  if (voted.includes(id)) {
    return NextResponse.json(
      { error: "Bu araca zaten oy verdiniz" },
      { status: 429 }
    );
  }

  try {
    const newVotes = await upvoteTool(id);
    const updated = [...voted, id].slice(-MAX_TRACKED_VOTES);
    const response = NextResponse.json({ success: true, votes: newVotes });
    response.cookies.set({
      name: VOTED_COOKIE,
      value: updated.join(","),
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 365,
    });
    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to upvote tool";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
