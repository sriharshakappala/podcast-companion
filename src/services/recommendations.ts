import { db, episodes, feedbackEvents } from "@/db";
import { eq, and, sql, ne, notInArray } from "drizzle-orm";
import { generateEmbedding } from "./ai";

interface RecommendationResult {
  episode: {
    id: string;
    title: string;
    audioUrl: string;
    publishedAt: Date | null;
    status: string;
    previewJson: any;
  };
  reason: string | null;
  similarity: number;
}

export async function getRecommendations(
  userId: string,
  limit: number = 5
): Promise<RecommendationResult[]> {
  const feedback = await db
    .select()
    .from(feedbackEvents)
    .where(eq(feedbackEvents.userId, userId));

  const interactedEpisodeIds = [...new Set(feedback.map((f) => f.episodeId))];

  if (feedback.length < 3) {
    return getColdStartRecommendations(userId, interactedEpisodeIds, limit);
  }

  const tasteVector = await computeTasteVector(userId, feedback);

  if (!tasteVector) {
    return getColdStartRecommendations(userId, interactedEpisodeIds, limit);
  }

  const vectorStr = `[${tasteVector.join(",")}]`;

  const results = await db.execute(sql`
    SELECT id, title, audio_url, published_at, status, preview_json,
           1 - (embedding <=> ${vectorStr}::vector) as similarity
    FROM episodes
    WHERE status = 'ready'
      AND embedding IS NOT NULL
      ${interactedEpisodeIds.length > 0
        ? sql`AND id NOT IN (${sql.join(interactedEpisodeIds.map(id => sql`${id}::uuid`), sql`, `)})`
        : sql``}
    ORDER BY embedding <=> ${vectorStr}::vector
    LIMIT ${limit}
  `);

  return (results.rows as any[]).map((row) => ({
    episode: {
      id: row.id,
      title: row.title,
      audioUrl: row.audio_url,
      publishedAt: row.published_at,
      status: row.status,
      previewJson: row.preview_json,
    },
    reason: generateReason(row.similarity, feedback),
    similarity: row.similarity,
  }));
}

async function getColdStartRecommendations(
  userId: string,
  excludeIds: string[],
  limit: number
): Promise<RecommendationResult[]> {
  const query = db
    .select({
      id: episodes.id,
      title: episodes.title,
      audioUrl: episodes.audioUrl,
      publishedAt: episodes.publishedAt,
      status: episodes.status,
      previewJson: episodes.previewJson,
    })
    .from(episodes)
    .where(eq(episodes.status, "ready"))
    .limit(limit);

  const results = excludeIds.length > 0
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
        .where(
          and(
            eq(episodes.status, "ready"),
            notInArray(episodes.id, excludeIds)
          )
        )
        .limit(limit)
    : await query;

  return results.map((ep) => ({
    episode: ep,
    reason: "Based on your topic preferences",
    similarity: 0,
  }));
}

async function computeTasteVector(
  userId: string,
  feedback: { episodeId: string; type: string }[]
): Promise<number[] | null> {
  const finishedIds = feedback
    .filter((f) => f.type === "finish" || f.type === "thumbs_up")
    .map((f) => f.episodeId);

  if (finishedIds.length === 0) return null;

  const uniqueFinished = [...new Set(finishedIds)];

  const result = await db.execute(sql`
    SELECT AVG(e) as avg_embedding
    FROM (
      SELECT unnest(embedding::float8[]) as e,
             generate_series(1, 1536) as dim
      FROM episodes
      WHERE id = ANY(${uniqueFinished}::uuid[])
        AND embedding IS NOT NULL
      GROUP BY dim
      ORDER BY dim
    ) sub
    GROUP BY dim
    ORDER BY dim
  `);

  if (!result.rows || result.rows.length === 0) return null;

  return result.rows.map((r: any) => parseFloat(r.avg_embedding));
}

function generateReason(similarity: number, feedback: { type: string }[]): string {
  const finishCount = feedback.filter((f) => f.type === "finish").length;

  if (similarity > 0.85) {
    return "Very similar to episodes you loved";
  } else if (similarity > 0.7) {
    return `Based on ${finishCount} episodes you finished`;
  } else {
    return "You might enjoy this based on your interests";
  }
}
