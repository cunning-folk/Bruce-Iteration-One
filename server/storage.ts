import { users, messages, assistantThreads, type User, type InsertUser, type Message, type InsertMessage, type AssistantThread, type InsertAssistantThread } from "@shared/schema";
import { db } from "./db";
import { eq } from "drizzle-orm";

export interface IStorage {
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  // Message operations
  getMessagesBySession(sessionId: string): Promise<Message[]>;
  createMessage(message: InsertMessage): Promise<Message>;
  clearMessagesBySession(sessionId: string): Promise<void>;
  
  // Assistant thread operations
  getAssistantThread(sessionId: string): Promise<AssistantThread | undefined>;
  createAssistantThread(thread: InsertAssistantThread): Promise<AssistantThread>;
}

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(insertUser)
      .returning();
    return user;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return await db.select().from(messages)
      .where(eq(messages.sessionId, sessionId))
      .orderBy(messages.timestamp);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const [message] = await db
      .insert(messages)
      .values(insertMessage)
      .returning();
    return message;
  }

  async clearMessagesBySession(sessionId: string): Promise<void> {
    await db.delete(messages).where(eq(messages.sessionId, sessionId));
  }

  async getAssistantThread(sessionId: string): Promise<AssistantThread | undefined> {
    const [thread] = await db.select().from(assistantThreads)
      .where(eq(assistantThreads.sessionId, sessionId));
    return thread || undefined;
  }

  async createAssistantThread(insertThread: InsertAssistantThread): Promise<AssistantThread> {
    const [thread] = await db
      .insert(assistantThreads)
      .values(insertThread)
      .returning();
    return thread;
  }
}

export const storage = new DatabaseStorage();
