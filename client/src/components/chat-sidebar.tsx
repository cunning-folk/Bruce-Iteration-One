import { useState } from "react";

interface ChatSidebarProps {
  isOpen: boolean;
  onClose: () => void;
  sessions: string[];
  currentSession: string;
  onSessionSelect: (sessionId: string) => void;
  onNewSession: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  textSize: 'small' | 'medium' | 'large';
  onTextSizeChange: (size: 'small' | 'medium' | 'large') => void;
  onExportChat: () => void;
}

export default function ChatSidebar({
  isOpen,
  onClose,
  sessions,
  currentSession,
  onSessionSelect,
  onNewSession,
  searchQuery,
  onSearchChange,
  textSize,
  onTextSizeChange,
  onExportChat
}: ChatSidebarProps) {
  const [activeTab, setActiveTab] = useState<'sessions' | 'settings'>('sessions');

  const textSizeLabels = {
    small: 'Small',
    medium: 'Medium',
    large: 'Large'
  };

  return (
    <>
      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      
      {/* Sidebar */}
      <div className={`fixed left-0 top-0 h-full w-80 bg-background border-r border-border z-50 transform transition-transform duration-300 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-medium" style={{ fontFamily: 'GT Alpina Standard, serif' }}>
            Chat History
          </h2>
          <button
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground transition-smooth p-1 rounded"
          >
            <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-border">
          <button
            onClick={() => setActiveTab('sessions')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'sessions' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Sessions
          </button>
          <button
            onClick={() => setActiveTab('settings')}
            className={`flex-1 py-3 px-4 text-sm font-medium transition-colors ${
              activeTab === 'settings' 
                ? 'text-primary border-b-2 border-primary bg-primary/5' 
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Settings
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {activeTab === 'sessions' ? (
            <div className="space-y-4">
              {/* Search */}
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => onSearchChange(e.target.value)}
                  placeholder="Search conversations..."
                  className="w-full px-3 py-2 pl-9 bg-background border border-input rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-sm"
                />
                <svg className="absolute left-3 top-2.5 w-4 h-4 text-muted-foreground" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd"/>
                </svg>
              </div>

              {/* New Session Button */}
              <button
                onClick={onNewSession}
                className="w-full flex items-center space-x-3 p-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-lg transition-smooth"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd"/>
                </svg>
                <span>New Conversation</span>
              </button>

              {/* Session List */}
              <div className="space-y-2">
                {sessions.length === 0 ? (
                  <p className="text-muted-foreground text-sm text-center py-8">
                    No previous conversations
                  </p>
                ) : (
                  sessions.map((session) => (
                    <button
                      key={session}
                      onClick={() => onSessionSelect(session)}
                      className={`w-full text-left p-3 rounded-lg transition-smooth ${
                        session === currentSession
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-secondary/50'
                      }`}
                    >
                      <div className="text-sm font-medium truncate">
                        Session {session.split('_')[1]?.slice(0, 8)}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        {new Date(parseInt(session.split('_')[1])).toLocaleDateString()}
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Text Size Control */}
              <div>
                <label className="block text-sm font-medium mb-3">Text Size</label>
                <div className="space-y-2">
                  {(['small', 'medium', 'large'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => onTextSizeChange(size)}
                      className={`w-full text-left p-3 rounded-lg transition-smooth ${
                        textSize === size
                          ? 'bg-primary/10 border border-primary/20'
                          : 'hover:bg-secondary/50 border border-transparent'
                      }`}
                    >
                      <div className={`${
                        size === 'small' ? 'text-sm' : 
                        size === 'medium' ? 'text-base' : 'text-lg'
                      }`}>
                        {textSizeLabels[size]} Text
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Export Chat */}
              <div>
                <label className="block text-sm font-medium mb-3">Export</label>
                <button
                  onClick={onExportChat}
                  className="w-full flex items-center space-x-3 p-3 bg-secondary hover:bg-secondary/80 text-secondary-foreground rounded-lg transition-smooth"
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M3 17a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1v-2zM3 4a1 1 0 011-1h12a1 1 0 011 1v8a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm8 4a1 1 0 10-2 0v1.586l-.293-.293a1 1 0 10-1.414 1.414l2 2a1 1 0 001.414 0l2-2a1 1 0 00-1.414-1.414L11 9.586V8z" clipRule="evenodd"/>
                  </svg>
                  <span>Download Conversation</span>
                </button>
              </div>

              {/* App Info */}
              <div className="pt-4 border-t border-border">
                <div className="text-xs text-muted-foreground">
                  <p>AI Therapy Assistant</p>
                  <p>Private & Secure</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}