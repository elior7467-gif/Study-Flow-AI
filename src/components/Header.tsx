import React, { useState } from 'react';
import { ShieldCheck, Sparkles, BookOpen, CheckCircle2, Zap, Info, TrendingUp, Cpu, Volume2, VolumeX, Settings } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';
import { UserButton } from '@clerk/clerk-react';

interface HeaderProps {
  currentUnit: string;
  onSelectUnit: (unitId: string) => void;
  soundEnabled?: boolean;
  onToggleSound?: () => void;
  onOpenSettings?: () => void;
  onSignOut?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ soundEnabled = true, onToggleSound, onOpenSettings, onSignOut }) => {
  const [showProfile, setShowProfile] = useState(false);
  const [showInvestorDeck, setShowInvestorDeck] = useState(false);

  return (
    <header className="sticky top-0 z-30 bg-neo px-4 py-2.5 transition-colors duration-300">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Icon & Branding */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95, boxShadow: "var(--shadow-in)" }}
            className="w-9 h-9 rounded-xl bg-neo-convex shadow-neo flex items-center justify-center text-[#2563EB] dark:text-[#60A5FA] flex-shrink-0 cursor-pointer transition-shadow"
          >
            <ShieldCheck className="w-5 h-5" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-neo">
                StudyFlow AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-neo-convex shadow-neo-inner text-[#2563EB] dark:text-[#60A5FA] text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Dual-AI Engine Active
              </span>
            </div>
            <p className="text-[11px] text-neo opacity-80 font-medium hidden xs:block">
              Zero-Hallucination Physics Assistant for JEE & NEET
            </p>
          </div>
        </div>

        {/* Live System Telemetry & Investor Deck Modal Trigger */}
        <div className="flex items-center gap-2">

          <motion.button
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.03 }}
            onClick={() => {
              playSound('click', soundEnabled);
              setShowInvestorDeck(true);
            }}
            className="hidden md:flex items-center gap-1.5 bg-neo-convex shadow-neo text-neo hover:shadow-neo-sm text-xs font-bold px-3 py-1.5 rounded-xl transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>SaaS Vision</span>
          </motion.button>
          
          {/* Settings Button */}
          <button
            onClick={() => {
              playSound('click', soundEnabled);
              onOpenSettings?.();
            }}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-neo-convex shadow-neo text-neo hover:shadow-neo-sm active:shadow-neo-inner transition-all ml-2"
          >
            <Settings className="w-4 h-4" />
          </button>

          {/* User Profile Button */}
          <div className="relative flex items-center justify-center bg-neo-convex shadow-neo rounded-xl w-9 h-9 p-0.5 ml-1 transition-all cursor-pointer hover:shadow-neo-sm">
            <UserButton afterSignOutUrl="/" />
          </div>
        </div>
      </div>

      {/* Silicon Valley Investor Pitch & Product Moat Modal */}
      <AnimatePresence>
        {showInvestorDeck && (
          <div className="fixed inset-0 z-50 bg-[var(--neo-text)]/20 backdrop-blur-sm flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-neo-convex shadow-neo rounded-[28px] max-w-lg w-full p-6 space-y-5 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-neo">
                      StudyFlow AI • Silicon Valley SaaS Thesis
                    </h3>
                    <p className="text-[11px] text-neo opacity-80">Target Market: $4B Test Prep Market in South Asia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvestorDeck(false)}
                  className="text-neo opacity-80 hover:text-neo text-xs font-bold bg-neo px-2.5 py-1 rounded-lg cursor-pointer active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-neo leading-relaxed">
                <div className="bg-neo-convex shadow-neo p-3 rounded-2xl space-y-1">
                  <span className="font-extrabold text-[#F43F5E] uppercase tracking-wider block">
                    The Problem: Expensive AI Hallucinations
                  </span>
                  <p className="text-neo opacity-80">
                    Standard LLMs answer fast and sound confident even when wrong. In competitive exams (JEE/NEET), losing 4 marks shifts a student's college rank by thousands.
                  </p>
                </div>

                <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 p-3 rounded-2xl space-y-1">
                  <span className="font-extrabold text-[#2563EB] uppercase tracking-wider block">
                    The Product Moat: Honest Dual-AI Fact-Checker
                  </span>
                  <p className="text-neo font-medium">
                    We run a two-pass architecture: Solver AI derives from NCERT text, while Critic AI line-audits every step. If even 1 step is unbacked, we output a clear <span className="font-bold text-[#F43F5E]">"Do Not Trust / Ask Teacher"</span> warning.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-neo p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-neo">3.2M+</span>
                    <span className="text-[10px] text-neo opacity-80">Annual Aspirants</span>
                  </div>
                  <div className="bg-neo p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-[#2563EB]">0%</span>
                    <span className="text-[10px] text-neo opacity-80">Hallucination Risk</span>
                  </div>
                  <div className="bg-neo p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-neo">100%</span>
                    <span className="text-[10px] text-neo opacity-80">NCERT Source Match</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowInvestorDeck(false)}
                  className="bg-neo-convex shadow-neo hover:shadow-neo-sm text-neo font-bold text-xs px-4 py-2 rounded-xl transition-all cursor-pointer active:scale-95"
                >
                  Close Executive Summary
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </header>
  );
};



