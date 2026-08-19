import React, { useState, Suspense, lazy } from 'react';
import { TabType, UnitOverview, VaultProblem, CohortMetric, ChatMessage } from './types';
import { MOCK_UNITS, MOCK_VAULT_PROBLEMS, MOCK_COHORTS } from './data/mockData';
import { Header } from './components/layout/Header';
import { Navbar } from './components/layout/Navbar';

const HubView = lazy(() => import('./views/HubView').then(module => ({ default: module.HubView })));
const ChatView = lazy(() => import('./views/ChatView').then(module => ({ default: module.ChatView })));
const AnalyticsView = lazy(() => import('./views/AnalyticsView').then(module => ({ default: module.AnalyticsView })));
const VaultView = lazy(() => import('./views/VaultView').then(module => ({ default: module.VaultView })));
import { LoginView } from './views/LoginView';
import { SettingsModal } from './components/settings/SettingsModal';
import { ToastContainer, ToastMessage, ToastType } from './components/common/Toast';
import { m, AnimatePresence, LazyMotion, domAnimation } from 'motion/react';
import { SignedIn, SignedOut, useClerk, useAuth } from '@clerk/clerk-react';

export default function App() {
  const { signOut } = useClerk();
  const { userId, getToken } = useAuth();
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-active');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [vaultProblems] = useState<VaultProblem[]>(MOCK_VAULT_PROBLEMS);
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    try {
      const saved = localStorage.getItem('studyflow_dark_mode');
      return saved !== 'false'; // Defaults to true if nothing is saved
    } catch {
      return true;
    }
  });
  const [isTeacherMode, setIsTeacherMode] = useState<boolean>(() => {
    try {
      return localStorage.getItem('studyflow_teacher_mode') === 'true';
    } catch {
      return false;
    }
  });

  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState<boolean>(() => {
    try { return localStorage.getItem('studyflow_sidebar_collapsed') === 'true'; } catch { return false; }
  });

  const toggleSidebar = () => {
    const newVal = !isSidebarCollapsed;
    setIsSidebarCollapsed(newVal);
    try { localStorage.setItem('studyflow_sidebar_collapsed', String(newVal)); } catch (e) {}
  };

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    try {
      localStorage.setItem('studyflow_dark_mode', isDarkMode.toString());
    } catch (e) {
      // Ignore
    }
  }, [isDarkMode]);

  const handleNotify = React.useCallback((message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  }, []);

  const handleClearData = async () => {
    if (!userId) return;
    
    try {
      const token = await getToken({ template: 'supabase' });
      
      const response = await fetch(`/api/db/chats/user/${userId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete chats');
      }
      
      setChatMessages([]);
      window.dispatchEvent(new Event('clear-chat-history'));
      handleNotify('Chat history cleared', 'success');
    } catch (error) {
      console.error('Error clearing chats:', error);
      handleNotify('Some chats could not be cleared', 'warning');
    }
  };

  const handleNavigateToChatWithQuery = (query: string) => {
    setInitialChatQuery(query);
    setActiveTab('chat');
  };

  return (
    <LazyMotion features={domAnimation}>
      <div className="flex flex-col min-h-[100dvh] w-full bg-slate-50 dark:bg-mesh-dark text-slate-900 dark:text-zinc-50 transition-colors duration-700 relative selection:bg-[#2563EB]/30">
      <ToastContainer toasts={toasts} />
      <SignedIn>
        <div className={`flex flex-col h-full w-full transition-all duration-300 ${isSidebarCollapsed ? 'md:pl-[88px]' : 'md:pl-[260px]'}`}>
          <Header 
            currentUnit={selectedUnitId}
            onSelectUnit={(unitId) => setSelectedUnitId(unitId)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenSettings={() => setShowSettings(true)}
          />

          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            isTeacherMode={isTeacherMode}
            onToggleTeacherMode={() => {
              const newVal = !isTeacherMode;
              setIsTeacherMode(newVal);
              try { localStorage.setItem('studyflow_teacher_mode', String(newVal)); } catch (e) {}
            }}
            onClearData={handleClearData}
            onSignOut={() => signOut()}
          />

      {/* Main View Container with Animated View Transitions */}
      <main className={`flex-1 w-full mx-auto relative overflow-x-hidden ${activeTab === 'chat' ? 'px-0 max-w-none overflow-y-hidden' : 'px-4 md:px-6 lg:px-8 max-w-[1600px] overflow-y-auto'}`}>
        <AnimatePresence mode="wait">
          <m.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`w-full ${activeTab === 'chat' ? 'h-full' : 'min-h-full pb-32 md:pb-12'}`}
          >
            <Suspense fallback={<div className="flex h-full w-full items-center justify-center"><div className="w-8 h-8 rounded-full border-4 border-t-[#2563EB] border-black/10 dark:border-white/10 animate-spin" /></div>}>
              {activeTab === 'hub' && (
                <HubView
                  selectedUnitId={selectedUnitId}
                  onSelectUnit={setSelectedUnitId}
                  onNavigateToChatWithQuery={handleNavigateToChatWithQuery}
                  soundEnabled={soundEnabled}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'chat' && (
                <ChatView
                  messages={chatMessages}
                  setMessages={setChatMessages}
                  initialQuery={initialChatQuery}
                  soundEnabled={soundEnabled}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'vault' && (
                <VaultView 
                  problems={vaultProblems} 
                  onSelectProblem={(prob) => console.log('Selected problem:', prob.id)}
                  soundEnabled={soundEnabled}
                  onNotify={handleNotify}
                />
              )}

              {activeTab === 'analytics' && <AnalyticsView onNotify={handleNotify} isTeacherMode={isTeacherMode} />}
            </Suspense>
          </m.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navbar 
        activeTab={activeTab} 
        onTabChange={setActiveTab} 
        soundEnabled={soundEnabled} 
        onOpenSettings={() => setShowSettings(true)}
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={toggleSidebar}
      />
    </div>
      </SignedIn>
      <SignedOut>
        <LoginView 
          soundEnabled={soundEnabled} 
          isDarkMode={isDarkMode} 
          onToggleDarkMode={() => setIsDarkMode(!isDarkMode)} 
        />
      </SignedOut>
    </div>
    </LazyMotion>
  );
}

