"use client";

import { useRef, useState, useEffect } from "react";

interface AudioPlayerProps {
  audioUrl: string;
  title: string;
  timestamps?: { time: string; topic: string }[];
  onPlay?: () => void;
  onFinish?: () => void;
}

export function AudioPlayer({
  audioUrl,
  title,
  timestamps,
  onPlay,
  onFinish,
}: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [playbackRate, setPlaybackRate] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleTimeUpdate = () => setCurrentTime(audio.currentTime);
    const handleLoadedMetadata = () => setDuration(audio.duration);
    const handleEnded = () => {
      setIsPlaying(false);
      onFinish?.();
    };

    audio.addEventListener("timeupdate", handleTimeUpdate);
    audio.addEventListener("loadedmetadata", handleLoadedMetadata);
    audio.addEventListener("ended", handleEnded);

    return () => {
      audio.removeEventListener("timeupdate", handleTimeUpdate);
      audio.removeEventListener("loadedmetadata", handleLoadedMetadata);
      audio.removeEventListener("ended", handleEnded);
    };
  }, [onFinish]);

  function togglePlay() {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
    } else {
      audio.play();
      if (!hasStarted) {
        setHasStarted(true);
        onPlay?.();
      }
    }
    setIsPlaying(!isPlaying);
  }

  function seek(e: React.ChangeEvent<HTMLInputElement>) {
    const audio = audioRef.current;
    if (!audio) return;
    const time = parseFloat(e.target.value);
    audio.currentTime = time;
    setCurrentTime(time);
  }

  function jumpToTimestamp(timeStr: string) {
    const audio = audioRef.current;
    if (!audio) return;
    const parts = timeStr.split(":").map(Number);
    let seconds = 0;
    if (parts.length === 3) seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
    else if (parts.length === 2) seconds = parts[0] * 60 + parts[1];
    else seconds = parts[0];
    audio.currentTime = seconds;
    setCurrentTime(seconds);
    if (!isPlaying) {
      audio.play();
      setIsPlaying(true);
      if (!hasStarted) {
        setHasStarted(true);
        onPlay?.();
      }
    }
  }

  function cycleSpeed() {
    const speeds = [1, 1.25, 1.5, 1.75, 2];
    const next = speeds[(speeds.indexOf(playbackRate) + 1) % speeds.length];
    setPlaybackRate(next);
    if (audioRef.current) audioRef.current.playbackRate = next;
  }

  function formatTime(s: number) {
    if (!s || !isFinite(s)) return "0:00";
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = Math.floor(s % 60);
    if (h > 0) return `${h}:${m.toString().padStart(2, "0")}:${sec.toString().padStart(2, "0")}`;
    return `${m}:${sec.toString().padStart(2, "0")}`;
  }

  function skip(seconds: number) {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = Math.max(0, Math.min(audio.currentTime + seconds, duration));
  }

  return (
    <div className="rounded-lg border border-gray-800 bg-gray-900 p-4">
      <audio ref={audioRef} src={audioUrl} preload="metadata" />

      <p className="text-sm text-gray-400 mb-3 truncate">{title}</p>

      <div className="flex items-center gap-3 mb-3">
        <button
          onClick={() => skip(-15)}
          className="text-gray-400 hover:text-white text-xs"
        >
          -15s
        </button>

        <button
          onClick={togglePlay}
          className="w-10 h-10 rounded-full bg-indigo-600 hover:bg-indigo-500 flex items-center justify-center text-white transition"
        >
          {isPlaying ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
              <rect x="6" y="4" width="4" height="16" />
              <rect x="14" y="4" width="4" height="16" />
            </svg>
          ) : (
            <svg className="w-4 h-4 ml-0.5" fill="currentColor" viewBox="0 0 24 24">
              <polygon points="5,3 19,12 5,21" />
            </svg>
          )}
        </button>

        <button
          onClick={() => skip(30)}
          className="text-gray-400 hover:text-white text-xs"
        >
          +30s
        </button>

        <button
          onClick={cycleSpeed}
          className="text-xs text-gray-400 hover:text-white border border-gray-700 rounded px-2 py-0.5"
        >
          {playbackRate}x
        </button>
      </div>

      <div className="flex items-center gap-2">
        <span className="text-xs text-gray-500 w-12 text-right">
          {formatTime(currentTime)}
        </span>
        <input
          type="range"
          min={0}
          max={duration || 0}
          value={currentTime}
          onChange={seek}
          className="flex-1 h-1 accent-indigo-500 cursor-pointer"
        />
        <span className="text-xs text-gray-500 w-12">
          {formatTime(duration)}
        </span>
      </div>

      {timestamps && timestamps.length > 0 && (
        <div className="mt-4 border-t border-gray-800 pt-3">
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">
            Chapters
          </p>
          <ul className="space-y-1">
            {timestamps.map((ts, i) => (
              <li key={i}>
                <button
                  onClick={() => jumpToTimestamp(ts.time)}
                  className="text-sm text-left w-full hover:bg-gray-800 rounded px-2 py-1 transition"
                >
                  <span className="text-indigo-400 font-mono text-xs mr-2">
                    {ts.time}
                  </span>
                  <span className="text-gray-300">{ts.topic}</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
