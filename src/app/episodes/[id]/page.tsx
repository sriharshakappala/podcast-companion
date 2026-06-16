import { auth } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import { db, episodes } from "@/db";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { EpisodePlayer } from "./episode-player";

export default async function EpisodeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { userId } = await auth();
  if (!userId) redirect("/sign-in");

  const { id } = await params;

  const episode = await db
    .select({
      id: episodes.id,
      title: episodes.title,
      audioUrl: episodes.audioUrl,
      publishedAt: episodes.publishedAt,
      transcript: episodes.transcript,
      status: episodes.status,
      previewJson: episodes.previewJson,
    })
    .from(episodes)
    .where(eq(episodes.id, id))
    .limit(1);

  if (episode.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-400">Episode not found</p>
      </div>
    );
  }

  const ep = episode[0];

  return (
    <div className="min-h-screen">
      <header className="border-b border-gray-800 px-6 py-4">
        <Link href="/episodes" className="text-sm text-indigo-400 hover:text-indigo-300">
          &larr; Back to episodes
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold text-white mb-2">{ep.title}</h1>
        {ep.publishedAt && (
          <p className="text-sm text-gray-500 mb-6">
            {ep.publishedAt.toLocaleDateString()}
          </p>
        )}

        {ep.previewJson && (
          <div className="mb-6 rounded-lg border border-gray-800 bg-gray-900/50 p-4">
            <p className="text-gray-300 mb-3">
              {(ep.previewJson as any).summary}
            </p>
            <div className="flex gap-4 text-sm">
              <p className="text-green-400">
                👍 {(ep.previewJson as any).likeThisIf}
              </p>
              <p className="text-red-400">
                👎 {(ep.previewJson as any).skipThisIf}
              </p>
            </div>
          </div>
        )}

        <EpisodePlayer
          episodeId={ep.id}
          audioUrl={ep.audioUrl}
          title={ep.title}
          timestamps={(ep.previewJson as any)?.timestamps ?? []}
        />

        {ep.transcript && (
          <div className="mt-8 border-t border-gray-800 pt-6">
            <h2 className="text-lg font-semibold text-white mb-3">Transcript</h2>
            <div className="text-sm text-gray-400 whitespace-pre-wrap max-h-96 overflow-y-auto leading-relaxed">
              {ep.transcript.slice(0, 5000)}
              {ep.transcript.length > 5000 && (
                <p className="text-gray-600 mt-2">... (transcript truncated)</p>
              )}
            </div>
          </div>
        )}

        {ep.status !== "ready" && (
          <div className="mt-6 rounded-lg border border-yellow-900/50 bg-yellow-950/30 p-4">
            <p className="text-sm text-yellow-400">
              This episode is still processing ({ep.status.replace("_", " ")}).
              Preview and transcript will appear once ready.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
