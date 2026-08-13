import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChatMessage, ChatSession } from '../types';
import { Bot, User, Send, RefreshCw, Copy, Check, MessageSquare, Plus, Menu, X, Sparkles } from 'lucide-react';
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
        className="absolute top-2 right-2 bg-neo shadow-neo hover:shadow-neo-sm active:shadow-neo-inner p-1.5 rounded-lg transition-all z-10"
      >
        {copied ? <Check className="w-3.5 h-3.5 text-[#2563EB] dark:text-[#60A5FA]" /> : <Copy className="w-3.5 h-3.5 text-neo" />}
      </button>
    );
  };

  // Pre-process AI markdown to fix common LaTeX formatting issues before rendering
  const preprocessMath = (content: string) => {
    if (!content) return '';
    let processed = content;
    // Fix block math wrappers
    processed = processed.replace(/\\\[/g, '$$').replace(/\\\]/g, '$$');
    // Fix inline math wrappers
    processed = processed.replace(/\\\(/g, '$').replace(/\\\)/g, '$');
    
    // Some LLMs output \end{aligned} without \begin{aligned}, causing KaTeX to crash the entire block
    // If we find \end{aligned} but no \begin{aligned} in the same block, KaTeX will fail.
    // A simple fix is to just strip stray \end{aligned} or inject \begin{aligned} but that's complex.
    // However, the updated system prompt usually prevents this.
    // We will just pad block math with newlines so remark-math parses it properly as a block
    // and doesn't swallow the rest of the text.
    processed = processed.replace(/\$\$/g, (match, offset, string) => {
      // If it's already on its own line (roughly), leave it
      return '$$'; 
    });

    return processed;
  };

  return (
    <div className="flex h-[calc(100vh-140px)] w-full overflow-hidden bg-neo shadow-neo rounded-[24px] relative transition-all duration-300">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-neo shadow-neo rounded-lg active:shadow-neo-inner transition-all"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-neo" /> : <Menu className="w-5 h-5 text-neo" />}
      </button>

      {/* Sidebar for Chat History */}
      <div className={`
        absolute md:static inset-y-0 left-0 z-40 w-64 bg-neo shadow-neo-sm flex flex-col transition-transform duration-300 ease-in-out
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-black/5 dark:border-white/5">
          <button 
            onClick={() => {
              setActiveChatId(null);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-neo shadow-neo text-neo py-2.5 px-4 rounded-xl text-sm font-bold transition-all active:shadow-neo-inner hover:shadow-neo-sm"
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
              className={`w-full flex items-center gap-2 px-3 py-2.5 rounded-xl text-left transition-all text-sm ${
                activeChatId === chat.id 
                  ? 'bg-neo shadow-neo-inner font-bold text-neo' 
                  : 'text-neo opacity-80 hover:shadow-neo-sm'
              }`}
            >
              <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-[#2563EB] dark:text-[#60A5FA]' : 'text-neo opacity-70'}`} />
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
      <div className="flex-1 flex flex-col h-full bg-neo relative">
        {/* Scrollable Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-6 px-4 md:px-8 scrollbar-thin scrollbar-thumb-black/10 dark:scrollbar-thumb-white/10 scrollbar-track-transparent pt-16 md:pt-6 pb-4"
        >
          <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex justify-start items-start gap-2 mb-6"
            >
              <div className="w-8 h-8 rounded-full bg-neo shadow-neo flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neo shadow-neo rounded-2xl rounded-tl-none px-4 py-3 max-w-[85%]">
                <p className="text-xs font-medium text-neo">
                  Hi! I'm the <span className="font-bold text-[#2563EB] dark:text-[#60A5FA]">StudyFlow AI</span>. 
                  Ask me any academic question and I'll explain it step-by-step.
                </p>
              </div>
            </motion.div>
          )}

          {messages.map((msg, i) => (
            <motion.div 
              key={msg.id} 
              initial={{ opacity: 0, y: 15, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 0.3, ease: "easeOut" }}
              className="space-y-6"
            >
              {msg.role === 'user' ? (
                <div className="flex justify-end items-end gap-2">
                  <div className="bg-neo shadow-neo-inner text-neo rounded-2xl rounded-br-none px-4 py-3 max-w-[85%]">
                    <p className="text-xs font-medium leading-relaxed">{msg.content}</p>
                  </div>
                  <div className="w-8 h-8 rounded-full bg-neo shadow-neo-sm flex items-center justify-center text-neo flex-shrink-0 mb-1">
                    <User className="w-4 h-4" />
                  </div>
                </div>
              ) : (
                <div className="flex justify-start items-start gap-2">
                  <div className="w-8 h-8 rounded-full bg-neo shadow-neo-sm flex items-center justify-center text-[#2563EB] flex-shrink-0 mt-1">
                    <Bot className="w-4 h-4" />
                  </div>
                  <div className="max-w-[100%] md:max-w-[85%] w-full relative">
                    <div className="bg-neo shadow-neo rounded-2xl rounded-tl-none px-5 py-4 text-xs md:text-sm text-neo leading-relaxed prose prose-sm max-w-none prose-p:leading-relaxed overflow-x-auto">
                      <CopyButton text={msg.content} />
                      <ReactMarkdown 
                        remarkPlugins={[remarkGfm, remarkMath]}
                        rehypePlugins={[[rehypeKatex, { strict: false }]]}
                      >
                        {preprocessMath(msg.content)}
                      </ReactMarkdown>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-end gap-2">
              <div className="w-8 h-8 rounded-full bg-neo shadow-neo-sm flex items-center justify-center text-[#2563EB] flex-shrink-0 mb-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-neo shadow-neo rounded-2xl rounded-bl-none px-4 py-4 max-w-[85%] flex items-center gap-2">
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-2 h-2 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '300ms' }} />
                 <span className="text-[10px] text-neo opacity-70 font-bold ml-2 uppercase tracking-widest">Thinking...</span>
              </div>
            </div>
          )}
          </AnimatePresence>
        </div>

        {/* Input Container */}
        <div className="px-4 md:px-8 pt-2 pb-4">
          <div className="bg-neo shadow-neo rounded-[24px] p-3 space-y-2">
            {/* Demo Preset Chips - only show on empty chat */}
            {!activeChatId && messages.length === 0 && (
              <motion.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {}
                }}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1"
              >
                {presetQueries.map((preset, idx) => (
                  <motion.button
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={idx}
                    type="button"
                    onClick={() => handleSubmit(undefined, preset.text)}
                    className="cursor-pointer text-[10px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1 bg-[#2563EB]/10 dark:bg-[#2563EB]/15 text-[#2563EB] dark:text-[#60A5FA] hover:bg-[#2563EB]/20 dark:hover:bg-[#2563EB]/25 border border-[#2563EB]/20 dark:border-[#2563EB]/30"
                  >
                    {preset.label}
                  </motion.button>
                ))}
              </motion.div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2 relative">
              <input
                type="text"
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                placeholder="Message AI..."
                className="flex-1 bg-neo shadow-neo-inner rounded-xl px-4 py-3 text-xs md:text-sm text-neo focus:outline-none placeholder-neo/50"
                disabled={loading}
              />
              
              <AnimatePresence>
                {userPrompt.trim() && (
                  <motion.div
                    initial={{ opacity: 0, scale: 0.5, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: 10 }}
                    className="absolute right-[62px] top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-ping opacity-75" />
                  </motion.div>
                )}
              </AnimatePresence>

              <button
                type="submit"
                disabled={loading || !userPrompt.trim()}
                className="cursor-pointer bg-neo shadow-neo text-[#2563EB] dark:text-[#60A5FA] text-xs font-bold w-12 h-12 rounded-xl active:shadow-neo-inner flex items-center justify-center disabled:opacity-50 flex-shrink-0 transition-all"
              >
                {loading ? (
                  <RefreshCw className="w-5 h-5 animate-spin relative z-10" />
                ) : (
                  <Send className="w-5 h-5 relative z-10" />
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
