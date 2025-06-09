interface ChatHeaderProps {
  onClearChat: () => void;
  onOpenSidebar?: () => void;
}

export default function ChatHeader({ onClearChat, onOpenSidebar }: ChatHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between message-shadow">
      <div className="flex items-center space-x-3 animate-fade-in">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center animate-pulse-gentle">
          <svg className="w-4 h-4 text-primary-foreground" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd"/>
          </svg>
        </div>
        <div>
          <h1 className="text-lg font-light text-foreground" style={{ fontFamily: 'GT Alpina Standard, serif' }}>AI Therapy Assistant</h1>
          <p className="text-sm text-muted-foreground">Ready to help</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse-gentle"></div>
          <span className="text-xs text-muted-foreground">Connected</span>
        </div>
        
        {onOpenSidebar && (
          <button 
            onClick={onOpenSidebar}
            className="text-muted-foreground hover:text-foreground transition-smooth p-2 rounded hover:bg-secondary/20 lg:hidden"
            title="Open sidebar"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 10a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zM3 15a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
        
        <button 
          onClick={onClearChat}
          className="text-muted-foreground hover:text-foreground transition-smooth p-2 rounded hover:bg-secondary/20"
          title="Clear conversation"
        >
          <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        </button>
      </div>
    </header>
  );
}
