import React, { useState, useEffect, useRef } from 'react';
import { ChatMessage, ChatSession } from '../types';
import { Bot, User, Send, RefreshCw, Copy, Check, MessageSquare, Plus, Menu, X } from 'lucide-react';
import { playSound } from '../utils/sound';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import 'katex/dist/katex.min.css';
import { useUser } from '@clerk/clerk-react';

import { ToastType } from './Toast';

interface ChatViewProps {
  messages: ChatMessage[];
  setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>>;
  initialQuery?: string;
  soundEnabled?: boolean;
  onNotify: (msg: string, type: ToastType) => void;
}

export const ChatView: React.FC<ChatViewProps> = ({
  messages,
  setMessages,
  initialQuery = '',
  soundEnabled = true,
  onNotify,
}) => {
  const { user } = useUser();
  const userId = user?.id;

  const [userPrompt, setUserPrompt] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (initialQuery) setUserPrompt(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Load chat sessions on mount
  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;
      try {
        const res = await fetch(`/api/db/chats/user/${userId}`);
        if (res.ok) {
          const data = await res.json();
          setChats(data);
        }
      } catch (err) {
        console.error('Failed to fetch chats:', err);
      }
    };
    fetchChats();
  }, [userId]);

  // Load messages when active chat changes
  useEffect(() => {
    const fetchMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }
      try {
        const res = await fetch(`/api/db/chats/${activeChatId}/messages`);
        if (res.ok) {
          const data = await res.json();
          setMessages(data);
        }
      } catch (err) {
        console.error('Failed to fetch messages:', err);
      }
    };
    fetchMessages();
  }, [activeChatId, setMessages]);

  const presetQueries = [
    {
      label: '1. Basic Question',
      text: 'A car of mass 1500 kg drives at 20 m/s on a flat circular turn of radius 50 m with μ_s = 0.6. Will it skid?',
    },
    {
      label: '2. Misconception Trap',
      text: 'A block of 5 kg rests on a rough table with μ_s = 0.4. A horizontal force of 10 N is applied. Is static friction equal to 19.6 N?',
    },
  ];

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || userPrompt;
    if (!queryToUse.trim() || loading || !userId) return;

    playSound('click', soundEnabled);
    setLoading(true);
    setUserPrompt(''); 

    let currentChatId = activeChatId;

    // Create new chat if none is active
    if (!currentChatId) {
      try {
        const title = queryToUse.length > 30 ? queryToUse.substring(0, 30) + '...' : queryToUse;
        const res = await fetch('/api/db/chats', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId, title }),
        });
        if (res.ok) {
          const newChat = await res.json();
          setChats(prev => [newChat, ...prev]);
          currentChatId = newChat.id;
          setActiveChatId(currentChatId);
        }
      } catch (err) {
        console.error('Failed to create chat:', err);
      }
    }

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: queryToUse };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    try {
      const response = await fetch('/api/chat-stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, content: m.content })),
          chatId: currentChatId
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI server');
      }

      if (!response.body) throw new Error('ReadableStream not supported');

      const reader = response.body.getReader();
      const decoder = new TextDecoder('utf-8');
      
      const assistantMessageId = (Date.now() + 1).toString();
      let assistantContent = '';
      
      setMessages(prev => [...prev, { id: assistantMessageId, role: 'assistant', content: '' }]);

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        
        const chunkStr = decoder.decode(value, { stream: true });
        const lines = chunkStr.split('\n');
        
        for (const line of lines) {
          if (line.startsWith('data: ') && !line.includes('[DONE]')) {
            try {
              const data = JSON.parse(line.substring(6));
              if (data.error) throw new Error(data.error);
              if (data.content) {
                assistantContent += data.content;
                setMessages(prev => prev.map(msg => 
                  msg.id === assistantMessageId ? { ...msg, content: assistantContent } : msg
                ));
              }
            } catch (err) {
              console.error('Error parsing SSE chunk:', err, line);
            }
          }
        }
      }
      
      playSound('success', soundEnabled);
    } catch (err) {
      console.error('Error streaming chat:', err);
      onNotify(err.message || "Failed to connect to AI server", "warning");
      playSound('warning', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  const CopyButton = ({ text }: { text: string }) => {
    const [copied, setCopied] = useState(false);
    return (
      <button
        onClick={() => {
          navigator.clipboard.writeText(text);
          setCopied(true);
          setTimeout(() => setCopied(false), 2000);
        }}
        className="absolute top-2 right-2 bg-[#F1F5F9] dark:bg-[#1E293B] hover:bg-[#E2E8F0] dark:hover:bg-[#334155] text-[#0F172A] dark:text-[#F8FAFC] p-1.5 rounded-lg border border-[#E2E8F0] dark:border-[#334155] transition-colors z-10"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> : <Copy className="w-3.5 h-3.5 text-[#64748B] dark:text-[#94A3B8]" />}
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-white dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] shadow-sm relative transition-colors duration-300">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white dark:bg-[#0F172A] rounded-lg shadow-md border border-[#E2E8F0] dark:border-[#1E293B]"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" /> : <Menu className="w-5 h-5 text-[#0F172A] dark:text-[#F8FAFC]" />}
      </button>

      {/* Sidebar for Chat History */}
      <div className={`
        absolute md:static inset-y-0 left-0 z-40 w-64 bg-[#F8FAFC] dark:bg-[#0F172A] border-r border-[#E2E8F0] dark:border-[#1E293B] flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-[#E2E8F0] dark:border-[#1E293B]">
          <button 
            onClick={() => {
              setActiveChatId(null);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-[#0F172A] dark:bg-[#1E293B] hover:bg-[#2563EB] dark:hover:bg-[#2563EB] text-white py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:scale-95"
          >
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#E2E8F0] dark:scrollbar-thumb-[#1E293B] p-3 space-y-1">
          {chats.map(chat => (
            <button
              key={chat.id}
              onClick={() => {
                setActiveChatId(chat.id);
                setSidebarOpen(false);
              }}
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-colors text-sm ${
                activeChatId === chat.id 
                  ? 'bg-[#E2E8F0] dark:bg-[#1E293B] text-[#0F172A] dark:text-[#F8FAFC] font-bold' 
                  : 'text-[#64748B] dark:text-[#94A3B8] hover:bg-[#F1F5F9] dark:hover:bg-[#020617]'
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-[#2563EB] dark:text-[#60A5FA]' : 'text-[#94A3B8] dark:text-[#64748B]'}`} />
              <span className="truncate">{chat.title}</span>
            </button>
          ))}
          {chats.length === 0 && (
            <div className="text-center text-xs font-medium text-[#94A3B8] p-4">
              No chat history yet
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-white dark:bg-[#020617] relative">
        {/* Scrollable Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 px-4 md:px-8 scrollbar-thin scrollbar-thumb-[#E2E8F0] dark:scrollbar-thumb-[#1E293B] scrollbar-track-transparent pt-16 md:pt-6 pb-4"
        >
          {messages.length === 0 && (
            <div className="flex justify-start items-start gap-2 mb-6">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%] shadow-sm">
                <p className="text-xs font-medium text-[#0F172A] dark:text-[#F8FAFC]">
                  Hi! I'm the <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">StudyFlow AI</span>. 
                  Ask me any academic question and I'll explain it step-by-step.
                </p>
              </div>
            </div>
          )}

          {messages.map((msg) => (
            <div key={msg.id} className="space-y-6">
              {msg.role === 'user' ? (
                <div className="flex justify-end items-end gap-2">
                  <div className="bg-[#0F172A] dark:bg-[#1E293B] text-white rounded-2xl rounded-br-none px-4 py-3 max-w-[85%] shadow-sm">
                    <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-[#E2E8F0] dark:bg-[#0F172A] border border-transparent dark:border-[#1E293B] flex items-center justify-center text-[#64748B] dark:text-[#94A3B8] flex-shrink-0 shadow-sm mb-1">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-[100%] md:max-w-[85%] w-full relative">
                    <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl rounded-tl-none px-5 py-4 shadow-sm text-xs md:text-sm text-[#0F172A] dark:text-[#F8FAFC] leading-relaxed prose prose-sm max-w-none prose-p:leading-relaxed prose-pre:bg-[#151E2E] prose-pre:text-[#F8FAFC] dark:prose-invert">
                      <CopyButton text={msg.content} />
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[rehypeKatex]}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-2xl rounded-bl-none px-4 py-4 max-w-[85%] shadow-sm flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '300ms' }} />
                 <span className="text-[10px] text-[#64748B] dark:text-[#94A3B8] font-bold ml-2 uppercase tracking-widest">Thinking...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Container */}
        <div className="px-4 md:px-8 pt-2 pb-4">
          <div className="bg-white dark:bg-[#0F172A] border border-[#E2E8F0] dark:border-[#1E293B] rounded-[24px] p-3 shadow-md space-y-2">
            {/* Demo Preset Chips - only show on empty chat */}
            {!activeChatId && messages.length === 0 && (
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
                {presetQueries.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleSubmit(undefined, preset.text)}
                    className="cursor-pointer text-[10px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1 bg-[#2563EB]/15 dark:bg-[#2563EB]/20 text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/25 dark:hover:bg-[#2563EB]/30 border border-[#2563EB]/30 dark:border-[#2563EB]/40"
                  >
                    {preset.label}
                  </button>
                ))}
              </div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Message AI..."
                className="flex-1 bg-[#F8FAFC] dark:bg-[#020617] border border-[#E2E8F0] dark:border-[#1E293B] rounded-xl px-4 py-3 text-xs md:text-sm text-[#0F172A] dark:text-[#F8FAFC] focus:outline-none focus:border-[#2563EB] dark:focus:border-[#60A5FA] focus:ring-4 focus:ring-[#2563EB]/10 dark:focus:ring-[#60A5FA]/10 placeholder-[#94A3B8]"
                disabled={loading}
              />

              <button
                type="submit"
                disabled={loading || !userPrompt.trim()}
                className="cursor-pointer bg-[#0F172A] dark:bg-[#1E293B] text-white text-xs font-bold w-12 h-12 rounded-xl hover:bg-[#2563EB] dark:hover:bg-[#2563EB] transition-colors flex items-center justify-center disabled:opacity-50 flex-shrink-0 active:scale-95 transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-5 h-5" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 z-30 bg-[#0F172A]/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
