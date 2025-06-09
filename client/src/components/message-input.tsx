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
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const recognitionRef = useRef<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file size (max 10MB)
      if (file.size > 10 * 1024 * 1024) {
        alert('File size must be less than 10MB');
        return;
      }
      // Check file type
      const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'text/plain', 'application/pdf'];
      if (!allowedTypes.includes(file.type)) {
        alert('Please upload images (JPG, PNG, GIF), text files, or PDFs only');
        return;
      }
      setUploadedFile(file);
    }
  };

  const removeFile = () => {
    setUploadedFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if ((message.trim() || uploadedFile) && !disabled) {
      let finalMessage = message.trim();
      if (uploadedFile) {
        finalMessage += uploadedFile ? ` [Attached: ${uploadedFile.name}]` : '';
      }
      onSendMessage(finalMessage);
      setMessage("");
      setUploadedFile(null);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
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
  const canSend = (message.trim().length > 0 || uploadedFile) && !disabled && !isOverLimit;

  return (
    <div className="border-t border-border bg-background p-4">
      {/* File upload preview */}
      {uploadedFile && (
        <div className="mb-3 p-3 bg-secondary/50 rounded-lg flex items-center justify-between animate-fade-in">
          <div className="flex items-center space-x-2">
            <svg className="w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 12a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 7a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V7z" clipRule="evenodd"/>
            </svg>
            <span className="text-sm text-foreground">{uploadedFile.name}</span>
            <span className="text-xs text-muted-foreground">({(uploadedFile.size / 1024).toFixed(1)} KB)</span>
          </div>
          <button
            type="button"
            onClick={removeFile}
            className="text-muted-foreground hover:text-foreground transition-smooth p-1 rounded"
            title="Remove file"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex items-end space-x-3">
        <div className="flex-1 relative">
          <textarea 
            ref={textareaRef}
            value={message}
            onChange={handleInputChange}
            onKeyDown={handleKeyDown}
            placeholder={uploadedFile ? "Add a message about your file..." : "Type your message..."} 
            className={`w-full px-4 py-3 pr-12 border border-input bg-background text-foreground rounded-2xl resize-none focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent max-h-48 min-h-[48px] placeholder:text-muted-foreground transition-smooth overflow-hidden message-shadow ${disabled ? 'opacity-60' : 'opacity-100'} ${isOverLimit ? 'border-red-500' : ''}`}
            rows={1}
            disabled={disabled}
            style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
          />
          
          <div className={`absolute bottom-2 right-3 text-xs ${isOverLimit ? 'text-destructive' : 'text-muted-foreground'}`}>
            {characterCount}/1000
          </div>
        </div>

        {/* Hidden file input */}
        <input
          ref={fileInputRef}
          type="file"
          onChange={handleFileUpload}
          accept="image/*,.txt,.pdf"
          className="hidden"
        />

        {/* File upload button */}
        <button 
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={disabled}
          className="mr-2 rounded-full w-12 h-12 flex items-center justify-center transition-smooth message-shadow bg-secondary hover:bg-secondary/80 text-secondary-foreground disabled:bg-muted disabled:cursor-not-allowed hover:shadow-lg"
          title="Upload file"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path d="M5.5 13a3.5 3.5 0 01-.369-6.98 4 4 0 117.753-1.977A4.5 4.5 0 1113.5 13H11V9.413l1.293 1.293a1 1 0 001.414-1.414l-3-3a1 1 0 00-1.414 0l-3 3a1 1 0 001.414 1.414L9 9.413V13H5.5z"/>
          </svg>
        </button>
        
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
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd"/>
              </svg>
            </div>
          ) : (
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z"/>
            </svg>
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
