import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, episodes, subscriptions, users } from "@/db";
import { eq, inArray, desc } from "drizzle-orm";

export async function GET() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  const userSubs = await db
    .select({ id: subscriptions.id })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  if (userSubs.length === 0) return NextResponse.json([]);

  const subIds = userSubs.map((s) => s.id);

  const eps = await db
    .select({
      id: episodes.id,
      title: episodes.title,
      audioUrl: episodes.audioUrl,
      publishedAt: episodes.publishedAt,
      status: episodes.status,
      previewJson: episodes.previewJson,
    })
    .from(episodes)
    .where(inArray(episodes.subscriptionId, subIds))
    .orderBy(desc(episodes.publishedAt))
    .limit(50);

  return NextResponse.json(eps);
}
