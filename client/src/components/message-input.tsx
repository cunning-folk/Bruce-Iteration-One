import { useState, useRef, useEffect } from "react";

interface MessageInputProps {
  onSendMessage: (message: string) => void;
  disabled: boolean;
  messageCount: number;
  responseTime?: string;
  isCached?: boolean;
}

export default function MessageInput({ onSendMessage, disabled, messageCount, responseTime, isCached }: MessageInputProps) {
  const [message, setMessage] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message);
        setMessage("");
      }
    }
  };

  const characterCount = message.length;
  const isOverLimit = characterCount > 1000;
  const canSend = message.trim().length > 0 && !disabled && !isOverLimit;

  return (
    <div className="border-t border-border bg-background p-4">
      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..." 
            className={`w-full px-4 py-3 pr-12 border border-input bg-background text-foreground rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent max-h-32 min-h-[48px] placeholder:text-muted-foreground transition-opacity ${disabled ? 'opacity-60' : 'opacity-100'}`}
            rows={1}
            disabled={disabled}
          />
          
          <div className={`absolute bottom-2 right-3 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/1000
          </div>
        </div>
        
        <button 
          type="submit" 
          disabled={!canSend}
          className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center transition-colors"
        >
          {disabled ? (
            <div className="animate-spin">
              <i className="fas fa-circle-notch text-sm"></i>
            </div>
          ) : (
            <i className="fas fa-paper-plane text-sm"></i>
          )}
        </button>
      </form>
      
      <div className="flex items-center justify-between mt-2 px-1">
        <p className="text-xs text-muted-foreground">Press Enter to send, Shift+Enter for new line</p>
        <div className="flex items-center space-x-4 text-xs text-muted-foreground">
          <span>{messageCount} messages</span>
          <span>•</span>
          {isCached && (
            <>
              <span className="flex items-center space-x-1">
                <span>⚡</span>
                <span>Instant response</span>
              </span>
              <span>•</span>
            </>
          )}
          {responseTime && (
            <>
              <span>{responseTime}</span>
              <span>•</span>
            </>
          )}
          <span>Secure connection</span>
        </div>
      </div>
    </div>
  );
}
