import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, VolumeX, Moon, Trash2, LogOut, X } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
  onClearData: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ 
  isOpen, onClose, soundEnabled, onToggleSound, isDarkMode, onToggleDarkMode, onClearData, onSignOut 
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-neo-convex shadow-neo rounded-[32px] w-full max-w-md overflow-hidden"
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
                
                <div className="flex items-center justify-between p-3 bg-neo-convex shadow-neo-inner rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center text-neo">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-neo">Sound Effects</span>
                  </div>
                  <button 
                    onClick={() => { onToggleSound(); playSound('click', !soundEnabled); }}
                    className={`cursor-pointer w-12 h-6 rounded-full transition-all relative ${soundEnabled ? 'bg-[#2563EB] shadow-neo-inner' : 'bg-neo-convex shadow-neo-inner'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm cursor-pointer active:scale-95 transition-all ${soundEnabled ? 'bg-neo' : 'bg-neo-convex shadow-neo'}`}
                      animate={{ left: soundEnabled ? '26px' : '2px' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-neo-convex shadow-neo-inner rounded-2xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center text-neo">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-neo">Dark Mode</span>
                  </div>
                  <button 
                    onClick={() => { onToggleDarkMode(); playSound('click', soundEnabled); }}
                    className={`cursor-pointer w-12 h-6 rounded-full transition-all relative ${isDarkMode ? 'bg-[#2563EB] shadow-neo-inner' : 'bg-neo-convex shadow-neo-inner'}`}
                  >
                    <motion.div 
                      layout
                      className={`w-5 h-5 rounded-full absolute top-0.5 shadow-sm cursor-pointer active:scale-95 transition-all ${isDarkMode ? 'bg-neo' : 'bg-neo-convex shadow-neo'}`}
                      animate={{ left: isDarkMode ? '26px' : '2px' }}
                    />
                  </button>
                </div>
              </div>

              {/* Data & Account */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-neo opacity-80 uppercase tracking-widest">Data & Account</h3>
                
                <button 
                  onClick={() => { playSound('warning', soundEnabled); onClearData(); onClose(); }}
                  className="cursor-pointer w-full flex items-center justify-between p-3 bg-neo-convex shadow-neo hover:shadow-neo-sm active:shadow-neo-inner rounded-2xl transition-all text-[#F43F5E] group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-neo-convex shadow-neo flex items-center justify-center transition-all group-hover:text-white group-hover:bg-[#F43F5E]">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Clear Chat History</span>
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
