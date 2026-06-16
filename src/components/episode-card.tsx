"use client";

import { useState } from "react";
import Link from "next/link";

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

  const statusConfig: Record<string, { bg: string; text: string; label: string }> = {
    queued: { bg: "bg-outline-variant", text: "text-on-surface-dim", label: "Queued" },
    transcribing: { bg: "bg-yellow-950", text: "text-yellow-400", label: "Transcribing" },
    embedding: { bg: "bg-blue-950", text: "text-blue-400", label: "Analyzing" },
    generating_preview: { bg: "bg-purple-950", text: "text-purple-400", label: "Generating" },
    ready: { bg: "bg-emerald-950", text: "text-emerald-400", label: "Ready" },
    failed: { bg: "bg-red-950", text: "text-red-400", label: "Failed" },
  };

  const status = statusConfig[episode.status] ?? statusConfig.queued;

  return (
    <div className="rounded-2xl bg-surface-1 p-5 transition-all duration-200 hover:bg-surface-2 group">
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <Link
            href={`/episodes/${episode.id}`}
            className="group-hover:text-primary transition-colors duration-200"
          >
            <h3 className="font-semibold text-on-surface text-[15px] leading-snug line-clamp-2">
              {episode.title}
            </h3>
          </Link>
          {episode.publishedAt && (
            <p className="text-xs text-on-surface-dim/60 mt-1.5">
              {episode.publishedAt.slice(0, 10)}
            </p>
          )}
        </div>
        <span
          className={`shrink-0 text-[11px] font-medium px-2.5 py-1 rounded-full ${status.bg} ${status.text}`}
        >
          {status.label}
        </span>
      </div>

      {episode.previewJson && (
        <div className="mt-3">
          <p className="text-sm text-on-surface/80 leading-relaxed">
            {episode.previewJson.summary}
          </p>

          <button
            onClick={() => setExpanded(!expanded)}
            className="text-xs text-primary font-medium mt-3 hover:text-primary-dim transition-colors duration-200"
          >
            {expanded ? "Show less" : "Why listen?"}
          </button>

          <div
            className={`grid transition-all duration-300 ease-in-out ${
              expanded ? "grid-rows-[1fr] opacity-100 mt-3" : "grid-rows-[0fr] opacity-0"
            }`}
          >
            <div className="overflow-hidden space-y-3 text-sm">
              <div className="rounded-xl bg-surface-2 p-3 space-y-2">
                <p className="text-emerald-400">
                  <span className="text-xs opacity-60 mr-1">LIKE IF</span>
                  {episode.previewJson.likeThisIf}
                </p>
                <p className="text-rose-400">
                  <span className="text-xs opacity-60 mr-1">SKIP IF</span>
                  {episode.previewJson.skipThisIf}
                </p>
              </div>

              {episode.previewJson.timestamps.length > 0 && (
                <div>
                  <p className="text-on-surface-dim text-xs font-medium mb-2">
                    Key moments
                  </p>
                  <div className="space-y-1.5">
                    {episode.previewJson.timestamps.map((ts, i) => (
                      <div key={i} className="flex items-baseline gap-2">
                        <span className="text-primary/70 font-mono text-xs shrink-0">
                          {ts.time}
                        </span>
                        <span className="text-on-surface/70 text-xs">
                          {ts.topic}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
