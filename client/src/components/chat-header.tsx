interface ChatHeaderProps {
  onClearChat: () => void;
}

export default function ChatHeader({ onClearChat }: ChatHeaderProps) {
  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
          <i className="fas fa-robot text-white text-sm"></i>
        </div>
        <div>
          <h1 className="text-lg font-semibold text-slate-800">AI Assistant</h1>
          <p className="text-sm text-slate-500">Online</p>
        </div>
      </div>
      
      <div className="flex items-center space-x-3">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
          <span className="text-xs text-slate-500">Connected</span>
        </div>
        
        <button 
          onClick={onClearChat}
          className="text-slate-400 hover:text-slate-600 transition-colors p-2"
        >
          <i className="fas fa-trash text-sm"></i>
        </button>
      </div>
    </header>
  );
}
