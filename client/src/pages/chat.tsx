import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import ChatHeader from "@/components/chat-header";
import MessageContainer from "@/components/message-container";
import MessageInput from "@/components/message-input";
import type { Message } from "@shared/schema";

export default function Chat() {
  const [sessionId] = useState(() => `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: messages = [], isLoading } = useQuery<Message[]>({
    queryKey: [`/api/messages/${sessionId}`],
    refetchInterval: false,
  });

  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      const response = await apiRequest("POST", "/api/messages", {
        content,
        role: "user",
        sessionId,
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${sessionId}`] });
      setErrorMessage(null);
    },
    onError: (error) => {
      console.error("Send message error:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to send message. Please try again.");
    },
  });

  const clearChatMutation = useMutation({
    mutationFn: async () => {
      await apiRequest("DELETE", `/api/messages/${sessionId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [`/api/messages/${sessionId}`] });
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

  return (
    <div className="flex flex-col h-screen max-w-4xl mx-auto bg-background border border-border">
      <ChatHeader onClearChat={handleClearChat} />
      
      <MessageContainer 
        messages={messages}
        isLoading={isLoading}
        isAssistantTyping={sendMessageMutation.isPending}
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
  );
}
