import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, episodes, subscriptions } from "@/db";
import { eq, desc } from "drizzle-orm";
import { EpisodeCard } from "@/components/episode-card";

export default async function PodcastDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const sub = await db.query.subscriptions.findFirst({
    where: eq(subscriptions.id, id),
  });

  if (!sub) {
    return (
      <div className="text-center py-20">
        <p className="text-on-surface-dim">Podcast not found</p>
      </div>
    );
  }

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
    .where(eq(episodes.subscriptionId, id))
    .orderBy(desc(episodes.publishedAt));

  const readyCount = eps.filter((e) => e.status === "ready").length;

  return (
    <div>
      <Link
        href="/library"
        className="text-sm text-primary hover:text-primary-dim transition-colors duration-200 mb-4 inline-block"
      >
        &larr; Back to Library
      </Link>

      <h2 className="text-3xl font-bold text-on-primary mb-1 tracking-tight">
        {sub.title ?? "Untitled Feed"}
      </h2>
      <p className="text-on-surface-dim text-sm mb-1 truncate">{sub.feedUrl}</p>
      <p className="text-on-surface-dim/60 text-xs mb-6">
        {eps.length} episode{eps.length !== 1 ? "s" : ""} · {readyCount} with previews
      </p>

      {eps.length === 0 ? (
        <div className="rounded-3xl bg-surface-1 p-10 text-center">
          <p className="text-on-surface-dim">No episodes found</p>
          <p className="text-sm text-on-surface-dim/60 mt-1">
            Episodes will appear after the feed is polled.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {eps.map((ep) => (
            <EpisodeCard
              key={ep.id}
              episode={{
                ...ep,
                publishedAt: ep.publishedAt?.toISOString() ?? null,
                previewJson: ep.previewJson as any,
              }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
