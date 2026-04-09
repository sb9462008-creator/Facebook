import { NextRequest, NextResponse } from "next/server";
import { getComments } from "@/lib/store";

const lastCounts: Record<string, number> = {};

export async function GET(req: NextRequest) {
  const postId = req.nextUrl.searchParams.get("postId") ?? "";
  const comments = await getComments(postId);
  const currentCount = comments.length;
  const lastCount = lastCounts[postId] ?? currentCount;

  const newComments = Math.max(0, currentCount - lastCount);
  lastCounts[postId] = currentCount;

  return NextResponse.json({ newComments, total: currentCount });
}
