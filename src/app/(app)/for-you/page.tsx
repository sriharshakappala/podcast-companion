import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, users } from "@/db";
import { eq } from "drizzle-orm";
import { getRecommendations } from "@/services/recommendations";
import { EpisodeCard } from "@/components/episode-card";

export default async function ForYouPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) redirect("/onboarding");

  const recommendations = await getRecommendations(user.id, 10);

  return (
    <div>
      <h2 className="text-3xl font-bold text-on-primary mb-1 tracking-tight">
        For You
      </h2>
      <p className="text-on-surface-dim text-sm mb-6">
        Episodes we think you&apos;ll love, based on your listening patterns
      </p>

      {recommendations.length === 0 ? (
        <div className="rounded-3xl bg-surface-1 p-10 text-center">
          <div className="text-4xl mb-3">✨</div>
          <p className="text-on-surface font-medium mb-2">
            Not enough data yet
          </p>
          <p className="text-sm text-on-surface-dim max-w-xs mx-auto">
            Listen to a few more episodes and we&apos;ll start personalizing
            recommendations for you.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {recommendations.map((rec) => (
            <div key={rec.episode.id}>
              {rec.reason && (
                <p className="text-xs text-primary mb-1.5 px-1 font-medium">
                  {rec.reason}
                </p>
              )}
              <EpisodeCard
                episode={{
                  ...rec.episode,
                  publishedAt: rec.episode.publishedAt?.toISOString() ?? null,
                  previewJson: rec.episode.previewJson as any,
                }}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
