import { useEffect, useRef, useState } from "react";
import MessageBubble from "./message-bubble";
import type { Message } from "@shared/schema";

interface MessageContainerProps {
  messages: Message[];
  isLoading: boolean;
  isAssistantTyping: boolean;
  textSize: 'small' | 'medium' | 'large';
}

export default function MessageContainer({ messages, isLoading, isAssistantTyping, textSize }: MessageContainerProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);

  // Auto-scroll to bottom on new messages
  useEffect(() => {
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight;
    }
  }, [messages, isAssistantTyping]);

  // Check if user has scrolled up
  const handleScroll = () => {
    if (containerRef.current) {
      const { scrollTop, scrollHeight, clientHeight } = containerRef.current;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      setShowScrollButton(!isAtBottom && messages.length > 3);
    }
  };

  const scrollToBottom = () => {
    if (containerRef.current) {
      containerRef.current.scrollTo({
        top: containerRef.current.scrollHeight,
        behavior: 'smooth'
      });
    }
  };

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
    <div className="flex-1 relative">
      <div 
        ref={containerRef}
        onScroll={handleScroll}
        className="h-full overflow-y-auto px-6 py-4 space-y-4 scroll-smooth"
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
                <p className={`text-foreground leading-relaxed ${textSize === 'small' ? 'text-sm' : textSize === 'large' ? 'text-lg' : 'text-base'}`}>Hello! I'm here to help with questions about relationships, mindfulness, and personal growth. How can I assist you today?</p>
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
              textSize={textSize}
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

      {/* Scroll to bottom button */}
      {showScrollButton && (
        <button
          onClick={scrollToBottom}
          className="fixed bottom-20 right-6 bg-primary hover:bg-primary/90 text-primary-foreground rounded-full w-10 h-10 flex items-center justify-center message-shadow hover:shadow-lg transition-smooth animate-fade-in z-10"
          title="Scroll to bottom"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd"/>
          </svg>
        </button>
      )}
    </div>
  );
}
