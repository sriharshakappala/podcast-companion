import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { UserButton } from "@clerk/nextjs";
import { db, episodes, subscriptions, users } from "@/db";
import { eq, inArray, desc } from "drizzle-orm";
import { EpisodeCard } from "@/components/episode-card";
import { SubscribeForm } from "@/components/subscribe-form";

export default async function EpisodesPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  let user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) {
    const [created] = await db.insert(users).values({ clerkId }).returning();
    user = created;
  }

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
    <div className="min-h-screen">
      <header className="border-b border-gray-800 px-6 py-4 flex items-center justify-between">
        <h1 className="text-xl font-semibold text-white">Podcast Companion</h1>
        <UserButton />
      </header>
      <main className="max-w-4xl mx-auto px-6 py-8">
        <h2 className="text-2xl font-bold text-white mb-2">Your Episodes</h2>
        <p className="text-gray-400 mb-6">
          Know in 15 seconds if an episode is worth your 45 minutes.
        </p>

        <SubscribeForm />

        {userSubs.length > 0 && (
          <p className="text-sm text-gray-500 mb-6">
            Subscribed to: {userSubs.map((s) => s.title ?? "Untitled").join(", ")}
          </p>
        )}

        {eps.length === 0 ? (
          <div className="rounded-lg border border-gray-800 border-dashed p-12 text-center">
            <p className="text-gray-500 mb-4">No episodes yet</p>
            <p className="text-sm text-gray-600">
              Subscribe to a podcast RSS feed above to get started.
            </p>
          </div>
        ) : (
          <div className="space-y-4">
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
      </main>
    </div>
  );
}
