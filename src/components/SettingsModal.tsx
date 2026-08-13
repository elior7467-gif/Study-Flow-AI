import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Settings, Volume2, VolumeX, Moon, Trash2, LogOut, X } from 'lucide-react';
import { playSound } from '../utils/sound';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  soundEnabled: boolean;
  onToggleSound: () => void;
  onClearData: () => void;
  onSignOut: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose, soundEnabled, onToggleSound, onClearData, onSignOut }) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-[#0F172A]/40 backdrop-blur-sm flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="bg-white rounded-[32px] w-full max-w-md shadow-2xl border border-[#E2E8F0] overflow-hidden"
          >
            <div className="p-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#F8FAFC]">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
                  <Settings className="w-4 h-4" />
                </div>
                <h2 className="font-extrabold text-[#0F172A]">Settings</h2>
              </div>
              <button onClick={() => { playSound('click', soundEnabled); onClose(); }} className="cursor-pointer w-8 h-8 flex items-center justify-center bg-[#E2E8F0] rounded-full text-[#64748B] hover:text-[#0F172A] transition-colors active:scale-95 transition-all">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Preferences */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Preferences</h3>
                
                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0F172A]">
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">Sound Effects</span>
                  </div>
                  <button 
                    onClick={() => { onToggleSound(); playSound('click', !soundEnabled); }}
                    className={`cursor-pointer w-12 h-6 rounded-full transition-colors relative ${soundEnabled ? 'bg-[#2563EB]' : 'bg-[#E2E8F0]'}`}
                  >
                    <motion.div 
                      layout
                      className="w-5 h-5 bg-white rounded-full absolute top-0.5 shadow-sm cursor-pointer active:scale-95 transition-all"
                      animate={{ left: soundEnabled ? '26px' : '2px' }}
                    />
                  </button>
                </div>

                <div className="flex items-center justify-between p-3 bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] opacity-60 cursor-not-allowed">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-sm text-[#0F172A]">
                      <Moon className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold text-[#0F172A]">Dark Mode</span>
                  </div>
                  <span className="text-[10px] font-bold bg-[#E2E8F0] px-2 py-1 rounded-md text-[#64748B]">PRO</span>
                </div>
              </div>

              {/* Data & Account */}
              <div className="space-y-3">
                <h3 className="text-[10px] font-bold text-[#64748B] uppercase tracking-widest">Data & Account</h3>
                
                <button 
                  onClick={() => { playSound('warning', soundEnabled); onClearData(); onClose(); }}
                  className="cursor-pointer w-full flex items-center justify-between p-3 bg-white hover:bg-[#F43F5E]/5 rounded-2xl border border-[#E2E8F0] hover:border-[#F43F5E]/30 transition-colors text-[#F43F5E] group active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#F43F5E]/10 flex items-center justify-center group-hover:bg-[#F43F5E] group-hover:text-white transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-bold">Clear Chat History</span>
                  </div>
                </button>

                <button 
                  onClick={() => { playSound('click', soundEnabled); onSignOut(); }}
                  className="cursor-pointer w-full flex items-center justify-between p-3 bg-white hover:bg-[#F8FAFC] rounded-2xl border border-[#E2E8F0] transition-colors text-[#0F172A] group active:scale-95 transition-all"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center group-hover:bg-[#0F172A] group-hover:text-white transition-colors">
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
