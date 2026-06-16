import { pgTable, text, timestamp, uuid, varchar, jsonb, integer, vector, pgEnum } from "drizzle-orm/pg-core";

export const feedbackTypeEnum = pgEnum("feedback_type", [
  "play",
  "skip",
  "finish",
  "highlight",
  "thumbs_up",
  "thumbs_down",
]);

export const episodeStatusEnum = pgEnum("episode_status", [
  "queued",
  "transcribing",
  "embedding",
  "generating_preview",
  "ready",
  "failed",
]);

export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  clerkId: varchar("clerk_id", { length: 255 }).notNull().unique(),
  topicPreferences: jsonb("topic_preferences").$type<string[]>().default([]),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const subscriptions = pgTable("subscriptions", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  feedUrl: text("feed_url").notNull(),
  title: varchar("title", { length: 500 }),
  lastPolledAt: timestamp("last_polled_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const episodes = pgTable("episodes", {
  id: uuid("id").defaultRandom().primaryKey(),
  subscriptionId: uuid("subscription_id").references(() => subscriptions.id),
  title: varchar("title", { length: 1000 }).notNull(),
  audioUrl: text("audio_url").notNull().unique(),
  publishedAt: timestamp("published_at"),
  transcript: text("transcript"),
  embedding: vector("embedding", { dimensions: 1536 }),
  previewJson: jsonb("preview_json").$type<{
    summary: string;
    timestamps: { time: string; topic: string }[];
    likeThisIf: string;
    skipThisIf: string;
  }>(),
  status: episodeStatusEnum("status").default("queued").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const feedbackEvents = pgTable("feedback_events", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  episodeId: uuid("episode_id").references(() => episodes.id).notNull(),
  type: feedbackTypeEnum("type").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const highlights = pgTable("highlights", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  episodeId: uuid("episode_id").references(() => episodes.id).notNull(),
  text: text("text").notNull(),
  timestampStart: integer("timestamp_start"),
  timestampEnd: integer("timestamp_end"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const briefings = pgTable("briefings", {
  id: uuid("id").defaultRandom().primaryKey(),
  userId: uuid("user_id").references(() => users.id).notNull(),
  episodeIds: jsonb("episode_ids").$type<string[]>().notNull(),
  generatedAt: timestamp("generated_at").defaultNow().notNull(),
  seen: integer("seen").default(0).notNull(),
});
