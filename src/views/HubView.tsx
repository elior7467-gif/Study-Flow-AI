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
    <div className="pt-8 md:pt-16 px-4 md:px-6 max-w-5xl mx-auto space-y-10 pb-32">
      {/* Unit Selector Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold text-zinc-500 uppercase tracking-widest mb-1">{currentUnit.course}</p>
            <h2 className="text-2xl md:text-3xl font-bold text-zinc-900 dark:text-white tracking-tight">
              {currentUnit.name}
            </h2>
          </div>

          <div className="relative group">
            <select
              value={currentUnit.id}
              onChange={(e) => onSelectUnit(e.target.value)}
              className="bg-white dark:bg-white/[0.04] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-300 text-xs font-medium py-2 px-3 rounded-lg pr-8 cursor-pointer appearance-none outline-none hover:border-zinc-300 dark:hover:border-white/15 premium-transition"
              id="unit-selector"
            >
              {units.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name} ({u.course})
                </option>
              ))}
            </select>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Hero Card — Value Proposition */}
      <m.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="sf-card"
      >
        <div className="p-6 md:p-8 space-y-6">
          <div className="flex items-center justify-between">
            <span className="inline-flex items-center gap-1.5 bg-blue-500/10 text-blue-400 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wider">
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
              HACKATHON DEMO · NCERT PHYSICS CH 5
            </span>
            <span className="text-[11px] text-zinc-500 font-medium flex items-center gap-1.5">
              <Sparkles className="w-3 h-3 text-blue-400" /> Dual AI Pipeline
            </span>
          </div>

          <div className="space-y-4">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
              Honest AI Study Assistant<br className="hidden md:block" /> for JEE & NEET
            </h2>
            <p className="text-sm md:text-[15px] text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xl">
              Standard AI chatbots give wrong physics derivations confidently. In exams where 1 mark shifts your college rank, that's dangerous.
            </p>
          </div>

          {/* 2-Step Dual Engine */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
            <div className="bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.05] rounded-xl p-5 space-y-3 group premium-transition hover:border-blue-500/20 dark:hover:border-blue-500/15">
              <div className="font-semibold text-blue-500 flex items-center gap-2.5 text-sm">
                <span className="w-7 h-7 rounded-lg bg-blue-500/10 flex items-center justify-center text-[11px] font-bold">1</span>
                Solver AI
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[13px] leading-relaxed">
                Retrieves NCERT Class 11 textbook text & drafts step-by-step math derivations.
              </p>
            </div>

            <div className="bg-zinc-50 dark:bg-white/[0.03] border border-zinc-200/60 dark:border-white/[0.05] rounded-xl p-5 space-y-3 group premium-transition hover:border-rose-500/20 dark:hover:border-rose-500/15">
              <div className="font-semibold text-rose-500 flex items-center gap-2.5 text-sm">
                <span className="w-7 h-7 rounded-lg bg-rose-500/10 flex items-center justify-center text-[11px] font-bold">2</span>
                Critic AI Fact-Checker
              </div>
              <p className="text-zinc-500 dark:text-zinc-400 text-[13px] leading-relaxed">
                Audits each line against NCERT. If unbacked or tricky: warns <span className="text-rose-500 font-semibold">"Ask a teacher instead!"</span>
              </p>
            </div>
          </div>

          {/* Demo Quick Start */}
          <div className="pt-4 flex flex-col md:flex-row items-start md:items-center gap-3">
            <span className="text-zinc-400 dark:text-zinc-500 font-semibold text-[11px] uppercase tracking-wider shrink-0">Try Scenarios:</span>
            <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onNavigateToChatWithQuery('A car of mass 1500 kg drives at 20 m/s on a flat circular turn of radius 50 m with μ_s = 0.6. Will it skid? Show step-by-step NCERT derivation.');
                }}
                className="group flex items-center gap-2 bg-blue-500/8 hover:bg-blue-500/15 border border-blue-500/15 hover:border-blue-500/30 text-blue-400 font-semibold text-[13px] px-4 py-2.5 rounded-lg active:scale-[0.98] premium-transition cursor-pointer"
              >
                <ShieldCheck className="w-4 h-4" />
                In-Scope NCERT (Verified)
              </button>
              <button
                onClick={() => {
                  playSound('click', soundEnabled);
                  onNavigateToChatWithQuery('A block of 5 kg rests on a rough table with μ_s = 0.4. A horizontal force of 10 N is applied. Is static friction equal to 0.4 × 5 × 9.8 = 19.6 N?');
                }}
                className="group flex items-center gap-2 bg-rose-500/8 hover:bg-rose-500/15 border border-rose-500/15 hover:border-rose-500/30 text-rose-400 font-semibold text-[13px] px-4 py-2.5 rounded-lg active:scale-[0.98] premium-transition cursor-pointer"
              >
                <AlertTriangle className="w-4 h-4" />
                Misconception Trap (Warning)
              </button>
            </div>
          </div>
        </div>
      </m.div>

      {/* Stats Bento Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {/* Card 1: Overall Mastery */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
          className="sf-card p-5 md:p-6 flex flex-col justify-between min-h-[160px]"
        >
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">Overall Mastery</span>
            <TrendingUp className="w-4 h-4 text-blue-400" />
          </div>

          <div className="mt-auto space-y-3">
            <div className="flex items-end gap-2">
              <span className="text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
                {currentUnit.overallMastery}%
              </span>
              <span className="text-[11px] font-semibold text-blue-400 bg-blue-500/10 px-2 py-0.5 rounded mb-1">
                +{currentUnit.masteryDelta}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="w-full bg-zinc-200 dark:bg-white/[0.06] h-1.5 rounded-full overflow-hidden">
              <m.div
                initial={{ width: 0 }}
                animate={{ width: `${currentUnit.overallMastery}%` }}
                transition={{ duration: 1.2, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
                className="bg-gradient-to-r from-blue-500 to-blue-400 h-full rounded-full"
              />
            </div>
          </div>
        </m.div>

        {/* Card 2: Total Time */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="sf-card p-5 md:p-6 flex flex-col justify-between min-h-[160px]"
        >
          <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">Total Time</span>
          <div className="mt-auto text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
            {currentUnit.totalTimeHours}<span className="text-xl text-zinc-400 ml-0.5">h</span>{' '}
            {currentUnit.totalTimeMinutes}<span className="text-xl text-zinc-400 ml-0.5">m</span>
          </div>
        </m.div>

        {/* Card 3: Questions */}
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
          className="sf-card p-5 md:p-6 flex flex-col justify-between min-h-[160px]"
        >
          <span className="text-[11px] font-semibold text-zinc-400 tracking-wider uppercase">Questions</span>
          <div className="mt-auto flex items-end gap-1 text-4xl md:text-5xl font-bold text-zinc-900 dark:text-white tracking-tight leading-none">
            <span>{currentUnit.questionsCompleted}</span>
            <span className="text-xl font-medium text-zinc-400 mb-0.5">
              /{currentUnit.questionsTotal}
            </span>
          </div>
        </m.div>
      </div>

      {/* Focus On This Recommendations */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight flex items-center gap-2">
              <AlertTriangle className="w-4.5 h-4.5 text-rose-500" />
              Focus On This
            </h3>
            <span className="text-[10px] font-bold text-rose-500 bg-rose-500/10 border border-rose-500/15 px-2.5 py-1 rounded-full uppercase tracking-wider">
              Weakest topics
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {recommendations.map((rec, index) => (
              <m.div 
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                key={rec.topic_id} 
                className="sf-card p-5 flex flex-col justify-between group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white line-clamp-2">{rec.topic_title || rec.topic_id}</h4>
                  <p className="text-xs text-zinc-400 mt-1.5">
                    Mastery: <span className="font-bold text-rose-500">{rec.masteryScore}%</span>
                  </p>
                </div>
                <button
                  onClick={() => {
                    playSound('click', soundEnabled);
                    onNavigateToChatWithQuery(`Give me a practice question on ${rec.topic_title || rec.topic_id} similar to common JEE/NEET traps.`);
                  }}
                  className="mt-4 bg-zinc-100 dark:bg-white/[0.04] hover:bg-rose-500/10 dark:hover:bg-rose-500/10 text-zinc-700 dark:text-zinc-300 hover:text-rose-500 border border-zinc-200 dark:border-white/[0.06] hover:border-rose-500/20 text-xs font-semibold py-2.5 px-3 rounded-lg premium-transition cursor-pointer w-full flex items-center justify-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" /> Practice Now
                </button>
              </m.div>
            ))}
          </div>
        </div>
      )}

      {/* Conceptual Mastery Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white tracking-tight">
            Conceptual Mastery
          </h3>
          <span className="text-[10px] font-bold text-zinc-400 tracking-wider uppercase">
            Solver-Critic Audit Log
          </span>
        </div>

        <div className="space-y-2">
          {currentUnit.topics.map((topic) => {
            const isVerified = topic.status === 'VERIFIED';
            return (
              <div
                key={topic.id}
                onClick={() => {
                  setSelectedTopic(topic);
                  setTopicAuditResult(null);
                }}
                className="sf-card p-4 md:p-5 premium-transition cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
              >
                <div>
                  <h4 className="text-sm font-semibold text-zinc-900 dark:text-white group-hover:text-blue-500 dark:group-hover:text-blue-400 premium-transition">
                    {topic.title}
                  </h4>
                  <p className="text-xs text-zinc-400 mt-0.5">{topic.subtitle}</p>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  {isVerified ? (
                    <div className="bg-blue-500/10 text-blue-400 border border-blue-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 tracking-wider uppercase">
                      <ShieldCheck className="w-3 h-3" />
                      VERIFIED
                    </div>
                  ) : (
                    <div className="bg-rose-500/10 text-rose-500 border border-rose-500/20 text-[10px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1.5 tracking-wider uppercase">
                      <AlertTriangle className="w-3 h-3" />
                      FLAGGED
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Topic Audit Modal */}
      {selectedTopic && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <m.div 
            initial={{ opacity: 0, scale: 0.96, y: 8 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.22, 1, 0.36, 1] }}
            className="sf-card max-w-lg w-full"
          >
            <div className="p-6 md:p-8 space-y-5 max-h-[85vh] overflow-y-auto">
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    Conceptual Audit · {currentUnit.name}
                  </span>
                  <h3 className="text-xl font-bold text-zinc-900 dark:text-white mt-1">{selectedTopic.title}</h3>
                  <p className="text-sm text-zinc-400 mt-0.5">{selectedTopic.subtitle}</p>
                </div>

                <button
                  onClick={() => setSelectedTopic(null)}
                  className="text-zinc-400 hover:text-zinc-900 dark:hover:text-white bg-zinc-100 dark:bg-white/[0.05] hover:bg-zinc-200 dark:hover:bg-white/[0.10] rounded-lg p-2 cursor-pointer active:scale-95 premium-transition flex-shrink-0"
                >
                  ✕
                </button>
              </div>

              {/* Audit Status Banner */}
              <div
                className={`p-4 rounded-xl border flex items-center gap-3 ${
                  selectedTopic.status === 'VERIFIED'
                    ? 'bg-blue-500/10 border-blue-500/20 text-blue-400'
                    : 'bg-rose-500/10 border-rose-500/20 text-rose-500'
                }`}
              >
                {selectedTopic.status === 'VERIFIED' ? (
                  <ShieldCheck className="w-6 h-6 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="w-6 h-6 flex-shrink-0" />
                )}
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider">
                    Status: {selectedTopic.status}
                  </div>
                  <div className="text-sm font-medium mt-0.5 opacity-80">
                    {selectedTopic.auditDetails}
                  </div>
                </div>
              </div>

              {/* Live Audit Data if triggered */}
              {topicAuditResult && (
                <div className="sf-card p-4 space-y-2 text-sm">
                  <div className="font-semibold text-blue-400 flex items-center gap-1.5 text-xs">
                    <Sparkles className="w-3.5 h-3.5" /> Live Critic AI Audit
                  </div>
                  <p className="text-zinc-600 dark:text-zinc-300 leading-relaxed">{topicAuditResult.auditDetails}</p>

                  {topicAuditResult.insights && (
                    <div className="space-y-1.5 pt-1">
                      <span className="font-bold text-zinc-400 text-[10px] uppercase tracking-wider">Key Insights:</span>
                      <ul className="list-disc list-inside space-y-1 text-zinc-500 dark:text-zinc-400 text-[13px]">
                        {topicAuditResult.insights.map((ins: string, idx: number) => (
                          <li key={idx}>{ins}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-2 pt-1">
                <button
                  onClick={() => handleRunTopicAudit(selectedTopic)}
                  disabled={auditingTopicId === selectedTopic.id}
                  className="flex-1 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 font-semibold py-3 px-4 rounded-xl hover:bg-zinc-800 dark:hover:bg-zinc-100 active:scale-[0.98] premium-transition flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer text-sm"
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
                  className="flex-1 bg-zinc-100 dark:bg-white/[0.05] border border-zinc-200 dark:border-white/[0.08] text-zinc-700 dark:text-zinc-200 font-semibold py-3 px-4 rounded-xl hover:bg-zinc-200 dark:hover:bg-white/[0.08] active:scale-[0.98] premium-transition flex items-center justify-center gap-2 cursor-pointer text-sm"
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
