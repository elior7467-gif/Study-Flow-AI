import React, { useState, useEffect, useRef, useCallback } from 'react';
import { m, AnimatePresence } from 'motion/react';

import { Bot, User, Send, RefreshCw, Copy, Check, MessageSquare, Plus, Menu, X, Sparkles, Trash2, Edit2, Pin, PinOff, Search, Mic, MicOff, Camera, Languages, Square } from 'lucide-react';
import { playSound } from '../utils/sound';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { ChatMessageItem } from '../components/chat/ChatMessageItem';
import { ToastType } from '../components/common/Toast';
import { useUser, useAuth } from '@clerk/clerk-react';
import { parsePartialSolverJSON } from '../utils/partialJson';
import { useSpeechRecognition } from '../hooks/useSpeechRecognition';
import { ChatMessage, ChatSession } from '../types';
import 'katex/dist/katex.min.css';

export interface ChatViewProps {
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
  soundEnabled: propSoundEnabled = true,
  onNotify,
}) => {
  const { user } = useUser();
  const { getToken } = useAuth();
  const userId = user?.id;

  const [userPrompt, setUserPrompt] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);
  const [language, setLanguage] = useState(localStorage.getItem('preferred_language') || 'en');
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isManualSwitch = useRef<boolean>(true);
  const [soundEnabled, setSoundEnabled] = useState(propSoundEnabled);
  
  const [chatSearchQuery, setChatSearchQuery] = useState('');
  const [editingChatId, setEditingChatId] = useState<string | null>(null);
  const [editChatTitle, setEditChatTitle] = useState('');
  
  const handleTogglePin = useCallback(async (messageId: string, currentPinStatus?: boolean) => {
    const newStatus = !currentPinStatus;
    setMessages(prev => prev.map(m => m.id === messageId ? { ...m, is_pinned: newStatus } : m));
    
    try {
      const token = await getToken({ template: 'supabase' });
      await fetch(`/api/db/messages/${messageId}/pin`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({ is_pinned: newStatus })
      });
    } catch (e) {
      console.error("Failed to pin message", e);
      onNotify("Failed to pin message", "warning");
    }
  }, [setMessages, getToken, onNotify]);

  const handleRenameChat = async (chatId: string) => {
    if (!editChatTitle.trim()) {
      setEditingChatId(null);
      return;
    }
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, title: editChatTitle } : c));
    setEditingChatId(null);
    try {
      const token = await getToken({ template: 'supabase' });
      await fetch(`/api/db/chats/${chatId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title: editChatTitle })
      });
    } catch (e) {
      console.error('Failed to rename chat:', e);
    }
  };

  const handleToggleChatPin = async (chatId: string, currentPinStatus?: boolean) => {
    const newStatus = !currentPinStatus;
    setChats(prev => prev.map(c => c.id === chatId ? { ...c, is_pinned: newStatus } : c));
    try {
      const token = await getToken({ template: 'supabase' });
      await fetch(`/api/db/chats/${chatId}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ is_pinned: newStatus })
      });
    } catch (e) {
      console.error('Failed to pin chat:', e);
    }
  };

  const handleDeleteChat = async (chatId: string) => {
    setChats(prev => prev.filter(c => c.id !== chatId));
    if (activeChatId === chatId) {
      isManualSwitch.current = true;
      setActiveChatId(null);
      setMessages([]);
    }
    try {
      const token = await getToken({ template: 'supabase' });
      await fetch(`/api/db/chats/${chatId}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` }
      });
    } catch (e) {
      console.error('Failed to delete chat:', e);
    }
  };

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);

  const { isListening, isSupported, toggleListening } = useSpeechRecognition((transcript) => {
    setUserPrompt((prev) => prev + (prev ? ' ' : '') + transcript);
  });

  useEffect(() => {
    try {
      const savedLang = localStorage.getItem('preferred_language');
      if (savedLang) setLanguage(savedLang);
    } catch (e) {}
  }, []);

  useEffect(() => {
    if (initialQuery) setUserPrompt(initialQuery);
  }, [initialQuery]);

  useEffect(() => {
    const handleClear = () => {
      setChats([]);
      setActiveChatId(null);
      setMessages([]);
    };
    window.addEventListener('clear-chat-history', handleClear);
    return () => window.removeEventListener('clear-chat-history', handleClear);
  }, [setChats, setActiveChatId, setMessages]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  // Auto-focus input when loading finishes
  useEffect(() => {
    if (!loading && inputRef.current) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 10);
    }
  }, [loading]);

  // Load chat sessions on mount
  useEffect(() => {
    const fetchChats = async () => {
      if (!userId) return;
      try {
        const token = await getToken({ template: 'supabase' });
        const res = await fetch(`/api/db/chats/user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
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
    let ignore = false;

    if (!isManualSwitch.current) {
      // Chat was just created automatically by sending a message, do not wipe our local state or abort stream!
      return;
    }

    // Abort any ongoing stream if user switches chat manually
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    const fetchMessages = async () => {
      if (!activeChatId) {
        setMessages([]);
        return;
      }
      
      try {
        const token = await getToken({ template: 'supabase' });
        const res = await fetch(`/api/db/chats/${activeChatId}/messages`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          if (!ignore) setMessages(data);
        } else {
          if (!ignore) onNotify("Failed to fetch messages", "warning");
        }
      } catch (err) {
        if (!ignore) {
          console.error('Failed to fetch messages:', err);
          onNotify("Network error fetching messages", "warning");
        }
      }
    };
    fetchMessages();

    return () => { ignore = true; };
  }, [activeChatId, setMessages, getToken, onNotify]);

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

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    playSound('click', soundEnabled);
    setIsProcessingImage(true);
    
    // Simulate OCR processing for demo
    setTimeout(() => {
      setIsProcessingImage(false);
      setUserPrompt("A block of mass m = 2kg is sliding down a frictionless inclined plane at an angle of 30 degrees. Calculate the acceleration of the block.");
      onNotify?.("Image scanned and text extracted successfully!", "success");
    }, 1500);
  };

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
        const token = await getToken({ template: 'supabase' });
        const res = await fetch('/api/db/chats', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({ userId, title }),
        });
        if (res.ok) {
          const newChat = await res.json();
          setChats(prev => [newChat, ...prev]);
          currentChatId = newChat.id;
          isManualSwitch.current = false;
          setActiveChatId(currentChatId);
        }
      } catch (err) {
        console.error('Failed to create chat:', err);
      }
    }

    const userMessage: ChatMessage = { id: Date.now().toString(), role: 'user', content: queryToUse };
    const newMessages = [...messages, userMessage];
    setMessages(newMessages);

    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    abortControllerRef.current = new AbortController();

    try {
      const token = await getToken({ template: 'supabase' });
      const response = await fetch('/api/solver-critic?stream=true', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json', 
          'Accept': 'text/event-stream',
          'Authorization': `Bearer ${token}`
        },
        signal: abortControllerRef.current.signal,
        body: JSON.stringify({
          query: queryToUse,
          subject: 'NCERT Class 11 Physics',
          chatId: currentChatId,
          userId: userId,
          language,
          messages: newMessages
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to connect to AI server');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No stream available');
      
      const decoder = new TextDecoder('utf-8');
      const assistantMessageId = (Date.now() + 1).toString();
      let buffer = '';
      let accumulatedConversationText = '';
      let accumulatedSolverText = '';
      let hasSeenCorrection = false;

      while (true) {
        const { value, done } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const parts = buffer.split('\n\n');
        
        for (let i = 0; i < parts.length - 1; i++) {
          const eventText = parts[i];
          const lines = eventText.split('\n');
          let currentEvent = 'message';
          let dataStr = '';
          
          for (const line of lines) {
            if (line.startsWith('event:')) currentEvent = line.slice(6).trim();
            else if (line.startsWith('data:')) dataStr = line.slice(5).trim();
          }

          if (dataStr && dataStr !== '[DONE]') {
            try {
              const parsed = JSON.parse(dataStr);
              if (currentEvent === 'solver_draft') {
                parsed.criticAuditStatus = 'VERIFYING';
                setMessages(prev => {
                  const exists = prev.some(m => m.id === assistantMessageId);
                  if (exists) return prev.map(m => m.id === assistantMessageId ? { ...m, content: JSON.stringify(parsed) } : m);
                  return [...prev, { id: assistantMessageId, role: 'assistant', content: JSON.stringify(parsed) }];
                });
              } else if (currentEvent === 'critic_verdict') {
                setMessages(prev => {
                  const exists = prev.some(m => m.id === assistantMessageId);
                  if (exists) return prev.map(m => m.id === assistantMessageId ? { ...m, content: JSON.stringify(parsed) } : m);
                  return [...prev, { id: assistantMessageId, role: 'assistant', content: JSON.stringify(parsed) }];
                });
              } else if (currentEvent === 'solver_chunk') {
                if (parsed.isCorrection && !hasSeenCorrection) {
                  accumulatedSolverText = '';
                  hasSeenCorrection = true;
                }
                accumulatedSolverText += parsed.content;
                
                // Parse the partial JSON for real-time streaming UI
                const partialJson = parsePartialSolverJSON(accumulatedSolverText);
                partialJson.criticAuditStatus = 'STREAMING'; // Indicates it's still being typed

                const newContent = JSON.stringify(partialJson);
                
                setMessages(prev => {
                  const exists = prev.some(m => m.id === assistantMessageId);
                  if (exists) return prev.map(m => m.id === assistantMessageId ? { ...m, content: newContent } : m);
                  return [...prev, { id: assistantMessageId, role: 'assistant', content: newContent }];
                });
              } else if (currentEvent === 'conversation_chunk') {
                accumulatedConversationText += parsed.content;
                const newContent = JSON.stringify({ isConversation: true, content: accumulatedConversationText });
                setMessages(prev => {
                  const exists = prev.some(m => m.id === assistantMessageId);
                  if (exists) return prev.map(m => m.id === assistantMessageId ? { ...m, content: newContent } : m);
                  return [...prev, { id: assistantMessageId, role: 'assistant', content: newContent }];
                });
              } else if (currentEvent === 'error') {
                throw new Error(parsed.error);
              }
            } catch (e) {
              console.error("Error parsing stream data:", e);
            }
          }
        }
        buffer = parts[parts.length - 1];
      }
      
      playSound('success', soundEnabled);
    } catch (err: any) {
      if (err.name === 'AbortError' || err.message?.includes('abort')) {
        console.log('Stream aborted.');
        return;
      }
      console.error('Error streaming chat:', err);
      onNotify(err.message || "Failed to connect to AI server", "warning");
      playSound('warning', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  const handleStop = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    setLoading(false);
    onNotify("Generation stopped.", "info");
  };

  const handleEditMessage = (msgId: string, newContent: string) => {
    // Find the index of the message being edited
    const index = messages.findIndex(m => m.id === msgId);
    if (index === -1) return;
    
    // Slice messages up to the edited message (excluding it, as we will submit it as a new prompt)
    const newMessages = messages.slice(0, index);
    setMessages(newMessages);
    
    // Set the prompt and submit
    setUserPrompt(newContent);
    // Use setTimeout to ensure state updates before submission
    setTimeout(() => {
      // Simulate form submission
      if (inputRef.current) {
        const form = inputRef.current.closest('form');
        if (form) {
          form.dispatchEvent(new Event('submit', { cancelable: true, bubbles: true }));
        }
      }
    }, 100);
  };
  return (
    <div className="flex h-full w-full overflow-hidden relative transition-all duration-300">
      
      {/* Mobile Sidebar Toggle */}
      <button 
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="md:hidden absolute top-4 left-4 z-50 p-2 bg-white dark:bg-[#18181B] border border-black/10 dark:border-white/10 shadow-sm rounded-lg transition-all"
      >
        {sidebarOpen ? <X className="w-5 h-5 text-zinc-900 dark:text-zinc-50" /> : <Menu className="w-5 h-5 text-zinc-900 dark:text-zinc-50" />}
      </button>

      {/* Sidebar for Chat History */}
      <div className={`
        absolute md:static inset-y-0 left-0 z-40 w-64 bg-black/40 backdrop-blur-2xl border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl
        ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="p-4 border-b border-white/5 space-y-4">
          <button 
            onClick={() => {
              isManualSwitch.current = true;
              setActiveChatId(null);
              setSidebarOpen(false);
            }}
            className="w-full flex items-center justify-center gap-2 bg-white/5 border border-white/10 shadow-lg text-white py-2.5 px-4 rounded-xl text-sm font-bold hover:bg-white/10 active:scale-95 premium-transition"
          >
            <Plus className="w-4 h-4" />
            New Thread
          </button>
          
          {/* Chat Search */}
          <div className="relative group">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-zinc-500 group-focus-within:text-[#60A5FA] premium-transition" />
            <input 
              type="text"
              placeholder="Search history..."
              value={chatSearchQuery}
              onChange={(e) => setChatSearchQuery(e.target.value)}
              className="w-full bg-black/40 border border-white/10 text-white text-xs rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:border-[#60A5FA]/50 focus:ring-1 focus:ring-[#60A5FA]/50 placeholder:opacity-50 premium-transition"
            />
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#E2E8F0] dark:scrollbar-thumb-[#1E293B] p-3 space-y-1">
          {chats
            .filter(c => c.title.toLowerCase().includes(chatSearchQuery.toLowerCase()))
            .sort((a, b) => {
              if (a.is_pinned && !b.is_pinned) return -1;
              if (!a.is_pinned && b.is_pinned) return 1;
              return new Date(b.created_at || 0).getTime() - new Date(a.created_at || 0).getTime();
            })
            .map(chat => (
            <div
              key={chat.id}
              className={`group w-full flex items-center justify-between gap-2 px-3 py-2.5 rounded-xl premium-transition text-sm cursor-pointer ${
                activeChatId === chat.id 
                  ? 'bg-white/10 font-bold text-white shadow-inner' 
                  : 'text-zinc-400 hover:bg-white/5 hover:text-white'
              }`}
            >
              {editingChatId === chat.id ? (
                <input
                  type="text"
                  value={editChatTitle}
                  onChange={(e) => setEditChatTitle(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleRenameChat(chat.id)}
                  autoFocus
                  onBlur={() => handleRenameChat(chat.id)}
                  className="bg-transparent border-b border-black/20 dark:border-white/20 text-xs focus:outline-none flex-1 truncate py-1"
                />
              ) : (
                <button
                  onClick={() => {
                    isManualSwitch.current = true;
                    setActiveChatId(chat.id);
                    setSidebarOpen(false);
                  }}
                  className="flex items-center gap-3 flex-1 text-left truncate min-w-0"
                >
                  <MessageSquare className={`w-4 h-4 flex-shrink-0 ${activeChatId === chat.id ? 'text-[#60A5FA]' : 'text-zinc-500'}`} />
                  <span className="truncate">{chat.title}</span>
                  {chat.is_pinned && <Pin className="w-3 h-3 flex-shrink-0 text-amber-400" />}
                </button>
              )}
              
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                <button 
                  onClick={(e) => { e.stopPropagation(); handleToggleChatPin(chat.id, chat.is_pinned); }}
                  className={`p-1 rounded-md hover:bg-black/5 dark:hover:bg-white/5 ${chat.is_pinned ? 'text-amber-500 opacity-100' : 'text-zinc-900 dark:text-zinc-50 opacity-60 hover:opacity-100'}`}
                  title={chat.is_pinned ? "Unpin Chat" : "Pin Chat"}
                >
                  {chat.is_pinned ? <PinOff className="w-3.5 h-3.5" /> : <Pin className="w-3.5 h-3.5" />}
                </button>
                {editingChatId !== chat.id && (
                  <button 
                    onClick={(e) => { e.stopPropagation(); setEditChatTitle(chat.title); setEditingChatId(chat.id); }}
                    className="p-1 hover:bg-black/5 dark:hover:bg-white/5 rounded-md text-zinc-900 dark:text-zinc-50 opacity-60 hover:opacity-100"
                    title="Rename"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                )}
                <button 
                  onClick={(e) => { e.stopPropagation(); handleDeleteChat(chat.id); }}
                  className="p-1 hover:bg-red-500/10 rounded-md text-red-500 opacity-60 hover:opacity-100"
                  title="Delete"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
          {chats.length === 0 && !chatSearchQuery && (
            <div className="text-center text-xs font-medium text-[#94A3B8] p-4">
              No chat history yet
            </div>
          )}
          {chats.length > 0 && chatSearchQuery && chats.filter(c => c.title.toLowerCase().includes(chatSearchQuery.toLowerCase())).length === 0 && (
            <div className="text-center text-xs font-medium text-[#94A3B8] p-4">
              No results found
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full bg-transparent relative">
        {/* Scrollable Chat History */}
        <div 
          ref={scrollRef}
          className="flex-1 overflow-y-auto space-y-8 px-4 md:px-8 scrollbar-thin scrollbar-thumb-white/10 scrollbar-track-transparent pt-16 md:pt-10 pb-12"
        >
          <AnimatePresence mode="popLayout">
          {messages.length === 0 && (
            <m.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ type: "spring", stiffness: 200, damping: 20 }}
              className="flex justify-start items-start gap-3 mb-6"
            >
              <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/20 border border-[#2563EB]/30 flex items-center justify-center text-[#60A5FA] flex-shrink-0 mt-1 shadow-lg">
                <Bot className="w-5 h-5" />
              </div>
              <div className="bg-black/60 backdrop-blur-xl border border-white/10 rounded-[2rem] rounded-tl-sm px-6 py-5 max-w-[85%] shadow-2xl">
                <p className="text-sm text-zinc-300 leading-relaxed font-medium">
                  Hi! I'm the <span className="font-bold text-white tracking-wide">StudyFlow AI</span>. 
                  Ask me any academic question and I'll explain it step-by-step.
                </p>
              </div>
            </m.div>
          )}

          {messages.map((msg, i) => (
            <ChatMessageItem 
              key={msg.id}
              msg={msg}
              onTogglePin={handleTogglePin}
              userId={userId}
              activeChatId={activeChatId}
              onNotify={onNotify}
              onEditMessage={handleEditMessage}
            />
          ))}

          {loading && messages.length > 0 && messages[messages.length - 1].role === 'user' && (
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 rounded-full border border-black/10 dark:border-white/10 flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA] flex-shrink-0 mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-[#FAFAFA] dark:bg-[#18181B] border border-black/5 dark:border-white/5 shadow-sm rounded-2xl rounded-tl-sm px-4 py-4 max-w-[85%] flex items-center gap-2">
                 <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '0ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '150ms' }} />
                 <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-bounce" style={{ animationDelay: '300ms' }} />
                 <span className="text-[11px] text-zinc-900 dark:text-zinc-50 opacity-70 font-medium ml-2 tracking-wide">Processing...</span>
              </div>
            </div>
          )}
          </AnimatePresence>
        </div>

        {/* Input Container */}
        <div className="px-4 md:px-8 pt-4 pb-24 md:pb-8 w-full max-w-5xl mx-auto">
          <div className="ethereal-card-shell p-1.5">
            <div className="ethereal-card-core !p-2 !bg-black/80 space-y-3">
            {/* Demo Preset Chips - only show on empty chat */}
            {!activeChatId && messages.length === 0 && (
              <m.div 
                initial="hidden"
                animate="visible"
                variants={{
                  visible: { transition: { staggerChildren: 0.1 } },
                  hidden: {}
                }}
                className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1"
              >
                {presetQueries.map((preset, idx) => (
                  <m.button
                    variants={{
                      hidden: { opacity: 0, y: 10, scale: 0.9 },
                      visible: { opacity: 1, y: 0, scale: 1 }
                    }}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    key={idx}
                    type="button"
                    onClick={() => {
                      playSound('click', soundEnabled);
                      handleSubmit(undefined, preset.text);
                    }}
                    className="flex items-center gap-2 px-4 py-2 bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10 rounded-xl text-xs font-bold text-zinc-300 hover:text-white transition-all flex-shrink-0 cursor-pointer"
                  >
                    {preset.label}
                  </m.button>
                ))}
              </m.div>
            )}

            <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-1 relative">
              <select
                value={language}
                onChange={(e) => {
                  const newLang = e.target.value;
                  setLanguage(newLang);
                  try { localStorage.setItem('preferred_language', newLang); } catch (err) {}
                }}
                className="bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl px-3 py-3 mx-2 text-xs font-bold tracking-widest uppercase text-white focus:outline-none cursor-pointer flex-shrink-0 premium-transition"
              >
                <option value="en" className="bg-[#09090b] text-white">ENG</option>
                <option value="bn" className="bg-[#09090b] text-white">BEN</option>
                <option value="hi" className="bg-[#09090b] text-white">HIN</option>
              </select>
              <textarea
                ref={inputRef as any}
                value={userPrompt}
                onChange={(e) => {
                  setUserPrompt(e.target.value);
                  e.target.style.height = 'auto';
                  e.target.style.height = `${Math.min(e.target.scrollHeight, 150)}px`;
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    if (!loading && (userPrompt.trim() || isListening)) {
                      handleSubmit(e);
                    }
                  }
                }}
                placeholder="Message AI... (Shift+Enter for new line)"
                className="flex-1 bg-transparent px-4 py-3 text-base text-white focus:outline-none placeholder:text-zinc-500 resize-none overflow-y-auto scrollbar-thin scrollbar-thumb-white/10 font-medium"
                style={{ minHeight: '48px', maxHeight: '150px' }}
                rows={1}
                disabled={loading}
              />
              
              <AnimatePresence>
                {userPrompt.trim() && !isListening && (
                  <m.div
                    initial={{ opacity: 0, scale: 0.5, x: 10 }}
                    animate={{ opacity: 1, scale: 1, x: 0 }}
                    exit={{ opacity: 0, scale: 0.5, x: 10 }}
                    className="absolute right-[115px] top-1/2 -translate-y-1/2 pointer-events-none"
                  >
                    <div className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-[#60A5FA] animate-ping opacity-75" />
                  </m.div>
                )}
              </AnimatePresence>
              
              <input 
                type="file" 
                ref={fileInputRef} 
                accept="image/*" 
                className="hidden" 
                onChange={handleImageUpload} 
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isProcessingImage}
                className="cursor-pointer text-zinc-400 hover:text-white hover:bg-white/10 w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 premium-transition self-end mb-0.5"
              >
                {isProcessingImage ? (
                  <RefreshCw className="w-5 h-5 animate-spin text-[#60A5FA]" />
                ) : (
                  <Camera className="w-5 h-5" />
                )}
              </button>

              {isSupported && (
                <button
                  type="button"
                  onClick={toggleListening}
                  className={`cursor-pointer w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 premium-transition relative self-end mb-0.5 mr-1 ${isListening ? 'text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/30' : 'text-zinc-400 hover:text-white hover:bg-white/10'}`}
                >
                  {isListening ? (
                    <MicOff className="w-5 h-5" />
                  ) : (
                    <Mic className="w-5 h-5" />
                  )}
                  {isListening && (
                    <span className="absolute w-2.5 h-2.5 bg-[#F43F5E] rounded-full animate-ping right-1 top-1" />
                  )}
                </button>
              )}

              {loading ? (
                <button
                  type="button"
                  onClick={handleStop}
                  className="cursor-pointer bg-[#F43F5E] hover:bg-[#E11D48] text-white w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 premium-transition self-end mb-0 shadow-lg"
                  title="Stop generating"
                >
                  <Square className="w-5 h-5 fill-current" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={!userPrompt.trim() && !isListening}
                  className="group cursor-pointer bg-white text-black disabled:opacity-30 disabled:cursor-not-allowed hover:bg-zinc-200 w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 premium-transition self-end mb-0 shadow-[0_0_20px_rgba(255,255,255,0.15)] disabled:shadow-none"
                >
                  <Send className="w-5 h-5 ml-0.5 group-hover:translate-x-1 group-hover:-translate-y-1 premium-transition" />
                </button>
              )}
            </form>
          </div>
        </div>
      </div>
      
      {/* Overlay for mobile sidebar */}
      {sidebarOpen && (
        <div 
          className="md:hidden absolute inset-0 z-30 bg-[#09090b]/20 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
};
