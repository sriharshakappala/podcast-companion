"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function SubscribeForm() {
  const [feedUrl, setFeedUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setSuccess("");

    const res = await fetch("/api/subscriptions", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ feedUrl }),
    });

    if (!res.ok) {
      const data = await res.json();
      setError(data.error ?? "Failed to subscribe");
    } else {
      const data = await res.json();
      setSuccess(`Subscribed to ${data.title ?? "feed"}!`);
      setFeedUrl("");
      router.refresh();
      setTimeout(() => setSuccess(""), 3000);
    }

    setLoading(false);
  }

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="url"
          value={feedUrl}
          onChange={(e) => setFeedUrl(e.target.value)}
          placeholder="Paste podcast RSS feed URL..."
          className="flex-1 rounded-2xl bg-surface-1 border-0 px-5 py-3 text-sm text-on-surface placeholder-on-surface-dim/50 focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all duration-200"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="rounded-2xl bg-primary-container text-primary px-5 py-3 text-sm font-semibold hover:bg-surface-3 disabled:opacity-40 transition-all duration-200"
        >
          {loading ? (
            <span className="inline-block w-4 h-4 border-2 border-primary/30 border-t-primary rounded-full animate-spin" />
          ) : (
            "Add"
          )}
        </button>
      </form>
      {error && (
        <p className="text-rose-400 text-xs mt-2 px-2">{error}</p>
      )}
      {success && (
        <p className="text-emerald-400 text-xs mt-2 px-2">{success}</p>
      )}
    </div>
  );
}
