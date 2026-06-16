import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import { db, subscriptions, episodes, users } from "@/db";
import { eq, sql } from "drizzle-orm";
import { SubscribeForm } from "@/components/subscribe-form";

export default async function LibraryPage() {
  const { userId: clerkId } = await auth();
  if (!clerkId) redirect("/sign-in");

  const user = await db.query.users.findFirst({
    where: eq(users.clerkId, clerkId),
  });

  if (!user) redirect("/onboarding");

  const userSubs = await db
    .select({
      id: subscriptions.id,
      title: subscriptions.title,
      feedUrl: subscriptions.feedUrl,
      lastPolledAt: subscriptions.lastPolledAt,
      createdAt: subscriptions.createdAt,
      episodeCount: sql<number>`(SELECT COUNT(*) FROM episodes WHERE subscription_id = ${subscriptions.id})`.as("episode_count"),
    })
    .from(subscriptions)
    .where(eq(subscriptions.userId, user.id));

  return (
    <div>
      <h2 className="text-3xl font-bold text-on-primary mb-1 tracking-tight">
        Library
      </h2>
      <p className="text-on-surface-dim text-sm mb-6">
        Manage your podcast subscriptions
      </p>

      <SubscribeForm />

      {userSubs.length === 0 ? (
        <div className="rounded-3xl bg-surface-1 p-10 text-center">
          <p className="text-on-surface-dim">No subscriptions yet</p>
          <p className="text-sm text-on-surface-dim/60 mt-1">
            Paste an RSS feed URL above to get started.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {userSubs.map((sub) => (
            <Link
              key={sub.id}
              href={`/library/${sub.id}`}
              className="block rounded-2xl bg-surface-1 p-4 transition-all duration-200 hover:bg-surface-2 group"
            >
              <div className="flex items-center justify-between">
                <h3 className="font-medium text-on-surface group-hover:text-primary transition-colors duration-200">
                  {sub.title ?? "Untitled Feed"}
                </h3>
                <span className="text-xs text-on-surface-dim bg-surface-2 px-2.5 py-1 rounded-full">
                  {sub.episodeCount} ep{sub.episodeCount !== 1 ? "s" : ""}
                </span>
              </div>
              <p className="text-xs text-on-surface-dim/60 mt-1.5 truncate">
                {sub.feedUrl}
              </p>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
