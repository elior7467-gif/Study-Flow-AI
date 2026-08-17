import React from 'react';
import { TabType } from '../types';
import { Compass, MessageSquare, Archive, BarChart2 } from 'lucide-react';
import { m } from 'motion/react';
import { playSound } from '../utils/sound';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  soundEnabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ activeTab, onTabChange, soundEnabled = true }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hub', label: 'Hub', icon: <Compass className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'vault', label: 'Vault', icon: <Archive className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:bottom-0 md:top-0 md:w-24 md:h-screen md:rounded-none md:border-r md:border-black/5 dark:md:border-white/5 md:bg-neo md:shadow-none bg-neo-convex shadow-neo py-2 px-4 md:py-8 md:px-2 transition-all duration-300">
      <div className="max-w-md md:max-w-none md:h-full mx-auto flex items-center justify-around md:flex-col md:justify-start md:gap-6">
        {/* Desktop Logo Space Placeholder */}
        <div className="hidden md:block w-10 h-10 mb-4" />

        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <m.button
              key={tab.id}
              onClick={() => {
                playSound('click', soundEnabled);
                onTabChange(tab.id);
              }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              id={`nav-tab-${tab.id}`}
              className={`relative flex flex-col items-center justify-center transition-colors select-none md:w-20 md:py-3 ${
                isActive ? 'md:bg-neo-convex md:shadow-neo-inner md:rounded-2xl' : ''
              } px-5 py-2 rounded-2xl`}
            >
              {isActive && (
                <m.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-neo-convex shadow-neo-inner rounded-2xl md:hidden"
                  transition={{ type: 'spring', stiffness: 450, damping: 35 }}
                />
              )}
              <div
                className={`relative z-10 transition-colors ${isActive ? 'text-[#2563EB] dark:text-[#60A5FA] font-bold' : 'text-neo opacity-80 hover:text-neo dark:hover:text-[#F8FAFC]'
                  }`}
              >
                <div className="mb-0.5 flex justify-center">{tab.icon}</div>
                <span className="text-[11px] tracking-tight block font-semibold">{tab.label}</span>
              </div>
            </m.button>
          );
        })}
      </div>
    </nav>
  );
});
