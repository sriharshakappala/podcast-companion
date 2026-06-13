import { inngest } from "@/lib/inngest";
import { db, episodes } from "@/db";
import { eq } from "drizzle-orm";
import { transcribeAudio } from "@/services/transcription";
import { generateEmbedding, generatePreview } from "@/services/ai";

export const processEpisode = inngest.createFunction(
  {
    id: "process-episode",
    concurrency: { limit: 3 },
    triggers: [{ event: "episode/queued" }],
  },
  async ({ event, step }) => {
    const episodeId = event.data.episodeId as string;

    const transcript = await step.run("transcribe", async () => {
      await db
        .update(episodes)
        .set({ status: "transcribing" })
        .where(eq(episodes.id, episodeId));

      const episode = await db.query.episodes.findFirst({
        where: eq(episodes.id, episodeId),
      });

      if (!episode) throw new Error(`Episode ${episodeId} not found`);
      return transcribeAudio(episode.audioUrl);
    });

    const embedding = await step.run("embed", async () => {
      await db
        .update(episodes)
        .set({ status: "embedding", transcript })
        .where(eq(episodes.id, episodeId));

      return generateEmbedding(transcript);
    });

    const preview = await step.run("generate-preview", async () => {
      await db
        .update(episodes)
        .set({ status: "generating_preview", embedding })
        .where(eq(episodes.id, episodeId));

      return generatePreview(transcript);
    });

    await step.run("finalize", async () => {
      await db
        .update(episodes)
        .set({ status: "ready", previewJson: preview })
        .where(eq(episodes.id, episodeId));
    });

    return { episodeId, status: "ready" };
  }
);
