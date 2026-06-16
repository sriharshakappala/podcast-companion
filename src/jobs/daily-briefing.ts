import { inngest } from "@/lib/inngest";
import { db, users, feedbackEvents, briefings } from "@/db";
import { sql } from "drizzle-orm";
import { getRecommendations } from "@/services/recommendations";

export const dailyBriefing = inngest.createFunction(
  {
    id: "daily-briefing",
    triggers: [{ cron: "0 7 * * *" }],
  },
  async ({ step }) => {
    const eligibleUsers = await step.run("find-eligible-users", async () => {
      const result = await db.execute(sql`
        SELECT DISTINCT u.id
        FROM users u
        JOIN feedback_events fe ON fe.user_id = u.id
        GROUP BY u.id
        HAVING COUNT(fe.id) >= 3
      `);
      return result.rows as { id: string }[];
    });

    let generated = 0;

    for (const user of eligibleUsers) {
      await step.run(`briefing-${user.id}`, async () => {
        const recs = await getRecommendations(user.id, 5);

        if (recs.length === 0) return;

        await db.insert(briefings).values({
          userId: user.id,
          episodeIds: recs.map((r) => r.episode.id),
        });
      });
      generated++;
    }

    return { usersProcessed: eligibleUsers.length, briefingsGenerated: generated };
  }
);
