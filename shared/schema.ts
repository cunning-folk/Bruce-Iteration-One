import { pgTable, text, serial, integer, boolean, timestamp } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const messages = pgTable("messages", {
  id: serial("id").primaryKey(),
  content: text("content").notNull(),
  role: text("role").notNull(), // 'user' or 'assistant'
  sessionId: text("session_id").notNull(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const assistantThreads = pgTable("assistant_threads", {
  id: serial("id").primaryKey(),
  sessionId: text("session_id").notNull().unique(),
  threadId: text("thread_id").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertMessageSchema = createInsertSchema(messages).pick({
  content: true,
  role: true,
  sessionId: true,
});

export const insertAssistantThreadSchema = createInsertSchema(assistantThreads).pick({
  sessionId: true,
  threadId: true,
});

export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertMessage = z.infer<typeof insertMessageSchema>;
export type Message = typeof messages.$inferSelect;

export type InsertAssistantThread = z.infer<typeof insertAssistantThreadSchema>;
export type AssistantThread = typeof assistantThreads.$inferSelect;
