import { AssemblyAI } from "assemblyai";

const client = new AssemblyAI({ apiKey: process.env.ASSEMBLYAI_API_KEY! });

export async function transcribeAudio(audioUrl: string): Promise<string> {
  const transcript = await client.transcripts.transcribe({ audio_url: audioUrl });

  if (transcript.status === "error") {
    throw new Error(`Transcription failed: ${transcript.error}`);
  }

  return transcript.text ?? "";
}
