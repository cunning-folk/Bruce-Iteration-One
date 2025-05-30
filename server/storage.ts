import { users, messages, assistantThreads, type User, type InsertUser, type Message, type InsertMessage, type AssistantThread, type InsertAssistantThread } from "@shared/schema";

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

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private messages: Map<number, Message>;
  private assistantThreads: Map<number, AssistantThread>;
  private currentUserId: number;
  private currentMessageId: number;
  private currentThreadId: number;

  constructor() {
    this.users = new Map();
    this.messages = new Map();
    this.assistantThreads = new Map();
    this.currentUserId = 1;
    this.currentMessageId = 1;
    this.currentThreadId = 1;
  }

  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.currentUserId++;
    const user: User = { ...insertUser, id };
    this.users.set(id, user);
    return user;
  }

  async getMessagesBySession(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(message => message.sessionId === sessionId)
      .sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = this.currentMessageId++;
    const message: Message = { 
      ...insertMessage, 
      id,
      timestamp: new Date()
    };
    this.messages.set(id, message);
    return message;
  }

  async clearMessagesBySession(sessionId: string): Promise<void> {
    const messagesToDelete = Array.from(this.messages.entries())
      .filter(([_, message]) => message.sessionId === sessionId)
      .map(([id, _]) => id);
    
    messagesToDelete.forEach(id => this.messages.delete(id));
  }

  async getAssistantThread(sessionId: string): Promise<AssistantThread | undefined> {
    return Array.from(this.assistantThreads.values())
      .find(thread => thread.sessionId === sessionId);
  }

  async createAssistantThread(insertThread: InsertAssistantThread): Promise<AssistantThread> {
    const id = this.currentThreadId++;
    const thread: AssistantThread = { 
      ...insertThread, 
      id,
      createdAt: new Date()
    };
    this.assistantThreads.set(id, thread);
    return thread;
  }
}

export const storage = new MemStorage();
