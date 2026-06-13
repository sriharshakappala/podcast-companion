import OpenAI from "openai";

const openai = new OpenAI();

export async function generateEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: "text-embedding-3-small",
    input: text.slice(0, 8000),
  });
  return response.data[0].embedding;
}

export interface EpisodePreview {
  summary: string;
  timestamps: { time: string; topic: string }[];
  likeThisIf: string;
  skipThisIf: string;
}

export async function generatePreview(transcript: string): Promise<EpisodePreview> {
  const response = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `You generate podcast episode previews. Return JSON with:
- "summary": 2-3 sentence overview
- "timestamps": array of {time, topic} key moments
- "likeThisIf": one sentence about who will enjoy this
- "skipThisIf": one sentence about who should skip this`,
      },
      {
        role: "user",
        content: `Generate a preview for this podcast transcript:\n\n${transcript.slice(0, 12000)}`,
      },
    ],
  });

  return JSON.parse(response.choices[0].message.content!) as EpisodePreview;
}
