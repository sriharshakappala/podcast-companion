import { auth } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const { userId: clerkId } = await auth();
  if (!clerkId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { topics } = (await request.json()) as { topics: string[] };

  if (!topics || topics.length < 3) {
    return NextResponse.json({ error: "Select at least 3 topics" }, { status: 400 });
  }

  const existing = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (existing) {
    await db
      .update(users)
      .set({ topicPreferences: topics })
      .where(eq(users.id, existing.id));
  } else {
    await db.insert(users).values({ clerkId, topicPreferences: topics });
  }

  return NextResponse.json({ success: true });
}
