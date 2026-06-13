import { inngest } from "@/lib/inngest";
import { db, subscriptions, episodes } from "@/db";
import { parseFeed } from "@/services/rss";
import { eq } from "drizzle-orm";

export const pollFeeds = inngest.createFunction(
  {
    id: "poll-feeds",
    concurrency: { limit: 5 },
    triggers: [{ cron: "0 */2 * * *" }],
  },
  async ({ step }) => {
    const allSubs = await step.run("fetch-subscriptions", async () => {
      return db.select().from(subscriptions);
    });

    for (const sub of allSubs) {
      await step.run(`poll-${sub.id}`, async () => {
        const { title, episodes: feedEpisodes } = await parseFeed(sub.feedUrl);

        if (!sub.title && title) {
          await db.update(subscriptions).set({ title }).where(eq(subscriptions.id, sub.id));
        }

        for (const ep of feedEpisodes.slice(0, 10)) {
          await db
            .insert(episodes)
            .values({
              subscriptionId: sub.id,
              title: ep.title,
              audioUrl: ep.audioUrl,
              publishedAt: ep.publishedAt,
              status: "queued",
            })
            .onConflictDoNothing({ target: episodes.audioUrl });
        }

        await db
          .update(subscriptions)
          .set({ lastPolledAt: new Date() })
          .where(eq(subscriptions.id, sub.id));
      });
    }

    return { polled: allSubs.length };
  }
);
