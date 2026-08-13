import React, { useState } from 'react';
import { TabType, UnitOverview, VaultProblem, CohortMetric, ChatMessage } from './types';
import { MOCK_UNITS, MOCK_VAULT_PROBLEMS, MOCK_COHORTS } from './data/mockData';
import { Header } from './components/Header';
import { Navbar } from './components/Navbar';
import { HubView } from './components/HubView';
import { ChatView } from './components/ChatView';
import { AnalyticsView } from './components/AnalyticsView';
import { VaultView } from './components/VaultView';
import { LoginView } from './components/LoginView';
import { SettingsModal } from './components/SettingsModal';
import { ToastContainer, ToastMessage, ToastType } from './components/Toast';
import { motion, AnimatePresence } from 'motion/react';
import { SignedIn, SignedOut, useClerk } from '@clerk/clerk-react';

export default function App() {
  const { signOut } = useClerk();
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [units] = useState<UnitOverview[]>(MOCK_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-4');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [vaultProblems] = useState<VaultProblem[]>(MOCK_VAULT_PROBLEMS);
  const [cohorts] = useState<CohortMetric[]>(MOCK_COHORTS);
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isDarkMode, setIsDarkMode] = useState<boolean>(() => {
    const saved = localStorage.getItem('studyflow_dark_mode');
    return saved === 'true';
  });

  React.useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
    localStorage.setItem('studyflow_dark_mode', isDarkMode.toString());
  }, [isDarkMode]);

  const handleNotify = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };


  const handleClearData = () => {
    setChatMessages([]);
    handleNotify('Chat history cleared', 'success');
  };

  const handleNavigateToChatWithQuery = (query: string) => {
    setInitialChatQuery(query);
    setActiveTab('chat');
  };

  return (
    <>
      <SignedIn>
        <div className="min-h-screen bg-[#F8FAFC] dark:bg-[#020617] text-[#0F172A] dark:text-[#F8FAFC] font-sans flex flex-col selection:bg-[#2563EB] selection:text-white transition-colors duration-300">
          <ToastContainer toasts={toasts} />
          <SettingsModal
            isOpen={showSettings}
            onClose={() => setShowSettings(false)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            isDarkMode={isDarkMode}
            onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
            onClearData={handleClearData}
            onSignOut={() => signOut()}
          />

          {/* Top Bar */}
          <Header
            currentUnit={selectedUnitId}
            onSelectUnit={(unitId) => setSelectedUnitId(unitId)}
            soundEnabled={soundEnabled}
            onToggleSound={() => setSoundEnabled(!soundEnabled)}
            onOpenSettings={() => setShowSettings(true)}
          />

      {/* Main View Container with Animated View Transitions */}
      <main className={`flex-1 w-full mx-auto relative overflow-hidden px-4 md:px-6 lg:px-8 ${activeTab === 'chat' ? 'max-w-[1600px]' : 'max-w-md md:max-w-2xl lg:max-w-4xl'}`}>
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full h-full"
          >
            {activeTab === 'hub' && (
              <HubView
                units={units}
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

            {activeTab === 'analytics' && <AnalyticsView cohorts={cohorts} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} soundEnabled={soundEnabled} />
    </div>
      </SignedIn>
      <SignedOut>
        <LoginView soundEnabled={soundEnabled} />
      </SignedOut>
    </>
  );
}

