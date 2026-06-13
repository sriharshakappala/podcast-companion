import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest";
import { pollFeeds } from "@/jobs/poll-feeds";
import { processEpisode } from "@/jobs/process-episode";

export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [pollFeeds, processEpisode],
});
