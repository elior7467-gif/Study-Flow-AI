import React, { useState } from 'react';
import { TabType, UnitOverview, SolverResult, VaultProblem, CohortMetric } from './types';
import { MOCK_UNITS, INITIAL_CHAT_SOLUTIONS, MOCK_VAULT_PROBLEMS, MOCK_COHORTS } from './data/mockData';
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

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [activeTab, setActiveTab] = useState<TabType>('hub');
  const [units, setUnits] = useState<UnitOverview[]>(MOCK_UNITS);
  const [selectedUnitId, setSelectedUnitId] = useState<string>('unit-4');
  const [chatSolutions, setChatSolutions] = useState<SolverResult[]>(INITIAL_CHAT_SOLUTIONS);
  const [vaultProblems, setVaultProblems] = useState<VaultProblem[]>(MOCK_VAULT_PROBLEMS);
  const [cohorts, setCohorts] = useState<CohortMetric[]>(MOCK_COHORTS);
  const [initialChatQuery, setInitialChatQuery] = useState<string>('');
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);

  const handleNotify = (message: string, type: ToastType) => {
    const id = Math.random().toString(36).substring(7);
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 3000);
  };

  const handleAddNewSolution = (newSolution: SolverResult) => {
    setChatSolutions((prev) => [newSolution, ...prev]);
  };

  const handleClearData = () => {
    setChatSolutions([]);
    handleNotify('Chat history cleared', 'success');
  };

  const handleNavigateToChatWithQuery = (query: string) => {
    setInitialChatQuery(query);
    setActiveTab('chat');
  };

  if (!isAuthenticated) {
    return (
      <LoginView
        onLogin={() => setIsAuthenticated(true)}
        soundEnabled={soundEnabled}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-[#0F172A] font-sans flex flex-col selection:bg-[#2563EB] selection:text-white">
      <ToastContainer toasts={toasts} />
      <SettingsModal
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onClearData={handleClearData}
        onSignOut={() => setIsAuthenticated(false)}
      />

      {/* Top Bar */}
      <Header
        currentUnit={selectedUnitId}
        onSelectUnit={(unitId) => setSelectedUnitId(unitId)}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        onOpenSettings={() => setShowSettings(true)} onSignOut={() => setIsAuthenticated(false)}
      />

      {/* Main View Container with Animated View Transitions */}
      <main className="flex-1 max-w-md md:max-w-2xl lg:max-w-4xl w-full mx-auto relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 12, scale: 0.99 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.99 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="w-full"
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
                solutions={chatSolutions}
                onAddNewSolution={handleAddNewSolution}
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

            {activeTab === 'analytics' && <AnalyticsView cohorts={cohorts} soundEnabled={soundEnabled} />}
          </motion.div>
        </AnimatePresence>
      </main>

      {/* Persistent Bottom Tab Navigation */}
      <Navbar activeTab={activeTab} onTabChange={setActiveTab} soundEnabled={soundEnabled} />
    </div>
  );
}

