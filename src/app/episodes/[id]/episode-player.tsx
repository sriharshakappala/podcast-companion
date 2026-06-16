"use client";

import { AudioPlayer } from "@/components/player/audio-player";

interface EpisodePlayerProps {
  episodeId: string;
  audioUrl: string;
  title: string;
  timestamps: { time: string; topic: string }[];
}

export function EpisodePlayer({
  episodeId,
  audioUrl,
  title,
  timestamps,
}: EpisodePlayerProps) {
  async function trackEvent(type: string) {
    await fetch("/api/feedback", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ episodeId, type }),
    }).catch(() => {});
  }

  return (
    <AudioPlayer
      audioUrl={audioUrl}
      title={title}
      timestamps={timestamps}
      onPlay={() => trackEvent("play")}
      onFinish={() => trackEvent("finish")}
    />
  );
}
