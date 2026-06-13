import Parser from "rss-parser";

const parser = new Parser();

export interface FeedEpisode {
  title: string;
  audioUrl: string;
  publishedAt: Date | null;
}

export async function parseFeed(feedUrl: string): Promise<{
  title: string;
  episodes: FeedEpisode[];
}> {
  const feed = await parser.parseURL(feedUrl);

  const episodes: FeedEpisode[] = (feed.items ?? [])
    .filter((item) => item.enclosure?.url)
    .map((item) => ({
      title: item.title ?? "Untitled",
      audioUrl: item.enclosure!.url!,
      publishedAt: item.pubDate ? new Date(item.pubDate) : null,
    }));

  return { title: feed.title ?? feedUrl, episodes };
}
