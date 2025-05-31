interface ChatHeaderProps {
  onClearChat: () => void;
}

export default function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <header className="bg-background border-b border-border px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center">
          <i className="fas fa-robot text-primary-foreground text-sm"></i>
        </div>
        <div>
          <h1 className="text-lg font-light text-foreground" style={{ fontFamily: 'GT Alpina Standard, serif' }}>AI Therapy Assistant</h1>
          <p className="text-sm text-muted-foreground">Online</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-muted-foreground">Connected</span>
        </div>
        
        <button 
          onClick={onClearChat}
          className="text-muted-foreground hover:text-foreground transition-colors p-2"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>
    </header>
  );
}
