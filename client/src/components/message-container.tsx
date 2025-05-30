import { useEffect, useRef } from "react";
import MessageBubble from "./message-bubble";
import type { Message } from "@shared/schema";

interface MessageContainerProps {
  messages: Message[];
  isLoading: boolean;
  isAssistantTyping: boolean;
}

export default function MessageContainer({ messages, isLoading, isAssistantTyping }: MessageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isAssistantTyping]);

  const formatTime = (timestamp: Date) => {
    return new Date(timestamp).toLocaleTimeString('en-US', { 
      hour: 'numeric', 
      minute: '2-digit',
      hour12: true 
    });
  };

  if (isLoading) {
    return (
      <div className="flex-1 overflow-y-auto px-6 py-4 flex items-center justify-center">
        <div className="text-muted-foreground">Loading messages...</div>
      </div>
    );
  }

  return (
    <div 
      ref={containerRef}
      className="flex-1 overflow-y-auto px-6 py-4 space-y-4"
    >
      {/* Welcome message when no messages */}
      {messages.length === 0 && (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-primary text-sm"></i>
          </div>
          <div className="flex-1">
            <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg">
              <p className="text-foreground">Hello! I'm here to help with questions about relationships, mindfulness, and personal growth. How can I assist you today?</p>
            </div>
            <div className="flex items-center space-x-2 mt-1">
              <span className="text-xs text-muted-foreground">Assistant</span>
              <span className="text-xs text-muted-foreground">•</span>
              <span className="text-xs text-muted-foreground">{formatTime(new Date())}</span>
            </div>
          </div>
        </div>
      )}

      {/* Render actual messages */}
      {messages.map((message) => (
        <MessageBubble 
          key={message.id}
          message={message}
          time={formatTime(message.timestamp)}
        />
      ))}

      {/* Loading state when assistant is typing */}
      {isAssistantTyping && (
        <div className="flex items-start space-x-3">
          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-robot text-blue-600 text-sm"></i>
          </div>
          <div className="flex-1">
            <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg">
              <div className="flex items-center space-x-2">
                <div className="flex space-x-1">
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
                <span className="text-slate-500 text-sm">Assistant is typing...</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
