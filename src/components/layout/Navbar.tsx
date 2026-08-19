import React from 'react';
import { TabType } from '../../types';
import { Compass, MessageSquare, Archive, BarChart2, CheckCircle2, Settings, ChevronLeft, ChevronRight } from 'lucide-react';
import { m } from 'motion/react';
import { playSound } from '../../utils/sound';
import { UserButton, useUser } from '@clerk/clerk-react';

interface NavbarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  soundEnabled?: boolean;
  onOpenSettings?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
}

export const Navbar: React.FC<NavbarProps> = React.memo(({ activeTab, onTabChange, soundEnabled = true, onOpenSettings, isCollapsed, onToggleCollapse }) => {
  const { user } = useUser();
  const tabs: { id: TabType; label: string; icon: React.ReactNode }[] = [
    { id: 'hub', label: 'Hub', icon: <Compass className="w-5 h-5" /> },
    { id: 'chat', label: 'Chat', icon: <MessageSquare className="w-5 h-5" /> },
    { id: 'vault', label: 'Vault', icon: <Archive className="w-5 h-5" /> },
    { id: 'analytics', label: 'Analytics', icon: <BarChart2 className="w-5 h-5" /> },
  ];

  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-40 md:bottom-0 md:top-0 ${isCollapsed ? 'md:w-[88px]' : 'md:w-[260px]'} md:h-screen md:rounded-none bg-black/60 backdrop-blur-3xl border-t border-white/5 md:border-t-0 md:border-r py-2 px-4 md:py-6 md:px-5 premium-transition flex md:flex-col justify-between`}>
      
      {/* Top Branding (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-8 relative">
        {/* Toggle Button */}
        <button
          onClick={onToggleCollapse}
          className="absolute -right-[34px] top-2 bg-black/50 border border-white/10 rounded-full p-1.5 shadow-sm text-zinc-400 hover:text-white z-50 premium-transition hover:scale-110"
        >
          {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>

        <div className={`flex items-center gap-3 px-2 cursor-pointer group ${isCollapsed ? 'justify-center' : ''}`}>
          <m.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-10 h-10 rounded-[12px] bg-black/50 border border-white/10 flex items-center justify-center flex-shrink-0 overflow-hidden p-0.5"
          >
            <img src="/logo.jpg" alt="StudyFlow AI" className="w-full h-full object-cover rounded-[10px]" />
          </m.div>
          {!isCollapsed && (
            <div>
              <h1 className="text-base font-bold tracking-tight text-white group-hover:text-[#60A5FA] premium-transition">
                StudyFlow AI
              </h1>
              <span className="inline-flex items-center gap-1 text-[#2563EB] dark:text-[#60A5FA] text-[9px] font-bold uppercase tracking-wider opacity-80">
                <CheckCircle2 className="w-2.5 h-2.5" /> Dual-AI Active
              </span>
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div className="flex flex-col gap-2">
          {tabs.map((tab) => {
            const isActive = activeTab === tab.id;
            return (
              <m.button
                key={tab.id}
                onClick={() => {
                  playSound('click', soundEnabled);
                  onTabChange(tab.id);
                }}
                whileTap={{ scale: 0.98 }}
                className={`relative flex items-center gap-3 w-full px-4 py-3 rounded-xl premium-transition select-none group ${
                  isActive 
                    ? 'bg-white/10 text-white font-medium shadow-[inset_0_1px_1px_rgba(255,255,255,0.15)] border border-white/5' 
                    : 'hover:bg-white/5 text-zinc-400 hover:text-white'
                }`}
              >
                <div
                  className={`relative z-10 premium-transition flex items-center gap-3 w-full ${isCollapsed ? 'justify-center' : ''}`}
                >
                  <div className="flex-shrink-0">{tab.icon}</div>
                  {!isCollapsed && <span className={`text-[13px] font-semibold tracking-wide ${isActive ? 'font-bold' : ''}`}>{tab.label}</span>}
                </div>
              </m.button>
            );
          })}
        </div>
      </div>

      {/* Mobile Layout (Bottom Bar) */}
      <div className="md:hidden w-full flex items-center justify-around">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => {
                playSound('click', soundEnabled);
                onTabChange(tab.id);
              }}
              className={`flex flex-col items-center justify-center p-2 rounded-xl ${
                isActive ? 'text-white' : 'text-zinc-500'
              }`}
            >
              <div className="mb-1">{tab.icon}</div>
              <span className="text-[10px] font-semibold">{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Bottom Profile Section (Desktop Only) */}
      <div className="hidden md:flex flex-col gap-2">
        <button
          onClick={() => {
            playSound('click', soundEnabled);
            onOpenSettings?.();
          }}
          className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl hover:bg-white/5 premium-transition text-zinc-400 hover:text-white group ${isCollapsed ? 'justify-center' : ''}`}
        >
          <Settings className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="text-[13px] font-semibold tracking-wide">Settings</span>}
        </button>

        <div className={`flex items-center gap-3 w-full px-4 py-3 rounded-xl bg-black/40 border border-white/5 mt-2 group hover:border-white/10 premium-transition ${isCollapsed ? 'justify-center px-0' : ''}`}>
          <div className="flex-shrink-0">
            <UserButton afterSignOutUrl="/" appearance={{ elements: { avatarBox: "w-8 h-8 rounded-xl shadow-sm" } }} />
          </div>
          {!isCollapsed && (
            <div className="flex flex-col flex-1 min-w-0">
              <span className="text-xs font-medium text-white truncate">{user?.firstName || 'Student'}</span>
              <span className="text-[10px] text-zinc-400 truncate">{user?.primaryEmailAddress?.emailAddress || 'Pro Plan'}</span>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
});
