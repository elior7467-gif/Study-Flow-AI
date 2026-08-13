import React from 'react';
import { TabType } from '../types';
import { Compass, MessageSquare, Archive, BarChart2 } from 'lucide-react';
import { motion } from 'motion/react';
import { playSound } from '../utils/sound';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  soundEnabled?: boolean;
}

export const Navbar: React.FC<NavbarProps> = ({ activeTab, onTabChange, soundEnabled = true }) => {
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hub', label: 'Hub', icon: <Compass className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'vault', label: 'Vault', icon: <Archive className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 md:bottom-6 md:left-1/2 md:-translate-x-1/2 md:w-[90%] md:max-w-md md:rounded-[32px] bg-neo-convex shadow-neo py-2 px-4 transition-all duration-300">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <motion.button
              key={tab.id}
              onClick={() => {
                playSound('click', soundEnabled);
                onTabChange(tab.id);
              }}
              whileTap={{ scale: 0.92 }}
              whileHover={{ scale: 1.05 }}
              id={`nav-tab-${tab.id}`}
              className="relative flex flex-col items-center justify-center px-5 py-2 rounded-2xl transition-colors select-none"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabPill"
                  className="absolute inset-0 bg-neo-convex shadow-neo-inner rounded-2xl"
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
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
};

