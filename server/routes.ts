import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema, apiMessageSchema, messages } from "@shared/schema";
import { db } from "./db";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || "asst_h3s1TBNQUXg1NqxGcwXNAWZl";

// Thread preloading system
class ThreadPreloader {
  private preloadedThreads: Set<string> = new Set();
  private maxPreloadedThreads = 5;
  
  async preloadThread(): Promise<string> {
    try {
      const thread = await openai.beta.threads.create();
      this.preloadedThreads.add(thread.id);
      console.log(`Preloaded thread: ${thread.id}`);
      return thread.id;
    } catch (error) {
      console.error("Error preloading thread:", error);
      throw error;
    }
  }
  
  getPreloadedThread(): string | null {
    const threadId = this.preloadedThreads.values().next().value;
    if (threadId) {
      this.preloadedThreads.delete(threadId);
      // Immediately start preloading a replacement
      this.preloadThread().catch(console.error);
      return threadId;
    }
    return null;
  }
  
  async initializePool() {
    console.log("Initializing thread preload pool...");
    const promises = [];
    for (let i = 0; i < this.maxPreloadedThreads; i++) {
      promises.push(this.preloadThread());
    }
    await Promise.all(promises);
    console.log(`Thread pool initialized with ${this.maxPreloadedThreads} threads`);
  }
  
  getPoolStatus() {
    return {
      available: this.preloadedThreads.size,
      target: this.maxPreloadedThreads
    };
  }
  
  // Maintain the thread pool by ensuring we always have the target number
  async maintainPool() {
    const currentCount = this.preloadedThreads.size;
    const needed = this.maxPreloadedThreads - currentCount;
    
    if (needed > 0) {
      console.log(`Maintaining thread pool: adding ${needed} threads`);
      const promises = [];
      for (let i = 0; i < needed; i++) {
        promises.push(this.preloadThread());
      }
      await Promise.all(promises);
    }
  }
}

const threadPreloader = new ThreadPreloader();

export async function registerRoutes(app: Express): Promise<Server> {
  
  // Initialize thread preload pool on startup
  threadPreloader.initializePool().catch(console.error);
  
  // Set up periodic maintenance every 5 minutes
  setInterval(() => {
    threadPreloader.maintainPool().catch(console.error);
  }, 5 * 60 * 1000);
  
  // Thread pool status endpoint
  app.get("/api/thread-pool-status", (req, res) => {
    res.json(threadPreloader.getPoolStatus());
  });
  
  // Get messages for a session
  app.get("/api/messages/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      const messages = await storage.getMessagesBySession(sessionId);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Send a message and get assistant response
  app.post("/api/messages", async (req, res) => {
    try {
      // Simple validation without complex schema parsing
      const { content, sessionId } = req.body;
      
      if (!content || !sessionId) {
        return res.status(400).json({ message: "Content and sessionId are required" });
      }
      
      const messageData = {
        content,
        sessionId,
        role: "user" as const
      };
      
      if (!ASSISTANT_ID) {
        return res.status(500).json({ message: "OpenAI Assistant ID not configured" });
      }

      // Save user message directly to database
      const [userMessage] = await db
        .insert(messages)
        .values({
          content: content,
          role: "user",
          sessionId: sessionId
        })
        .returning();

      // Get or create thread for this session
      let assistantThread = await storage.getAssistantThread(sessionId);
      console.log("Retrieved assistantThread:", assistantThread);
      
      if (!assistantThread) {
        // Try to use a preloaded thread first
        let threadId = threadPreloader.getPreloadedThread();
        
        if (!threadId) {
          // Fallback to creating new thread if none preloaded
          const thread = await openai.beta.threads.create();
          threadId = thread.id;
          console.log("Created new OpenAI thread:", threadId);
        } else {
          console.log("Using preloaded thread:", threadId);
        }
        
        assistantThread = await storage.createAssistantThread({
          sessionId: sessionId,
          threadId: threadId
        });
        console.log("Stored assistantThread:", assistantThread);
      }

      if (!assistantThread.threadId) {
        throw new Error("Thread ID is missing from stored assistant thread");
      }

      console.log("About to use threadId:", assistantThread.threadId);

      // Add message to thread
      await openai.beta.threads.messages.create(assistantThread.threadId, {
        role: "user",
        content: messageData.content
      });

      // Run the assistant
      const run = await openai.beta.threads.runs.create(assistantThread.threadId, {
        assistant_id: ASSISTANT_ID
      });

      console.log("Created run:", run.id, "for thread:", assistantThread.threadId);

      // Wait for completion with optimized polling
      let runStatus = run;
      let pollInterval = 500; // Start with 500ms
      const maxInterval = 2000; // Cap at 2 seconds
      
      while (runStatus.status === "queued" || runStatus.status === "in_progress") {
        await new Promise(resolve => setTimeout(resolve, pollInterval));
        
        const response = await fetch(`https://api.openai.com/v1/threads/${assistantThread.threadId}/runs/${run.id}`, {
          headers: {
            'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
            'OpenAI-Beta': 'assistants=v2'
          }
        });
        runStatus = await response.json();
        console.log("Run status:", runStatus.status);
        
        // Gradually increase polling interval to reduce API calls
        pollInterval = Math.min(pollInterval * 1.2, maxInterval);
      }

      if (runStatus && runStatus.status === "completed") {
        // Get the assistant's response - limit to 5 most recent messages for faster retrieval
        const threadMessages = await openai.beta.threads.messages.list(assistantThread.threadId, { 
          limit: 5,
          order: "desc"
        });
        const assistantMessage = threadMessages.data.find(msg => msg.role === "assistant");

        console.log("Found assistant message:", assistantMessage?.id);
        
        if (assistantMessage && assistantMessage.content && assistantMessage.content.length > 0) {
          // Get the text content from the first content block
          const contentBlock = assistantMessage.content[0];
          let responseText = "Assistant responded";
          
          if (contentBlock.type === "text") {
            responseText = (contentBlock as any).text?.value || "No text content";
          }
          
          console.log("Extracted response text:", responseText);
          
          // Save the assistant response and send response immediately
          const assistantResponse = await storage.createMessage({
            content: responseText,
            role: "assistant",
            sessionId: sessionId
          });

          res.json({ userMessage, assistantResponse });
        } else {
          // Fallback response if no content found
          const assistantResponse = await storage.createMessage({
            content: "Assistant completed the request",
            role: "assistant", 
            sessionId: sessionId
          });
          
          res.json({ userMessage, assistantResponse });
        }
      } else {
        throw new Error(`Assistant run failed with status: ${runStatus?.status || "unknown"}`);
      }

    } catch (error) {
      console.error("Error processing message:", error);
      res.status(500).json({ 
        message: error instanceof Error ? error.message : "Failed to process message" 
      });
    }
  });

  // Clear chat history for a session
  app.delete("/api/messages/:sessionId", async (req, res) => {
    try {
      const sessionId = req.params.sessionId;
      await storage.clearMessagesBySession(sessionId);
      res.json({ message: "Chat history cleared" });
    } catch (error) {
      console.error("Error clearing messages:", error);
      res.status(500).json({ message: "Failed to clear chat history" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
