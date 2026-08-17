import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, VolumeX, Moon, Trash2, LogOut, X, Loader2, GraduationCap } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  isTeacherMode: boolean;
  onToggleTeacherMode: () => void;
  onClearData: () => Promise<void>;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, soundEnabled, onToggleSound, isDarkMode, onToggleDarkMode, isTeacherMode, onToggleTeacherMode, onClearData, onSignOut 
}) => {
  const [isClearing, setIsClearing] = useState(false);

  return (
    <AnimatePresence>
      {isOpen && (
        <div 
          className="fixed inset-0 z-[60] bg-[var(--neo-text)]/20 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-neo-convex shadow-neo rounded-[32px] w-full max-w-md overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-5 flex items-center justify-between bg-neo-convex shadow-neo-sm mb-1">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-neo-convex shadow-neo text-[#2563EB] flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-neo">Settings</h2>
              </div>
              <button onClick={() => { playSound('click', soundEnabled); onClose(); }} className="cursor-pointer w-8 h-8 flex items-center justify-center bg-neo-convex shadow-neo hover:shadow-neo-sm active:shadow-neo-inner rounded-full text-neo transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-neo opacity-80 uppercase tracking-widest">Preferences</h3>
                
                <button 
                  onClick={() => { onToggleSound(); playSound('click', !soundEnabled); }}
                  className="w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo-inner rounded-2xl cursor-pointer hover:shadow-neo transition-all"
                  type="button"
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center text-neo">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-neo">Sound Effects</span>
                  </div>
                  <div 
                    className={`pointer-events-none w-12 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-[#2563EB] shadow-neo-inner' : 'bg-black/10 dark:bg-white/10 shadow-inner'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all bg-white dark:bg-slate-200`}
                      animate={{ left: soundEnabled ? '26px' : '2px' }}
                    />
                  </div>
                </button>

                <button 
                  onClick={() => { onToggleDarkMode(); playSound('click', soundEnabled); }}
                  className="w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo-inner rounded-2xl cursor-pointer hover:shadow-neo transition-all"
                  type="button"
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center text-neo">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-neo">Dark Mode</span>
                  </div>
                  <div 
                    className={`pointer-events-none w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-[#2563EB] shadow-neo-inner' : 'bg-black/10 dark:bg-white/10 shadow-inner'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all bg-white dark:bg-slate-200`}
                      animate={{ left: isDarkMode ? '26px' : '2px' }}
                    />
                  </div>
                </button>

                <button 
                  onClick={() => { onToggleTeacherMode(); playSound('click', soundEnabled); }}
                  className="w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo-inner rounded-2xl cursor-pointer hover:shadow-neo transition-all"
                  type="button"
                >
                  <div className="flex items-center gap-3 pointer-events-none">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center text-neo">
                      <GraduationCap className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-neo">Teacher Dashboard Mode</span>
                  </div>
                  <div 
                    className={`pointer-events-none w-12 h-6 rounded-full transition-all relative ${isTeacherMode ? 'bg-[#2563EB] shadow-neo-inner' : 'bg-black/10 dark:bg-white/10 shadow-inner'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm transition-all bg-white dark:bg-slate-200`}
                      animate={{ left: isTeacherMode ? '26px' : '2px' }}
                    />
                  </div>
                </button>
              </div>

              {/* Data & Account */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-neo opacity-80 uppercase tracking-widest">Data & Account</h3>
                
                <button 
                  onClick={async () => { 
                    if (isClearing) return;
                    playSound('warning', soundEnabled); 
                    setIsClearing(true);
                    try {
                      await onClearData();
                      onClose();
                    } finally {
                      setIsClearing(false);
                    }
                  }}
                  disabled={isClearing}
                  className="cursor-pointer w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo hover:shadow-neo-sm active:shadow-neo-inner rounded-2xl transition-all text-[#F43F5E] group disabled:opacity-50"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center transition-all group-hover:text-white group-hover:bg-[#F43F5E]">
                      {isClearing ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold">{isClearing ? 'Clearing...' : 'Clear Chat History'}</span>
                  </div>
                </button>

                <button 
                  onClick={() => { playSound('click', soundEnabled); onSignOut(); }}
                  className="cursor-pointer w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo hover:shadow-neo-sm active:shadow-neo-inner rounded-2xl transition-all text-neo group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center transition-all">
                      <LogOut className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Sign Out</span>
                  </div>
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
