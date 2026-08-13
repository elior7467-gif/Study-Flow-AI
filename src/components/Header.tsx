import React, { useState } from 'react';
import { ShieldCheck, User, Sparkles, BookOpen, CheckCircle2, Zap, Info, TrendingUp, Cpu, Volume2, VolumeX } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';

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
    <header className="sticky top-0 z-30 bg-[#F8FAFC]/95 backdrop-blur-md border-b border-[#E2E8F0] px-4 py-2.5">
      <div className="max-w-md md:max-w-2xl lg:max-w-4xl mx-auto flex items-center justify-between">
        {/* Left Icon & Branding */}
        <div className="flex items-center gap-2.5">
          <motion.div
            whileHover={{ scale: 1.08, rotate: 3 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-xl bg-[#2563EB] flex items-center justify-center text-white shadow-xs flex-shrink-0 cursor-pointer"
          >
            <ShieldCheck className="w-5 h-5 text-white" />
          </motion.div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base md:text-lg font-extrabold tracking-tight text-[#0F172A]">
                StudyFlow AI
              </h1>
              <span className="hidden sm:inline-flex items-center gap-1 bg-[#2563EB]/15 text-[#2563EB] border border-[#2563EB]/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
                <CheckCircle2 className="w-3 h-3" /> Dual-AI Engine Active
              </span>
            </div>
            <p className="text-[11px] text-[#64748B] font-medium hidden xs:block">
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
            className="hidden md:flex items-center gap-1.5 bg-[#0F172A] text-white hover:bg-[#1E293B] text-xs font-bold px-3 py-1.5 rounded-xl transition-colors shadow-xs"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" />
            <span>SaaS Vision</span>
          </motion.button>

          {/* User Profile Button */}
          <div className="relative">
            <motion.button
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playSound('click', soundEnabled);
                setShowProfile(!showProfile);
              }}
              id="profile-button"
              className="w-9 h-9 rounded-xl bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#0F172A] hover:bg-[#E2E8F0] transition-colors overflow-hidden"
              title="Aspirant Profile & Demo Info"
            >
              <User className="w-4 h-4 text-[#2563EB]" />
            </motion.button>

            {/* Profile Dropdown / Modal */}
            <AnimatePresence>
              {showProfile && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95, y: -10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: -10 }}
                  transition={{ duration: 0.15 }}
                  className="absolute right-0 mt-2 w-72 bg-white rounded-2xl border border-[#E2E8F0] shadow-lg p-4 z-50 text-sm"
                >
                  <div className="flex items-center gap-3 pb-3 border-b border-[#E2E8F0]">
                    <div className="w-10 h-10 rounded-xl bg-[#0F172A] text-white flex items-center justify-center font-bold text-sm">
                      JEE
                    </div>
                    <div>
                      <div className="font-bold text-[#0F172A]">Aarav Sharma</div>
                      <div className="text-xs text-[#64748B]">JEE Main & Advanced 2026</div>
                    </div>
                  </div>

                  <div className="py-3 space-y-2 text-xs">
                    <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-2.5 rounded-xl space-y-1">
                      <span className="font-bold text-[#0F172A] block">Dual-AI Guarantee</span>
                      <p className="text-[11px] text-[#64748B] leading-relaxed">
                        1st AI derives step-by-step. 2nd AI (Critic) fact-checks against NCERT textbook text line-by-line.
                      </p>
                    </div>
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>Current Chapter</span>
                      <span className="font-semibold text-[#0F172A]">Laws of Motion</span>
                    </div>
                    <div className="flex items-center justify-between text-[#64748B]">
                      <span>Target Exam</span>
                      <span className="font-semibold text-[#2563EB] bg-[#2563EB]/15 px-2 py-0.5 rounded-lg">
                        JEE Main 2026
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-[#E2E8F0] flex flex-col gap-1.5 text-xs">
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        onOpenSettings?.();
                      }}
                      className="cursor-pointer w-full text-left flex items-center justify-between text-[#0F172A] font-bold p-2 rounded-lg hover:bg-[#F8FAFC] active:scale-95 transition-all"
                    >
                      Settings
                    </button>
                    <button
                      onClick={() => {
                        setShowProfile(false);
                        onSignOut?.();
                      }}
                      className="cursor-pointer w-full text-left flex items-center justify-between text-[#F43F5E] font-bold p-2 rounded-lg hover:bg-[#F43F5E]/5 active:scale-95 transition-all"
                    >
                      Sign Out
                    </button>
                    <div className="flex justify-between items-center px-2 py-1 mt-1">
                      <span className="flex items-center gap-1 text-[#64748B]">
                        <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Solver-Critic Active
                      </span>
                      <button
                        onClick={() => setShowProfile(false)}
                        className="text-[#64748B] hover:text-[#0F172A] cursor-pointer active:scale-95 transition-all"
                      >
                        Close
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Silicon Valley Investor Pitch & Product Moat Modal */}
      <AnimatePresence>
        {showInvestorDeck && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 15 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
              className="bg-white border border-[#E2E8F0] rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-5 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-[#2563EB] text-white flex items-center justify-center">
                    <TrendingUp className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">
                      StudyFlow AI • Silicon Valley SaaS Thesis
                    </h3>
                    <p className="text-[11px] text-[#64748B]">Target Market: $4B Test Prep Market in South Asia</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowInvestorDeck(false)}
                  className="text-[#64748B] hover:text-[#0F172A] text-xs font-bold bg-[#F1F5F9] px-2.5 py-1 rounded-lg cursor-pointer active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-3 text-xs text-[#0F172A] leading-relaxed">
                <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-3 rounded-2xl space-y-1">
                  <span className="font-extrabold text-[#F43F5E] uppercase tracking-wider block">
                    The Problem: Expensive AI Hallucinations
                  </span>
                  <p className="text-[#64748B]">
                    Standard LLMs (ChatGPT, Gemini) answer fast and sound confident even when wrong. In competitive exams (JEE/NEET), losing 4 marks shifts a student's college rank by thousands.
                  </p>
                </div>

                <div className="bg-[#2563EB]/10 border border-[#2563EB]/30 p-3 rounded-2xl space-y-1">
                  <span className="font-extrabold text-[#2563EB] uppercase tracking-wider block">
                    The Product Moat: Honest Dual-AI Fact-Checker
                  </span>
                  <p className="text-[#0F172A] font-medium">
                    We run a two-pass architecture: Solver AI derives from NCERT text, while Critic AI line-audits every step. If even 1 step is unbacked, we output a clear <span className="font-bold text-[#F43F5E]">"Do Not Trust / Ask Teacher"</span> warning.
                  </p>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-[#0F172A]">3.2M+</span>
                    <span className="text-[10px] text-[#64748B]">Annual Aspirants</span>
                  </div>
                  <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-[#2563EB]">0%</span>
                    <span className="text-[10px] text-[#64748B]">Hallucination Risk</span>
                  </div>
                  <div className="bg-[#F1F5F9] p-2.5 rounded-xl">
                    <span className="block font-black text-sm text-[#0F172A]">100%</span>
                    <span className="text-[10px] text-[#64748B]">NCERT Source Match</span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setShowInvestorDeck(false)}
                  className="bg-[#0F172A] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors cursor-pointer active:scale-95 transition-all"
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



