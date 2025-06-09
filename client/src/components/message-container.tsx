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
        <div className="flex items-start space-x-3 animate-fade-in">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
            <svg className="w-4 h-4 text-primary" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg message-shadow transition-smooth">
              <p className="text-foreground leading-relaxed">Hello! I'm here to help with questions about relationships, mindfulness, and personal growth. How can I assist you today?</p>
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
      {messages.map((message, index) => (
        <div key={message.id} className="animate-slide-in" style={{ animationDelay: `${index * 100}ms` }}>
          <MessageBubble 
            message={message}
            time={formatTime(message.timestamp)}
          />
        </div>
      ))}

      {/* Loading state when assistant is typing */}
      {isAssistantTyping && (
        <div className="flex items-start space-x-3 animate-fade-in">
          <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0 animate-pulse-gentle">
            <svg className="w-4 h-4 text-primary animate-typing" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
            </svg>
          </div>
          <div className="flex-1">
            <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg message-shadow">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
