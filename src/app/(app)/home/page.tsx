import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, episodes, subscriptions, users } from "@/db";
import { eq, inArray, desc } from "drizzle-orm";
import { EpisodeCard } from "@/components/episode-card";

export default async function HomePage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) redirect("/onboarding");
  if (!(user.topicPreferences as string[])?.length) redirect("/onboarding");

  const userSubs = await db
    .select()
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  const subIds = userSubs.map((s) => s.id);

  const eps = subIds.length > 0
    ? await db
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
        .limit(30)
    : [];

  return (
    <div>
      <h2 className="text-3xl font-bold text-on-primary mb-1 tracking-tight">
        Your Feed
      </h2>
      <p className="text-on-surface-dim text-sm mb-6">
        {eps.length > 0
          ? `${eps.length} episodes from ${userSubs.length} podcast${userSubs.length > 1 ? "s" : ""}`
          : "Subscribe to podcasts to see episodes here"}
      </p>

      {eps.length === 0 ? (
        <div className="rounded-3xl bg-surface-1 p-10 text-center">
          <p className="text-on-surface-dim mb-2">No episodes yet</p>
          <p className="text-sm text-on-surface-dim/60">
            Head to Library to add your first podcast feed.
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
