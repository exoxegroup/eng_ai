import React, { useRef, useEffect } from 'react';
import { ChatMessage } from '../types';
import Message from './Message';
import ChatInput from './ChatInput';
import DashboardIcon from './icons/DashboardIcon';

interface ChatViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => void;
  isLoading: boolean;
  onShowDashboard: () => void;
  isEnding?: boolean;
}

const ChatView: React.FC<ChatViewProps> = ({ messages, onSendMessage, isLoading, onShowDashboard, isEnding }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  return (
    <div className="relative flex flex-col h-screen max-h-screen bg-slate-50">
      {isEnding && (
        <div className="absolute inset-0 bg-white/80 backdrop-blur-sm flex flex-col items-center justify-center z-50">
            <div className="text-center p-8">
                <div className="flex justify-center items-center mb-4">
                    <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                </div>
                <h2 className="text-xl font-semibold text-slate-800">Finalizing Session...</h2>
                <p className="mt-2 text-slate-600">Your session report is being generated. You will be redirected to the dashboard momentarily.</p>
            </div>
        </div>
      )}
      <header className="bg-white border-b border-slate-200 p-4 shadow-sm flex justify-between items-center">
        <div className="w-10"></div> {/* Spacer */}
        <h1 className="text-xl font-bold text-slate-800 text-center">Engineering AI Coach</h1>
        <div className="w-10">
           <button 
              onClick={onShowDashboard} 
              className="p-2 rounded-full hover:bg-slate-100 transition-colors"
              aria-label="View Dashboard"
              title="View Dashboard"
            >
             <DashboardIcon />
           </button>
        </div>
      </header>
      <main className="flex-1 overflow-y-auto p-4 md:p-6 lg:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="space-y-6">
            {messages.map((msg) => (
              <Message key={msg.id} message={msg} />
            ))}
            <div ref={messagesEndRef} />
          </div>
        </div>
      </main>
      <footer className="bg-white border-t border-slate-200 p-4">
        <div className="max-w-4xl mx-auto">
          <ChatInput onSendMessage={onSendMessage} isLoading={isLoading} />
        </div>
      </footer>
    </div>
  );
};

export default ChatView;