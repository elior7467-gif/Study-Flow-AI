import React, { useState, useEffect } from 'react';
import { UnitOverview, TopicMastery } from '../types';
import { TrendingUp, ShieldCheck, AlertTriangle, ChevronDown, Sparkles, RefreshCw, MessageSquare, CheckCircle2, Award } from 'lucide-react';
import { m, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';
import { useAuth, useUser } from '@clerk/clerk-react';

import { ToastType } from '../components/common/Toast';

interface HubViewProps {
  selectedUnitId: string;
  onSelectUnit: (unitId: string) => void;
  onNavigateToChatWithQuery: (query: string) => void;
  soundEnabled?: boolean;
  onNotify: (msg: string, type: ToastType) => void;
}

export const HubView: React.FC<HubViewProps> = ({
  selectedUnitId,
  onSelectUnit,
  onNavigateToChatWithQuery,
  soundEnabled = true,
  onNotify,
}) => {
  const { getToken } = useAuth();
  const { user } = useUser();
  const userId = user?.id;

  const [units, setUnits] = useState<UnitOverview[]>([{
    id: 'unit-active',
    name: 'Active Studies',
    course: 'Recent AI Verification Topics',
    overallMastery: 0,
    masteryDelta: 0,
    totalTimeHours: 0,
    totalTimeMinutes: 0,
    questionsCompleted: 0,
    questionsTotal: 0,
    topics: []
  }]);
  const [loading, setLoading] = useState(true);
  const [recommendations, setRecommendations] = useState<any[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      if (!userId) return;
      try {
        const token = await getToken({ template: 'supabase' });
        const res = await fetch(`/api/db/mastery/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          let totalVerified = 0;
          let totalFlagged = 0;
          
          const topics: TopicMastery[] = data.map((row: any) => {
            const vCount = row.verified_count || 0;
            const fCount = row.flagged_count || 0;
            const total = vCount + fCount;
            totalVerified += vCount;
            totalFlagged += fCount;
            
            const score = total > 0 ? Math.round((vCount / total) * 100) : 0;
            const statusText = total === 0 ? 'PENDING' : (score >= 75 ? 'VERIFIED' : 'FLAGGED');
            const subtitleText = total === 0 ? 'Not attempted' : `${vCount} verified | ${fCount} flagged`;
            
            return {
              id: row.topic_id,
              unit: 'unit-active',
              title: row.topic_title || row.topic_id,
              subtitle: subtitleText,
              status: statusText,
              auditDetails: total === 0 ? 'Start solving problems to earn mastery.' : 'Based on your recent problem solving history.',
              masteryScore: score
            };
          });

          const totalQuestions = totalVerified + totalFlagged;
          const overallScore = totalQuestions > 0 ? Math.round((totalVerified / totalQuestions) * 100) : 0;

          setUnits([{
            id: 'unit-active',
            name: 'Active Studies',
            course: 'Recent AI Verification Topics',
            overallMastery: overallScore,
            masteryDelta: 0,
            totalTimeHours: 0,
            totalTimeMinutes: 0,
            questionsCompleted: totalQuestions,
            questionsTotal: totalQuestions,
            topics: topics
          }]);
        }

        // Fetch Recommendations
        const recRes = await fetch(`/api/db/recommendations/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        if (recRes.ok) {
          const recData = await recRes.json();
          setRecommendations(recData);
        }
      } catch (err) {
        console.error('Failed to load hub data', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [userId, getToken]);

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
    } catch (err: any) {
      console.error('Audit failed:', err);
      onNotify(err.message || 'Audit failed', 'warning');
      playSound('warning', soundEnabled);
    } finally {
      setAuditingTopicId(null);
    }
  };

  return (
    <div className="pt-12 md:pt-24 px-4 max-w-md md:max-w-4xl lg:max-w-6xl mx-auto space-y-12 pb-32">
      {/* Unit Selector Header */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <h2 className="text-3xl md:text-4xl font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight">
            {currentUnit.name}
          </h2>

          <div className="relative group">
            <select
              value={currentUnit.id}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-50 text-xs font-semibold py-2 px-3.5 rounded-xl pr-8 cursor-pointer appearance-none outline-none focus:border border-black/5 dark:border-white/5 transition-all"
              id="unit-selector"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.course})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-zinc-900 dark:text-zinc-50 opacity-80 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
        <p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 opacity-80">{currentUnit.course}</p>
      </div>

      {/* Pitch & Value Proposition Hero Card */}
      <m.div
        initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
        animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
        transition={{ duration: 0.8, ease: [0.32, 0.72, 0, 1] }}
        className="ethereal-card-shell mt-4"
      >
        <div className="ethereal-card-core space-y-8">
          <div className="flex items-center justify-between">
            <span className="bg-white/5 border border-white/10 text-[#60A5FA] text-[10px] font-extrabold px-3 py-1.5 rounded-full uppercase tracking-widest">
              HACKATHON DEMO • NCERT PHYSICS CH 5
            </span>
            <span className="text-xs text-zinc-400 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-[#60A5FA]" /> Dual AI Pipeline
            </span>
          </div>

          <div className="space-y-6">
            <h2 className="text-4xl md:text-6xl lg:text-[4.5rem] font-sans font-bold tracking-tight text-transparent bg-clip-text bg-gradient-to-br from-white via-white/90 to-white/30 leading-[1.05] max-w-3xl">
              Honest AI Study Assistant for JEE & NEET
            </h2>
            <p className="text-base md:text-lg text-zinc-400/90 leading-relaxed max-w-2xl font-medium tracking-wide">
              Standard AI chatbots give wrong physics derivations confidently. In exams where 1 mark shifts your college rank, that's dangerous.
            </p>
          </div>

          {/* 2-Step Dual Engine Illustration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm pt-8">
            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4 relative group premium-transition hover:bg-black/60 shadow-lg">
              <div className="font-bold text-[#60A5FA] flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#60A5FA]/10 border border-[#60A5FA]/30 flex items-center justify-center text-xs tracking-widest">1</span>
                <span className="text-base tracking-tight">Solver AI</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Retrieves NCERT Class 11 textbook text & drafts step-by-step math derivations.
              </p>
            </div>

            <div className="bg-black/40 border border-white/5 rounded-3xl p-6 space-y-4 relative group premium-transition hover:bg-black/60 shadow-lg">
              <div className="font-bold text-[#F43F5E] flex items-center gap-3">
                <span className="w-10 h-10 rounded-full bg-[#F43F5E]/10 border border-[#F43F5E]/30 flex items-center justify-center text-xs tracking-widest">2</span>
                <span className="text-base tracking-tight">Critic AI Fact-Checker</span>
              </div>
              <p className="text-zinc-400 text-sm leading-relaxed">
                Audits each line against NCERT. If unbacked or tricky: warns <span className="text-[#F43F5E] font-semibold">"Ask a teacher instead!"</span>
              </p>
            </div>
          </div>

          {/* Demo Quick Start Chips */}
          <div className="pt-10 flex flex-col md:flex-row items-start md:items-center gap-4 text-sm">
            <span className="text-zinc-500 font-bold text-xs uppercase tracking-[0.2em] bg-black/40 px-4 py-2 rounded-full border border-white/5">Try Hackathon Scenarios:</span>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onNavigateToChatWithQuery('A car of mass 1500 kg drives at 20 m/s on a flat circular turn of radius 50 m with μ_s = 0.6. Will it skid? Show step-by-step NCERT derivation.');
              }}
              className="group bg-[#2563EB]/10 border border-[#2563EB]/30 text-[#60A5FA] font-bold px-5 py-3.5 rounded-full hover:bg-[#2563EB]/20 hover:border-[#2563EB]/50 active:scale-[0.98] premium-transition flex items-center gap-3 cursor-pointer w-full md:w-auto"
            >
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-1 premium-transition">
                <ShieldCheck className="w-4 h-4" />
              </span>
              1. In-Scope NCERT Question (Verified)
            </button>
            <button
              onClick={() => {
                playSound('click', soundEnabled);
                onNavigateToChatWithQuery('A block of 5 kg rests on a rough table with μ_s = 0.4. A horizontal force of 10 N is applied. Is static friction equal to 0.4 × 5 × 9.8 = 19.6 N?');
              }}
              className="group bg-[#F43F5E]/10 border border-[#F43F5E]/30 text-[#F43F5E] font-bold px-5 py-3.5 rounded-full hover:bg-[#F43F5E]/20 hover:border-[#F43F5E]/50 active:scale-[0.98] premium-transition flex items-center gap-3 cursor-pointer w-full md:w-auto"
            >
              <span className="w-8 h-8 rounded-full bg-black/20 flex items-center justify-center group-hover:translate-x-1 premium-transition">
                <AlertTriangle className="w-4 h-4" />
              </span>
              2. Misconception Trap (Honest Warning)
            </button>
          </div>
        </div>
      </m.div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mt-12">
        {/* Card 1: Overall Mastery */}
        <m.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
          className="md:col-span-2 ethereal-card-shell"
        >
          <div className="ethereal-card-core flex flex-col justify-between h-full min-h-[200px]">
            <div className="flex items-center justify-between text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              <span>Overall Mastery</span>
              <TrendingUp className="w-4 h-4 text-[#60A5FA]" />
            </div>

            <div className="mt-8 space-y-4">
              <div className="flex flex-wrap items-end gap-3">
                <span className="text-5xl md:text-[4rem] font-bold text-white tracking-tight leading-none">
                  {currentUnit.overallMastery}%
                </span>
                <span className="text-xs font-bold text-[#60A5FA] bg-[#2563EB]/10 border border-[#2563EB]/20 px-3 py-1.5 rounded-full mb-1">
                  +{currentUnit.masteryDelta}% this week
                </span>
              </div>

              {/* Animated Progress Bar */}
              <div className="w-full bg-black/60 border border-white/5 h-2.5 rounded-full overflow-hidden p-0.5">
                <m.div
                  initial={{ width: 0 }}
                  animate={{ width: `${currentUnit.overallMastery}%` }}
                  transition={{ duration: 1.2, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
                  className="bg-gradient-to-r from-[#2563EB] to-[#60A5FA] h-full rounded-full relative"
                >
                  <div className="absolute inset-0 bg-white/20 w-full h-full animate-[shimmer_2s_infinite]" />
                </m.div>
              </div>
            </div>
          </div>
        </m.div>

        {/* Card 2: Total Time */}
        <m.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
          className="md:col-span-1 ethereal-card-shell"
        >
          <div className="ethereal-card-core flex flex-col justify-between h-full min-h-[200px]">
            <div className="text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              Total Time
            </div>
            <div className="mt-8 text-4xl md:text-[3.5rem] font-bold text-white tracking-tight leading-none">
              {currentUnit.totalTimeHours}<span className="text-2xl text-zinc-600 tracking-normal ml-1">h</span> <br className="hidden md:block" /> {currentUnit.totalTimeMinutes}<span className="text-2xl text-zinc-600 tracking-normal ml-1">m</span>
            </div>
          </div>
        </m.div>

        {/* Card 3: Questions */}
        <m.div
          initial={{ opacity: 0, y: 30, filter: 'blur(10px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ duration: 0.8, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
          className="md:col-span-1 ethereal-card-shell"
        >
          <div className="ethereal-card-core flex flex-col justify-between h-full min-h-[200px]">
            <div className="text-[11px] font-semibold text-zinc-400 tracking-widest uppercase">
              Questions
            </div>
            <div className="mt-8 flex items-end gap-1 text-5xl md:text-[4.5rem] font-bold text-white tracking-tight leading-none">
              <span>{currentUnit.questionsCompleted}</span>
              <span className="text-2xl font-medium text-zinc-600 mb-1 tracking-tight">
                /{currentUnit.questionsTotal}
              </span>
            </div>
          </div>
        </m.div>
      </div>

      {/* Focus On This Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-6 mt-16">
          <div className="flex items-center justify-between border-b border-white/5 pb-4">
            <h3 className="text-xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-[#F43F5E]" />
              Focus On This
            </h3>
            <span className="text-[10px] md:text-xs font-bold text-[#F43F5E] bg-[#F43F5E]/10 border border-[#F43F5E]/20 px-4 py-2 rounded-full uppercase tracking-[0.2em]">
              Weakest topics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {recommendations.map((rec, index) => (
              <m.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1, ease: [0.32, 0.72, 0, 1] }}
                key={rec.topic_id} 
                className="bg-black/40 border border-white/5 rounded-2xl p-5 flex flex-col justify-between group premium-transition hover:bg-black/60 hover:border-white/10 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-32 h-32 bg-[#F43F5E]/5 rounded-full blur-3xl group-hover:bg-[#F43F5E]/10 premium-transition pointer-events-none" />
                <div className="relative z-10">
                  <h4 className="text-sm font-bold text-white line-clamp-2">{rec.topic_title || rec.topic_id}</h4>
                  <p className="text-xs text-zinc-400 mt-2">
                    Mastery: <span className="font-bold text-[#F43F5E]">{rec.masteryScore}%</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onNavigateToChatWithQuery(`Give me a practice question on ${rec.topic_title || rec.topic_id} similar to common JEE/NEET traps.`);
                  }}
                  className="mt-6 bg-white/5 hover:bg-[#F43F5E]/20 active:bg-[#F43F5E]/30 text-white hover:text-[#F43F5E] border border-white/5 hover:border-[#F43F5E]/30 text-xs font-bold py-3 px-4 rounded-xl premium-transition cursor-pointer w-full flex items-center justify-center gap-2 relative z-10"
                >
                  <Sparkles className="w-4 h-4" /> Practice Now
                </button>
              </m.div>
            ))}
          </div>
        </div>
      )}

      {/* Conceptual Mastery Section */}
      <div className="space-y-8 mt-16">
        <div className="flex items-end justify-between border-b border-white/5 pb-4">
          <h3 className="text-2xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70 tracking-tight leading-[1.1]">
            Conceptual<br />Mastery
          </h3>
          <span className="text-[10px] md:text-xs font-bold text-zinc-500 tracking-[0.2em] uppercase border border-white/5 bg-black/40 px-4 py-2 rounded-full mb-2">
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
                className="bg-black/40 border border-white/5 hover:border-white/10 active:bg-white/5 rounded-2xl p-5 premium-transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div>
                  <h4 className="text-base font-bold text-white group-hover:text-[#60A5FA] premium-transition">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-1">{topic.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isVerified ? (
                    <div className="bg-[#2563EB]/10 text-[#60A5FA] border border-[#2563EB]/30 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 tracking-widest uppercase">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      AUDIT: VERIFIED
                    </div>
                  ) : (
                    <div className="bg-[#F43F5E]/10 text-[#F43F5E] border border-[#F43F5E]/30 text-[10px] font-bold px-3 py-1.5 rounded-full flex items-center gap-1.5 tracking-widest uppercase">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      AUDIT: FLAGGED
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
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-md flex items-center justify-center p-4">
          <m.div 
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.4, ease: [0.32, 0.72, 0, 1] }}
            className="ethereal-card-shell max-w-lg w-full"
          >
            <div className="ethereal-card-core space-y-6 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">
                    Conceptual Audit • {currentUnit.name}
                  </span>
                  <h3 className="text-2xl font-bold text-white mt-1">{selectedTopic.title}</h3>
                  <p className="text-sm text-zinc-400 mt-1">{selectedTopic.subtitle}</p>
                </div>

                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-zinc-500 hover:text-white bg-white/5 hover:bg-white/10 rounded-full p-2 cursor-pointer active:scale-95 premium-transition flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Audit Status Banner */}
              <div
                className={`p-5 rounded-2xl border flex items-center gap-4 ${
                  selectedTopic.status === 'VERIFIED'
                    ? 'bg-[#2563EB]/10 border-[#2563EB]/30 text-[#60A5FA]'
                    : 'bg-[#F43F5E]/10 border-[#F43F5E]/30 text-[#F43F5E]'
                }`}
              >
                {selectedTopic.status === 'VERIFIED' ? (
                  <ShieldCheck className="w-8 h-8 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-8 h-8 flex-shrink-0" />
                )}
                <div>
                  <div className="text-xs font-bold uppercase tracking-widest">
                    Audit Status: {selectedTopic.status}
                  </div>
                  <div className="text-sm font-medium mt-1">
                    {selectedTopic.auditDetails}
                  </div>
                </div>
              </div>

              {/* Live Audit Data if triggered */}
              {topicAuditResult && (
                <div className="bg-black/40 border border-white/5 p-5 rounded-2xl space-y-3 text-sm">
                  <div className="font-bold text-[#60A5FA] flex items-center gap-2">
                    <Sparkles className="w-4 h-4" /> Live Critic AI Audit
                  </div>
                  <p className="text-zinc-300 font-medium leading-relaxed">{topicAuditResult.auditDetails}</p>

                  {topicAuditResult.insights && (
                    <div className="space-y-2 pt-2">
                      <span className="font-bold text-zinc-500 text-xs uppercase tracking-widest">Key Insights:</span>
                      <ul className="list-disc list-inside space-y-1.5 text-zinc-400">
                        {topicAuditResult.insights.map((ins: string, idx: number) => (
                          <li key={idx}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => handleRunTopicAudit(selectedTopic)}
                  disabled={auditingTopicId === selectedTopic.id}
                  className="flex-1 bg-white text-black font-bold py-3.5 px-4 rounded-xl hover:bg-zinc-200 active:scale-[0.98] premium-transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer"
                >
                  {auditingTopicId === selectedTopic.id ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Running Audit...
                    </>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" /> Run Live Audit
                    </>
                  )}
                </button>

                <button
                  onClick={() => {
                    const query = `Can you break down the step-by-step derivation and key concepts for ${selectedTopic.title} in ${currentUnit.name}?`;
                    setSelectedTopic(null);
                    onNavigateToChatWithQuery(query);
                  }}
                  className="flex-1 bg-white/5 border border-white/10 text-white font-bold py-3.5 px-4 rounded-xl hover:bg-white/10 active:scale-[0.98] premium-transition flex items-center justify-center gap-2 cursor-pointer"
                >
                  <MessageSquare className="w-4 h-4" /> Ask AI Derivation
                </button>
              </div>
            </div>
          </m.div>
        </div>
      )}
    </div>
  );
};
