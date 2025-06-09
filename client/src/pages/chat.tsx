import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ChatHeader from "@/components/chat-header";
import MessageContainer from "@/components/message-container";
import MessageInput from "@/components/message-input";
import ChatSidebar from "../components/chat-sidebar";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [textSize, setTextSize] = useState<'small' | 'medium' | 'large'>('medium');
  const [searchQuery, setSearchQuery] = useState("");
  const [sessions, setSessions] = useState<string[]>([]);
  const [currentSession, setCurrentSession] = useState(sessionId);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${currentSession}`],
    refetchInterval: false,
  });

  // Load sessions from localStorage
  useEffect(() => {
    const savedSessions = localStorage.getItem('chatSessions');
    if (savedSessions) {
      setSessions(JSON.parse(savedSessions));
    }
  }, []);

  // Save session to localStorage when messages are present
  useEffect(() => {
    if (messages.length > 0 && !sessions.includes(currentSession)) {
      const updatedSessions = [currentSession, ...sessions].slice(0, 10); // Keep last 10 sessions
      setSessions(updatedSessions);
      localStorage.setItem('chatSessions', JSON.stringify(updatedSessions));
    }
  }, [messages, currentSession, sessions]);

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
        sessionId: currentSession,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentSession}`] });
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error("Send message error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/messages/${currentSession}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${currentSession}`] });
    },
  });

  const handleSendMessage = (content: string) => {
    if (content.trim()) {
      sendMessageMutation.mutate(content.trim());
    }
  };

  const handleClearChat = () => {
    if (window.confirm("Are you sure you want to clear the chat history?")) {
      clearChatMutation.mutate();
    }
  };

  const dismissError = () => {
    setErrorMessage(null);
  };

  // Auto-dismiss error after 5 seconds
  useEffect(() => {
    if (errorMessage) {
      const timer = setTimeout(() => {
        setErrorMessage(null);
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [errorMessage]);

  // Filter messages based on search query
  const filteredMessages = searchQuery 
    ? messages.filter(message =>
        message.content.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : messages;

  // Handle sidebar functions
  const handleNewSession = () => {
    const newSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    setCurrentSession(newSessionId);
    setSidebarOpen(false);
  };

  const handleSessionSelect = (sessionId: string) => {
    setCurrentSession(sessionId);
    setSidebarOpen(false);
  };

  const handleExportChat = () => {
    const chatContent = messages.map(msg => 
      `${msg.role === 'user' ? 'You' : 'Assistant'} (${new Date(msg.timestamp).toLocaleString()}):\n${msg.content}\n\n`
    ).join('');
    
    const blob = new Blob([chatContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `therapy-chat-${new Date().toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const textSizeClass = {
    small: 'text-sm',
    medium: 'text-base', 
    large: 'text-lg'
  };

  return (
    <div className={`flex h-screen w-full bg-background ${textSizeClass[textSize]}`}>
      <ChatSidebar
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        sessions={sessions}
        currentSession={currentSession}
        onSessionSelect={handleSessionSelect}
        onNewSession={handleNewSession}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        textSize={textSize}
        onTextSizeChange={setTextSize}
        onExportChat={handleExportChat}
      />
      
      <div className={`flex flex-col flex-1 transition-all duration-300 ${sidebarOpen ? 'lg:ml-80' : ''}`}>
        <ChatHeader 
          onClearChat={handleClearChat} 
          onOpenSidebar={() => setSidebarOpen(true)}
        />
      
      <MessageContainer 
        messages={messages}
        isLoading={isLoading}
        isAssistantTyping={sendMessageMutation.isPending}
        textSize={textSize}
      />

      {errorMessage && (
        <div className="px-6 py-2">
          <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-4 py-3 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <i className="fas fa-exclamation-triangle text-destructive text-sm"></i>
              <span className="text-destructive text-sm">{errorMessage}</span>
            </div>
            <button 
              onClick={dismissError}
              className="text-destructive/60 hover:text-destructive"
            >
              <i className="fas fa-times text-sm"></i>
            </button>
          </div>
        </div>
      )}

        <MessageInput 
          onSendMessage={handleSendMessage}
          disabled={sendMessageMutation.isPending}
          messageCount={messages.length}
        />
      </div>
    </div>
  );
}
