"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const TOPICS = [
  { id: "technology", label: "Technology", emoji: "💻" },
  { id: "startups", label: "Startups", emoji: "🚀" },
  { id: "science", label: "Science", emoji: "🔬" },
  { id: "health", label: "Health", emoji: "🏃" },
  { id: "design", label: "Design", emoji: "🎨" },
  { id: "finance", label: "Finance", emoji: "💰" },
  { id: "history", label: "History", emoji: "📜" },
  { id: "comedy", label: "Comedy", emoji: "😂" },
  { id: "true-crime", label: "True Crime", emoji: "🔍" },
  { id: "self-improvement", label: "Growth", emoji: "📈" },
  { id: "politics", label: "Politics", emoji: "🏛️" },
  { id: "sports", label: "Sports", emoji: "⚽" },
  { id: "music", label: "Music", emoji: "🎵" },
  { id: "philosophy", label: "Philosophy", emoji: "🤔" },
  { id: "ai-ml", label: "AI & ML", emoji: "🤖" },
  { id: "culture", label: "Culture", emoji: "🎬" },
];

export function TopicSelector() {
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function toggle(id: string) {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  }

  async function handleSubmit() {
    if (selected.length < 3) return;
    setLoading(true);

    await fetch("/api/onboarding", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ topics: selected }),
    });

    router.push("/home");
  }

  return (
    <div>
      <div className="flex flex-wrap gap-2.5 justify-center mb-10">
        {TOPICS.map((topic) => {
          const isSelected = selected.includes(topic.id);
          return (
            <button
              key={topic.id}
              onClick={() => toggle(topic.id)}
              className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all duration-200 ${
                isSelected
                  ? "bg-primary-container text-primary scale-105 shadow-lg shadow-primary/10"
                  : "bg-surface-1 text-on-surface-dim hover:bg-surface-2 hover:text-on-surface"
              }`}
            >
              <span>{topic.emoji}</span>
              {topic.label}
            </button>
          );
        })}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5].map((n) => (
            <div
              key={n}
              className={`w-2 h-2 rounded-full transition-all duration-300 ${
                selected.length >= n ? "bg-primary scale-110" : "bg-outline"
              }`}
            />
          ))}
        </div>
        <button
          onClick={handleSubmit}
          disabled={selected.length < 3 || loading}
          className="rounded-full bg-primary text-surface-0 px-7 py-3 text-sm font-semibold disabled:opacity-30 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200"
        >
          {loading ? "Saving..." : "Continue"}
        </button>
      </div>
    </div>
  );
}
