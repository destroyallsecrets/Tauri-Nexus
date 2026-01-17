import React, { useState, useEffect, useRef } from 'react';
import { Send, Bot, User, RefreshCw } from 'lucide-react';
import { Message } from '../types';
import { geminiService } from '../services/geminiService';

const ChatArea: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'init',
      role: 'model',
      content: "Welcome to Tauri Nexus. I am ready to assist with your Rust, TypeScript, and Tauri architecture questions.",
      timestamp: Date.now()
    }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: Date.now()
    };

    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsLoading(true);

    const modelMsgId = (Date.now() + 1).toString();
    const modelMsg: Message = {
      id: modelMsgId,
      role: 'model',
      content: '',
      timestamp: Date.now(),
      isStreaming: true
    };

    setMessages(prev => [...prev, modelMsg]);

    try {
      const stream = geminiService.streamChat(messages, userMsg.content);
      
      let fullContent = '';
      
      for await (const chunk of stream) {
        fullContent += chunk;
        setMessages(prev => prev.map(m => 
          m.id === modelMsgId ? { ...m, content: fullContent } : m
        ));
      }
      
      setMessages(prev => prev.map(m => 
        m.id === modelMsgId ? { ...m, isStreaming: false } : m
      ));

    } catch (error) {
      console.error("Chat error", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  // Basic formatting helper to highlight code blocks roughly
  const renderContent = (text: string) => {
    const parts = text.split(/(```[\s\S]*?```)/g);
    return parts.map((part, index) => {
      if (part.startsWith('```')) {
        const content = part.replace(/```[a-z]*\n?/, '').replace(/```$/, '');
        return (
          <div key={index} className="bg-gray-900 rounded-md p-3 my-2 overflow-x-auto border border-tauri-card font-mono text-sm text-gray-300">
             <pre>{content}</pre>
          </div>
        );
      }
      // Simple bold/code parsing
      const subParts = part.split(/(`[^`]+`)/g);
      return (
        <span key={index}>
          {subParts.map((sub, subIndex) => {
            if (sub.startsWith('`') && sub.endsWith('`')) {
              return <code key={subIndex} className="bg-gray-800 text-tauri-accent px-1 rounded text-sm">{sub.slice(1, -1)}</code>;
            }
            return sub;
          })}
        </span>
      );
    });
  };

  return (
    <div className="flex flex-col h-full bg-tauri-dark">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg) => (
          <div 
            key={msg.id} 
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div 
              className={`max-w-[85%] rounded-2xl p-4 shadow-lg ${
                msg.role === 'user' 
                  ? 'bg-tauri-blue text-gray-900 rounded-tr-none' 
                  : 'bg-tauri-card border border-gray-800 text-gray-100 rounded-tl-none'
              }`}
            >
              <div className="flex items-center gap-2 mb-2 opacity-75 text-xs font-semibold uppercase tracking-wider">
                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                {msg.role === 'user' ? 'You' : 'Nexus AI'}
              </div>
              <div className="whitespace-pre-wrap leading-relaxed text-sm md:text-base">
                {renderContent(msg.content)}
                {msg.isStreaming && <span className="inline-block w-2 h-4 ml-1 bg-tauri-accent animate-pulse"/>}
              </div>
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="p-4 bg-tauri-card border-t border-gray-800">
        <div className="relative max-w-4xl mx-auto flex items-end gap-2 bg-gray-900 rounded-xl border border-gray-700 p-2 focus-within:border-tauri-blue transition-colors">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about Tauri, Rust commands, or config..."
            className="w-full bg-transparent text-gray-200 placeholder-gray-500 p-2 max-h-32 min-h-[44px] outline-none resize-none font-sans"
            rows={1}
            style={{ height: 'auto' }}
          />
          <button
            onClick={handleSend}
            disabled={isLoading || !input.trim()}
            className="p-2 mb-1 rounded-lg bg-tauri-blue text-gray-900 hover:bg-cyan-400 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            {isLoading ? <RefreshCw className="animate-spin" size={20} /> : <Send size={20} />}
          </button>
        </div>
        <p className="text-center text-gray-600 text-xs mt-2">
          Gemini can make mistakes. Verify critical code in the official Tauri docs.
        </p>
      </div>
    </div>
  );
};

export default ChatArea;
