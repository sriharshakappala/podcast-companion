import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, subscriptions, episodes, users } from "@/db";
import { eq } from "drizzle-orm";
import { parseFeed } from "@/services/rss";
import { inngest } from "@/lib/inngest";

async function getUserId() {
  const { userId: clerkId } = await auth();
  if (!clerkId) return null;

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });
  return user?.id ?? null;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const subs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, userId));

  return NextResponse.json(subs);
}

export async function POST(request: Request) {
  const userId = await getUserId();
  if (!userId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { feedUrl } = (await request.json()) as { feedUrl: string };
  if (!feedUrl) return NextResponse.json({ error: "feedUrl required" }, { status: 400 });

  const { title } = await parseFeed(feedUrl);

  const [sub] = await db
    .insert(subscriptions)
    .values({ userId, feedUrl, title })
    .returning();

  const { episodes: feedEpisodes } = await parseFeed(feedUrl);

  const inserted = [];
  for (const ep of feedEpisodes.slice(0, 10)) {
    const [row] = await db
      .insert(episodes)
      .values({
        subscriptionId: sub.id,
        title: ep.title,
        audioUrl: ep.audioUrl,
        publishedAt: ep.publishedAt,
        status: "queued",
      })
      .onConflictDoNothing({ target: episodes.audioUrl })
      .returning();
    if (row) inserted.push(row);
  }

  if (inserted.length > 0) {
    await inngest.send(
      inserted.map((ep) => ({
        name: "episode/queued" as const,
        data: { episodeId: ep.id },
      }))
    );
  }

  return NextResponse.json(sub, { status: 201 });
}
