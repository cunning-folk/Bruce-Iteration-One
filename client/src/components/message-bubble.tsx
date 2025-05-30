import type { Message } from "@shared/schema";

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
              <p>{message.content}</p>
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
          <p className="text-foreground whitespace-pre-wrap">{message.content}</p>
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
