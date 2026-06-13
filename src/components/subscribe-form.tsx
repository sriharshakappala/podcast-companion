"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscribeForm() {
  const [feedUrl, setFeedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to subscribe");
    } else {
      setFeedUrl("");
      router.refresh();
    }

    setLoading(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 mb-6">
      <input
        type="url"
        value={feedUrl}
        onChange={(e) => setFeedUrl(e.target.value)}
        placeholder="Paste podcast RSS feed URL..."
        className="flex-1 rounded-lg border border-gray-700 bg-gray-800 px-4 py-2 text-sm text-white placeholder-gray-500 focus:border-indigo-500 focus:outline-none"
        required
      />
      <button
        type="submit"
        disabled={loading}
        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-500 disabled:opacity-50 transition"
      >
        {loading ? "..." : "Subscribe"}
      </button>
      {error && <p className="text-red-400 text-xs self-center">{error}</p>}
    </form>
  );
}
