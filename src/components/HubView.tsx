import React, { useState } from 'react';
import { UnitOverview, TopicMastery } from '../types';
import { TrendingUp, ShieldCheck, AlertTriangle, ChevronDown, Sparkles, RefreshCw, MessageSquare, CheckCircle2, Award } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';

interface HubViewProps {
  units: UnitOverview[];
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  onNavigateToChatWithQuery: (query: string) => void;
  soundEnabled?: boolean;
  onNotify: (msg: string, type: "success" | "warning" | "error") => void;
}

export const HubView: React.FC<HubViewProps> = ({
  units,
  selectedUnitId,
  onSelectUnit,
  onNavigateToChatWithQuery,
  soundEnabled = true,
  onNotify,
}) => {
  const currentUnit = units.find((u) => u.id === selectedUnitId) || units[0];
  const [selectedTopic, setSelectedTopic] = useState<TopicMastery | null>(null);
  const [auditingTopicId, setAuditingTopicId] = useState<string | null>(null);
  const [topicAuditResult, setTopicAuditResult] = useState<any>(null);

  // Daily Challenge State
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [showExplanation, setShowExplanation] = useState(false);

  const dailyMcq = {
    question: "A car turns on a circular banked road with angle θ and coefficient of static friction μ_s. What is the maximum safe speed without skidding?",
    options: [
      "v_max = √(r g (tan θ + μ_s) / (1 - μ_s tan θ))",
      "v_max = √(r g tan θ)",
      "v_max = √(r g μ_s)",
      "v_max = √(r g (tan θ - μ_s) / (1 + μ_s tan θ))"
    ],
    correctIdx: 0,
    criticNote: "✓ VERIFIED: NCERT Class 11 Pg 103 Eq (5.21). When μ_s = 0, it reduces to the ideal banked road formula v = √(r g tan θ)."
  };

  const handleRunTopicAudit = async (topic: TopicMastery) => {
    playSound('click', soundEnabled);
    setAuditingTopicId(topic.id);
    setTopicAuditResult(null);
    try {
      const res = await fetch('/api/audit-topic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          topicTitle: topic.title,
          subtitle: topic.subtitle,
          unit: currentUnit.name,
        }),
      });
      const data = await res.json();
      setTopicAuditResult(data);
      playSound('success', soundEnabled);
    } catch (err) {
      console.error('Audit failed:', err);
      onNotify(err.message || "Failed to connect to AI server", "error");
      playSound('warning', soundEnabled);
    } finally {
      setAuditingTopicId(null);
    }
  };

  return (
    <div className="pb-24 pt-4 px-4 max-w-md md:max-w-2xl lg:max-w-4xl mx-auto space-y-6">
      {/* Unit Selector Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl md:text-3xl font-serif font-bold text-[#0F172A] tracking-tight">
            {currentUnit.name}
          </h2>

          <div className="relative group">
            <select
              value={currentUnit.id}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] text-xs font-semibold py-2 px-3.5 rounded-xl pr-8 cursor-pointer appearance-none hover:bg-[#E2E8F0] transition-colors"
              id="unit-selector"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.course})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-[#64748B] absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <p className="text-sm font-medium text-[#64748B]">{currentUnit.course}</p>
      </div>

      {/* Pitch & Value Proposition Hero Card */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="bg-gradient-to-br from-[#0F172A] to-[#1E293B] rounded-[28px] p-6 text-white shadow-md space-y-4 relative overflow-hidden"
      >
        <div className="flex items-center justify-between">
          <span className="bg-[#2563EB] text-white text-[10px] font-extrabold px-3 py-1 rounded-full uppercase tracking-wider">
            HACKATHON DEMO • NCERT PHYSICS CH 5
          </span>
          <span className="text-xs text-[#E2E8F0] font-medium flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-[#2563EB]" /> Dual AI Pipeline
          </span>
        </div>

        <div className="space-y-2">
          <h2 className="text-xl md:text-2xl font-serif font-bold tracking-tight text-white">
            Honest AI Study Assistant for JEE & NEET
          </h2>
          <p className="text-xs md:text-sm text-[#E2E8F0] leading-relaxed">
            Standard AI chatbots give wrong physics derivations confidently. In exams where 1 mark shifts your college rank, that's dangerous.
          </p>
        </div>

        {/* 2-Step Dual Engine Illustration */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs pt-1">
          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 space-y-1">
            <div className="font-bold text-[#2563EB] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#2563EB] text-white flex items-center justify-center text-[10px]">1</span>
              <span>Solver AI</span>
            </div>
            <p className="text-[#E2E8F0] text-[11px] leading-snug">
              Retrieves NCERT Class 11 textbook text & drafts step-by-step math derivations.
            </p>
          </div>

          <div className="bg-white/10 backdrop-blur-xs border border-white/15 rounded-2xl p-3 space-y-1">
            <div className="font-bold text-[#F43F5E] flex items-center gap-1.5">
              <span className="w-5 h-5 rounded-full bg-[#F43F5E] text-white flex items-center justify-center text-[10px]">2</span>
              <span>Critic AI Fact-Checker</span>
            </div>
            <p className="text-[#E2E8F0] text-[11px] leading-snug">
              Audits each line against NCERT. If unbacked or tricky: warns <span className="font-bold text-[#F43F5E]">"Ask a teacher instead!"</span>
            </p>
          </div>
        </div>

        {/* Demo Quick Start Chips */}
        <div className="pt-2 border-t border-white/15 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-[#E2E8F0] font-medium text-[11px]">Try Hackathon Scenarios:</span>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound('click', soundEnabled);
              onNavigateToChatWithQuery('A car of mass 1500 kg drives at 20 m/s on a flat circular turn of radius 50 m with μ_s = 0.6. Will it skid? Show step-by-step NCERT derivation.');
            }}
            className="bg-[#2563EB] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-[#6FA38B] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" /> 1. In-Scope NCERT Question (Verified)
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => {
              playSound('click', soundEnabled);
              onNavigateToChatWithQuery('A block of 5 kg rests on a rough table with μ_s = 0.4. A horizontal force of 10 N is applied. Is static friction equal to 0.4 × 5 × 9.8 = 19.6 N?');
            }}
            className="bg-[#F43F5E] text-white font-bold px-3 py-1.5 rounded-xl hover:bg-[#D0694E] transition-colors flex items-center gap-1 cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" /> 2. Misconception Trap (Honest Warning)
          </motion.button>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
        {/* Card 1: Overall Mastery */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.2, delay: 0.05 }}
          className="col-span-2 md:col-span-1 bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-xs flex flex-col justify-between relative overflow-hidden"
        >
          <div className="flex items-center justify-between text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            <span>Overall Mastery</span>
            <TrendingUp className="w-4 h-4 text-[#2563EB]" />
          </div>

          <div className="mt-3 space-y-2">
            <div className="flex items-baseline gap-3">
              <span className="text-4xl md:text-5xl font-extrabold text-[#0F172A] tracking-tight">
                {currentUnit.overallMastery}%
              </span>
              <span className="text-xs font-bold text-[#2563EB] bg-[#2563EB]/15 px-2.5 py-1 rounded-full flex items-center gap-1">
                +{currentUnit.masteryDelta}% this week
              </span>
            </div>

            {/* Animated Progress Bar */}
            <div className="w-full bg-[#F8FAFC] border border-[#E2E8F0] h-2.5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${currentUnit.overallMastery}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="bg-[#2563EB] h-full rounded-full"
              />
            </div>
          </div>
        </motion.div>

        {/* Card 2: Total Time */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            Total Time
          </div>
          <div className="mt-3 text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            {currentUnit.totalTimeHours}h {currentUnit.totalTimeMinutes}m
          </div>
        </div>

        {/* Card 3: Questions */}
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-xs flex flex-col justify-between">
          <div className="text-xs font-semibold text-[#64748B] tracking-wider uppercase">
            Questions
          </div>
          <div className="mt-3 flex items-baseline gap-1 text-2xl md:text-3xl font-extrabold text-[#0F172A] tracking-tight">
            <span>{currentUnit.questionsCompleted}</span>
            <span className="text-sm font-normal text-[#64748B]">
              /{currentUnit.questionsTotal}
            </span>
          </div>
        </div>
      </div>

      {/* Conceptual Mastery Section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xl font-bold text-[#0F172A] tracking-tight">
            Conceptual Mastery
          </h3>
          <span className="text-xs font-medium text-[#64748B]">
            Solver-Critic Audit Log
          </span>
        </div>

        <div className="space-y-3">
          {currentUnit.topics.map((topic) => {
            const isVerified = topic.status === 'VERIFIED';
            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic);
                  setTopicAuditResult(null);
                }}
                className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-xs hover:border-[#2563EB] transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <h4 className="text-base font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-[#64748B] mt-0.5">{topic.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isVerified ? (
                    <div className="bg-[#2563EB] text-white text-[11px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 tracking-wider uppercase shadow-xs">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      CRITIC AUDIT: VERIFIED
                    </div>
                  ) : (
                    <div className="bg-[#F43F5E]/15 text-[#F43F5E] border border-[#F43F5E]/30 text-[11px] font-bold px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 tracking-wider uppercase">
                      <AlertTriangle className="w-3.5 h-3.5 text-[#F43F5E]" />
                      CRITIC AUDIT: FLAGGED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Audit Modal / Drawer */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-[#E2E8F0] rounded-[32px] max-w-lg w-full p-6 shadow-xl space-y-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between border-b border-[#E2E8F0] pb-3">
              <div>
                <span className="text-xs font-semibold text-[#64748B] uppercase tracking-wider">
                  Conceptual Audit • {currentUnit.name}
                </span>
                <h3 className="text-xl font-bold text-[#0F172A]">{selectedTopic.title}</h3>
                <p className="text-xs text-[#64748B]">{selectedTopic.subtitle}</p>
              </div>

              <button
                onClick={() => setSelectedTopic(null)}
                className="text-[#64748B] hover:text-[#0F172A] p-1 text-lg font-bold cursor-pointer active:scale-95 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Audit Status Banner */}
            <div
              className={`p-4 rounded-2xl border flex items-center gap-3 ${
                selectedTopic.status === 'VERIFIED'
                  ? 'bg-[#2563EB]/15 border-[#2563EB]/40 text-[#2563EB]'
                  : 'bg-[#F43F5E]/15 border-[#F43F5E]/40 text-[#F43F5E]'
              }`}
            >
              {selectedTopic.status === 'VERIFIED' ? (
                <ShieldCheck className="w-6 h-6 flex-shrink-0" />
              ) : (
                <AlertTriangle className="w-6 h-6 flex-shrink-0" />
              )}
              <div>
                <div className="text-xs font-bold uppercase tracking-wider">
                  Audit Status: {selectedTopic.status}
                </div>
                <div className="text-xs text-[#0F172A] font-medium mt-0.5">
                  {selectedTopic.auditDetails}
                </div>
              </div>
            </div>

            {/* Live Audit Data if triggered */}
            {topicAuditResult && (
              <div className="bg-[#F8FAFC] border border-[#E2E8F0] p-4 rounded-2xl space-y-2 text-xs">
                <div className="font-bold text-[#2563EB] flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4" /> Live Gemini Critic Audit
                </div>
                <p className="text-[#0F172A] font-medium">{topicAuditResult.auditDetails}</p>

                {topicAuditResult.insights && (
                  <div className="space-y-1 pt-1">
                    <span className="font-semibold text-[#64748B]">Key Insights:</span>
                    <ul className="list-disc list-inside space-y-0.5 text-[#64748B]">
                      {topicAuditResult.insights.map((ins: string, idx: number) => (
                        <li key={idx}>{ins}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons */}
            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                onClick={() => handleRunTopicAudit(selectedTopic)}
                disabled={auditingTopicId === selectedTopic.id}
                className="flex-1 bg-[#0F172A] text-white text-xs font-bold py-3 px-4 rounded-2xl hover:bg-[#2563EB] transition-colors flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer active:scale-95 transition-all"
              >
                {auditingTopicId === selectedTopic.id ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" /> Running AI Audit...
                  </>
                ) : (
                  <>
                    <Sparkles className="w-4 h-4" /> Run Live Gemini AI Audit
                  </>
                )}
              </button>

              <button
                onClick={() => {
                  const query = `Can you break down the step-by-step derivation and key concepts for ${selectedTopic.title} in ${currentUnit.name}?`;
                  setSelectedTopic(null);
                  onNavigateToChatWithQuery(query);
                }}
                className="flex-1 bg-[#F1F5F9] border border-[#E2E8F0] text-[#0F172A] text-xs font-bold py-3 px-4 rounded-2xl hover:bg-[#E2E8F0] transition-colors flex items-center justify-center gap-2 cursor-pointer active:scale-95 transition-all"
              >
                <MessageSquare className="w-4 h-4" /> Ask AI Derivation
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
