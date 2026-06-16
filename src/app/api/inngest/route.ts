import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { pollFeeds } from "@/jobs/poll-feeds";
import { processEpisode } from "@/jobs/process-episode";
import { dailyBriefing } from "@/jobs/daily-briefing";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [pollFeeds, processEpisode, dailyBriefing],
  ...(process.env.NODE_ENV === "development" ? { signingKey: undefined } : {}),
});
