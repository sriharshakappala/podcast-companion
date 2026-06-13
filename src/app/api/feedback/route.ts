import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, feedbackEvents, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const { episodeId, type } = (await request.json()) as {
    episodeId: string;
    type: "play" | "skip" | "finish" | "highlight" | "thumbs_up" | "thumbs_down";
  };

  if (!episodeId || !type) {
    return NextResponse.json({ error: "episodeId and type required" }, { status: 400 });
  }

  const [event] = await db
    .insert(feedbackEvents)
    .values({ userId: user.id, episodeId, type })
    .returning();

  return NextResponse.json(event, { status: 201 });
}
