import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertMessageSchema } from "@shared/schema";
import OpenAI from "openai";
import { z } from "zod";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key"
});

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
const ASSISTANT_ID = process.env.OPENAI_ASSISTANT_ID || process.env.ASSISTANT_ID || "asst_h3s1TBNQUXg1NqxGcwXNAWZl";

export async function registerRoutes(app: Express): Promise<Server> {
  
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
      const messageData = insertMessageSchema.parse(req.body);
      
      if (!ASSISTANT_ID) {
        return res.status(500).json({ message: "OpenAI Assistant ID not configured" });
      }

      // Save user message
      const userMessage = await storage.createMessage(messageData);

      // Get or create thread for this session
      let assistantThread = await storage.getAssistantThread(messageData.sessionId);
      console.log("Retrieved assistantThread:", assistantThread);
      
      if (!assistantThread) {
        // Create new thread
        const thread = await openai.beta.threads.create();
        console.log("Created OpenAI thread:", thread.id);
        assistantThread = await storage.createAssistantThread({
          sessionId: messageData.sessionId,
          threadId: thread.id
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

      // Use the polling method provided by OpenAI SDK
      const completedRun = await openai.beta.threads.runs.poll(assistantThread.threadId, run.id);
      console.log("Completed run status:", completedRun.status);

      if (completedRun && completedRun.status === "completed") {
        // Get the assistant's response
        const messages = await openai.beta.threads.messages.list(assistantThread.threadId);
        const assistantMessage = messages.data.find(msg => 
          msg.role === "assistant" && 
          msg.created_at > (userMessage.timestamp.getTime() / 1000)
        );

        if (assistantMessage && assistantMessage.content[0]?.type === "text") {
          // Save assistant response
          const assistantResponse = await storage.createMessage({
            content: assistantMessage.content[0].text.value,
            role: "assistant",
            sessionId: messageData.sessionId
          });

          res.json({ userMessage, assistantResponse });
        } else {
          throw new Error("No valid assistant response found");
        }
      } else {
        throw new Error(`Assistant run failed with status: ${completedRun.status}`);
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
