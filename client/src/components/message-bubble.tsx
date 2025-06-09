import type { Message } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { useState } from "react";

interface MessageBubbleProps {
  message: Message;
  time: string;
}

export default function MessageBubble({ message, time }: MessageBubbleProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  if (message.role === "user") {
    return (
      <>
        <div className="flex items-start space-x-3 justify-end">
          <div className="flex-1 flex justify-end">
            <div className="bg-user-bubble text-white rounded-2xl rounded-tr-md px-4 py-3 max-w-lg">
              <div className="prose prose-invert max-w-none prose-p:my-1 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-ul:my-1 prose-ol:my-1 prose-li:my-0">
                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                  {message.content}
                </ReactMarkdown>
              </div>
            </div>
          </div>
          <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
            <i className="fas fa-user text-muted-foreground text-sm"></i>
          </div>
        </div>
        <div className="flex justify-end pr-11">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">You</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{time}</span>
            <i className="fas fa-check-double text-xs text-primary"></i>
          </div>
        </div>
      </>
    );
  }

  return (
    <div className="flex items-start space-x-3">
      <div className="w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center flex-shrink-0">
        <i className="fas fa-robot text-primary text-sm"></i>
      </div>
      <div className="flex-1">
        <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg message-shadow transition-smooth hover:shadow-lg">
          <div className="text-foreground prose prose-invert max-w-none prose-p:my-2 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center justify-between mt-1">
          <div className="flex items-center space-x-2">
            <span className="text-xs text-muted-foreground">Assistant</span>
            <span className="text-xs text-muted-foreground">•</span>
            <span className="text-xs text-muted-foreground">{time}</span>
          </div>
          <button
            onClick={handleCopy}
            className="text-muted-foreground hover:text-foreground transition-colors p-1 rounded"
            title={copied ? 'Copied!' : 'Copy response'}
          >
            {copied ? (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M8 3a1 1 0 011-1h2a1 1 0 110 2H9a1 1 0 01-1-1z"/>
                <path d="M6 3a2 2 0 00-2 2v11a2 2 0 002 2h8a2 2 0 002-2V5a2 2 0 00-2-2 3 3 0 01-3 3H9a3 3 0 01-3-3z"/>
              </svg>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
