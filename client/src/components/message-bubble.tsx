import type { Message } from "@shared/schema";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

interface MessageBubbleProps {
  message: Message;
  time: string;
}

export default function MessageBubble({ message, time }: MessageBubbleProps) {
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
        <div className="bg-assistant rounded-2xl rounded-tl-md px-4 py-3 max-w-lg">
          <div className="text-foreground prose prose-invert max-w-none prose-p:my-2 prose-h1:text-lg prose-h2:text-base prose-h3:text-sm prose-ul:my-2 prose-ol:my-2 prose-li:my-0">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>
              {message.content}
            </ReactMarkdown>
          </div>
        </div>
        <div className="flex items-center space-x-2 mt-1">
          <span className="text-xs text-muted-foreground">Assistant</span>
          <span className="text-xs text-muted-foreground">•</span>
          <span className="text-xs text-muted-foreground">{time}</span>
        </div>
      </div>
    </div>
  );
}
