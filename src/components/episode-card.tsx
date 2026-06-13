"use client";

import { useState } from "react";

interface Episode {
  id: string;
  title: string;
  audioUrl: string;
  publishedAt: string | null;
  status: string;
  previewJson: {
    summary: string;
    timestamps: { time: string; topic: string }[];
    likeThisIf: string;
    skipThisIf: string;
  } | null;
}

export function EpisodeCard({ episode }: { episode: Episode }) {
  const [expanded, setExpanded] = useState(false);

  const statusBadge = {
    queued: "bg-gray-700 text-gray-300",
    transcribing: "bg-yellow-900 text-yellow-300",
    embedding: "bg-blue-900 text-blue-300",
    generating_preview: "bg-purple-900 text-purple-300",
    ready: "bg-green-900 text-green-300",
    failed: "bg-red-900 text-red-300",
  }[episode.status] ?? "bg-gray-700 text-gray-300";

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-white truncate">{episode.title}</h3>
          {episode.publishedAt && (
            <p className="text-xs text-gray-500 mt-1">
              {new Date(episode.publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>
        <span className={`shrink-0 text-xs px-2 py-1 rounded ${statusBadge}`}>
          {episode.status.replace("_", " ")}
        </span>
      </div>

      {episode.previewJson && (
        <div className="mt-3">
          <p className="text-sm text-gray-300">{episode.previewJson.summary}</p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-indigo-400 mt-2 hover:text-indigo-300"
          >
            {expanded ? "Show less" : "Show more"}
          </button>

          {expanded && (
            <div className="mt-3 space-y-3 text-sm">
              <div>
                <p className="text-green-400">👍 {episode.previewJson.likeThisIf}</p>
                <p className="text-red-400 mt-1">👎 {episode.previewJson.skipThisIf}</p>
              </div>

              {episode.previewJson.timestamps.length > 0 && (
                <div>
                  <p className="text-gray-500 text-xs uppercase tracking-wide mb-1">Key moments</p>
                  <ul className="space-y-1">
                    {episode.previewJson.timestamps.map((ts, i) => (
                      <li key={i} className="text-gray-400">
                        <span className="text-gray-600 font-mono">{ts.time}</span> {ts.topic}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
