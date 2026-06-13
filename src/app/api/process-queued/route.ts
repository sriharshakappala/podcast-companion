import { NextResponse } from "next/server";
import { db, episodes } from "@/db";
import { eq } from "drizzle-orm";
import { inngest } from "@/lib/inngest";

export async function POST() {
  const queued = await db
    .select({ id: episodes.id, title: episodes.title })
    .from(episodes)
    .where(eq(episodes.status, "queued"));

  if (queued.length === 0) {
    return NextResponse.json({ message: "No queued episodes" });
  }

  await inngest.send(
    queued.map((ep) => ({
      name: "episode/queued" as const,
      data: { episodeId: ep.id },
    }))
  );

  return NextResponse.json({
    message: `Triggered processing for ${queued.length} episodes`,
    episodes: queued.map((e) => e.title),
  });
}
