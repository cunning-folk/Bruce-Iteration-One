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
  const [isListening, setIsListening] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);

  // Auto-resize textarea
  useEffect(() => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  }, [message]);

  // Also handle resize on input change for immediate feedback
  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = textareaRef.current.scrollHeight + 'px';
    }
  };

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition();
        recognitionRef.current.continuous = true;
        recognitionRef.current.interimResults = true;
        recognitionRef.current.lang = 'en-US';

        recognitionRef.current.onresult = (event: any) => {
          let transcript = '';
          for (let i = 0; i < event.results.length; i++) {
            transcript += event.results[i][0].transcript;
          }
          setMessage(transcript);
        };

        recognitionRef.current.onend = () => {
          setIsListening(false);
        };

        recognitionRef.current.onerror = (event: any) => {
          console.error('Speech recognition error:', event.error);
          setIsListening(false);
        };
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const toggleVoiceInput = () => {
    if (!recognitionRef.current) {
      alert('Voice input is not supported in this browser. Please try Chrome, Safari, or Edge.');
      return;
    }

    if (isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    } else {
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (message.trim() && !disabled) {
      onSendMessage(message);
      setMessage("");
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
        textareaRef.current.focus();
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      if (message.trim() && !disabled) {
        onSendMessage(message);
        setMessage("");
        if (textareaRef.current) {
          textareaRef.current.style.height = 'auto';
          textareaRef.current.focus();
        }
      }
    }
    // Add keyboard shortcuts
    if (e.key === 'Escape' && isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
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
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder="Type your message..." 
            className={`w-full px-4 py-3 pr-12 border border-input bg-background text-foreground rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent max-h-48 min-h-[48px] placeholder:text-muted-foreground transition-smooth overflow-hidden message-shadow ${disabled ? 'opacity-60' : 'opacity-100'} ${isOverLimit ? 'border-red-500' : ''}`}
            rows={1}
            disabled={disabled}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
          
          <div className={`absolute bottom-2 right-3 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/1000
          </div>
        </div>
        
        <button 
          type="button"
          onClick={toggleVoiceInput}
          disabled={disabled}
          className={`mr-2 rounded-full w-12 h-12 flex items-center justify-center transition-smooth message-shadow ${
            isListening 
              ? 'bg-red-500 hover:bg-red-600 text-white animate-pulse' 
              : 'bg-secondary hover:bg-secondary/80 text-secondary-foreground'
          } disabled:bg-muted disabled:cursor-not-allowed hover:shadow-lg`}
          title={isListening ? 'Stop voice input (Esc)' : 'Start voice input'}
        >
{isListening ? (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <rect x="6" y="6" width="8" height="8" rx="1"/>
            </svg>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clipRule="evenodd"/>
            </svg>
          )}
        </button>
        
        <button 
          type="submit" 
          disabled={!canSend}
          className="bg-primary hover:bg-primary/90 disabled:bg-muted disabled:cursor-not-allowed text-primary-foreground rounded-full w-12 h-12 flex items-center justify-center transition-smooth message-shadow hover:shadow-lg"
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
