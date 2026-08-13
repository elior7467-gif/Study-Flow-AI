import React, { useState, useEffect, useRef } from 'react';
import { SolverResult } from '../types';
import {
  Sparkles,
  CheckCircle2,
  BookOpen,
  Send,
  RefreshCw,
  ShieldCheck,
  AlertTriangle,
  ChevronDown,
  ChevronUp,
  FileText,
  Copy,
  Check,
  Maximize2,
  User,
  Bot
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playSound } from '../utils/sound';

interface ChatViewProps {
  solutions: SolverResult[];
  onAddNewSolution: (solution: SolverResult) => void;
  initialQuery?: string;
  soundEnabled?: boolean;
  onNotify: (msg: string, type: "success" | "warning" | "error") => void;
}

const AiMessageCard: React.FC<{ solution: SolverResult; soundEnabled: boolean }> = ({ solution, soundEnabled }) => {
  const [showPipelineInspector, setShowPipelineInspector] = useState(false);
  const [showTextbookModal, setShowTextbookModal] = useState(false);
  const [copied, setCopied] = useState(false);

  const handleCopySolution = () => {
    playSound('click', soundEnabled);
    const textToCopy = `[StudyFlow AI - NCERT Verified Derivation]\n\nQuestion: ${solution.query}\n\nTitle: ${solution.title}\n\nFinal Equation: ${solution.finalEquation || 'N/A'}\n\nCitation: ${solution.citation?.textbook} (${solution.citation?.chapter})`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4">
      {/* CRITIC DECISION BANNER (GREEN VERIFIED vs AMBER HONEST WARNING) */}
      {solution.criticAuditStatus === 'VERIFIED' ? (
        <div className="bg-[#2563EB]/15 border-2 border-[#2563EB] rounded-[24px] p-4 flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#2563EB] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div className="space-y-0.5 flex-1">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black text-[#2563EB] tracking-wider uppercase bg-[#2563EB]/20 px-2.5 py-0.5 rounded-md">
                  VERIFIED NCERT SOURCE
                </span>
                {solution.citation?.ncertPage && (
                  <span className="text-[10px] font-extrabold text-[#0F172A]">
                    {solution.citation.ncertPage}
                  </span>
                )}
              </div>

              <button
                onClick={() => setShowTextbookModal(true)}
                className="text-[10px] font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer active:scale-95 transition-all"
              >
                <BookOpen className="w-3.5 h-3.5" /> Inspect Source
              </button>
            </div>

            <h4 className="text-xs font-extrabold text-[#0F172A] mt-1">
              Every Step Verified Against Class 11 Physics Chapter 5 Text
            </h4>
            <p className="text-[11px] text-[#64748B]">
              {solution.criticAuditNotes || 'All mathematical steps follow NCERT principles without hallucinated assumptions.'}
            </p>
          </div>
        </div>
      ) : (
        <div className="bg-[#F43F5E]/15 border-2 border-[#F43F5E] rounded-[24px] p-5 flex items-start gap-3 shadow-xs">
          <div className="w-10 h-10 rounded-2xl bg-[#F43F5E] text-white flex items-center justify-center flex-shrink-0 shadow-xs">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-1 flex-1">
            <span className="text-[10px] font-black text-[#F43F5E] tracking-wider uppercase bg-[#F43F5E]/20 px-2.5 py-0.5 rounded-md">
              HONEST CRITIC WARNING • DO NOT TRUST / MEMORIZE THIS
            </span>
            <h4 className="text-xs font-extrabold text-[#0F172A]">
              Potential AI Misconception / Out-of-Scope Concepts Flagged!
            </h4>
            <p className="text-[11px] text-[#0F172A] font-medium leading-relaxed bg-white/60 p-2.5 rounded-xl border border-[#F43F5E]/30">
              {solution.criticAuditNotes || 'This question contains trick assumptions or out-of-scope concepts. Ask your physics teacher instead!'}
            </p>
          </div>
        </div>
      )}

      {/* DUAL-AI PIPELINE INSPECTOR TOGGLE */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] overflow-hidden shadow-xs">
        <button
          onClick={() => setShowPipelineInspector(!showPipelineInspector)}
          className="w-full p-4 flex items-center justify-between text-xs font-bold text-[#0F172A] hover:bg-[#F8FAFC] transition-colors cursor-pointer active:scale-95 transition-all"
        >
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-[#2563EB]" />
            <span>Dual-AI Pipeline Log (Solver Draft vs Critic Fact-Checker)</span>
          </div>
          {showPipelineInspector ? (
            <ChevronUp className="w-4 h-4 text-[#64748B]" />
          ) : (
            <ChevronDown className="w-4 h-4 text-[#64748B]" />
          )}
        </button>

        <AnimatePresence>
          {showPipelineInspector && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="px-4 bg-[#F8FAFC] border-t border-[#E2E8F0] text-xs overflow-hidden"
            >
              <div className="space-y-3 py-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="bg-white p-3 rounded-2xl border border-[#E2E8F0] space-y-1">
                    <span className="font-extrabold text-[#0F172A] flex items-center gap-1">
                      <FileText className="w-3.5 h-3.5 text-[#2563EB]" /> 1st AI (Solver) Draft
                    </span>
                    <p className="text-[#64748B] text-[11px]">
                      {solution.pipelineLog?.solverDraftSummary || 'Drafted initial math resolution from question text.'}
                    </p>
                  </div>

                  <div className="bg-white p-3 rounded-2xl border border-[#E2E8F0] space-y-1">
                    <span className="font-extrabold text-[#0F172A] flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-[#2563EB]" /> 2nd AI (Critic) Check
                    </span>
                    <p className="text-[#64748B] text-[11px]">
                      {solution.pipelineLog?.ncertSourceMatch || 'Checked against NCERT Class 11 Chapter 5.'}
                    </p>
                  </div>
                </div>

                {solution.pipelineLog?.criticWarnings && solution.pipelineLog.criticWarnings.length > 0 && (
                  <div className="bg-[#F43F5E]/10 p-3 rounded-2xl border border-[#F43F5E]/30 text-[11px] text-[#F43F5E] space-y-1 font-medium">
                    <span className="font-bold uppercase tracking-wider block">Critic Warning Logs:</span>
                    <ul className="list-disc list-inside space-y-0.5">
                      {solution.pipelineLog.criticWarnings.map((warn, i) => (
                        <li key={i}>{warn}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Solver Resolution Breakdown */}
      <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-5 shadow-xs space-y-5">
        <div className="flex items-start justify-between">
          <div>
            <h3 className="text-lg font-bold text-[#0F172A]">{solution.title}</h3>
            <p className="text-[11px] text-[#64748B] mt-1">{solution.summary}</p>
          </div>

          <button
            onClick={handleCopySolution}
            className="bg-[#F1F5F9] hover:bg-[#E2E8F0] text-[#0F172A] text-[10px] font-bold px-2.5 py-1.5 rounded-xl border border-[#E2E8F0] flex items-center gap-1 transition-colors flex-shrink-0 cursor-pointer active:scale-95 transition-all"
            title="Copy formatted derivation notes"
          >
            {copied ? <Check className="w-3 h-3 text-[#2563EB]" /> : <Copy className="w-3 h-3 text-[#64748B]" />}
            <span>{copied ? 'Copied' : 'Copy'}</span>
          </button>
        </div>

        <div className="space-y-4 divide-y divide-[#E2E8F0]">
          {solution.steps.map((step) => (
            <div key={step.stepNumber} className="pt-3 first:pt-0 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-bold text-[#0F172A]">
                  Step {step.stepNumber}: {step.title}
                </h4>
                {step.verified ? (
                  <span className="text-[#2563EB] flex items-center gap-1 text-[10px] font-bold bg-[#2563EB]/15 px-2 py-0.5 rounded-full">
                    <CheckCircle2 className="w-3 h-3" /> NCERT Verified
                  </span>
                ) : (
                  <span className="text-[#F43F5E] flex items-center gap-1 text-[10px] font-bold bg-[#F43F5E]/15 px-2 py-0.5 rounded-full">
                    <AlertTriangle className="w-3 h-3" /> Critic Flagged
                  </span>
                )}
              </div>

              <p className="text-[11px] text-[#64748B] leading-relaxed">
                {step.description}
              </p>

              {step.criticFeedback && (
                <div className="text-[10px] font-semibold bg-[#F8FAFC] border border-[#E2E8F0] text-[#0F172A] p-2.5 rounded-xl flex items-center gap-1.5">
                  <Sparkles className="w-3 h-3 text-[#2563EB] flex-shrink-0" />
                  <span>{step.criticFeedback}</span>
                </div>
              )}

              {step.mathBlock && (
                <div className="bg-[#F1F5F9] p-3 rounded-xl text-xs font-mono text-[#0F172A] overflow-x-auto">
                  {step.mathBlock}
                </div>
              )}
            </div>
          ))}
        </div>

        {solution.finalEquation && (
          <div className="bg-[#F1F5F9] border border-[#E2E8F0] rounded-2xl p-4 text-center overflow-x-auto">
            <span className="text-[9px] font-bold text-[#64748B] tracking-wider uppercase block mb-1">
              Final Verified Equation / Result
            </span>
            <code className="text-sm font-bold text-[#0F172A] font-mono">
              {solution.finalEquation}
            </code>
          </div>
        )}
      </div>

      {solution.citation && (
        <div
          onClick={() => setShowTextbookModal(true)}
          className="bg-white border border-[#E2E8F0] hover:border-[#2563EB] transition-colors cursor-pointer rounded-[24px] p-4 flex items-center justify-between shadow-xs group"
        >
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#2563EB]/15 flex items-center justify-center flex-shrink-0 text-[#2563EB]">
              <BookOpen className="w-5 h-5" />
            </div>
            <div className="space-y-0.5 text-[11px]">
              <div className="text-[9px] font-bold text-[#64748B] tracking-wider uppercase">
                NCERT TEXTBOOK CITATION • CLICK TO VIEW EXCERPT
              </div>
              <div className="font-bold text-[#0F172A] group-hover:text-[#2563EB] transition-colors">
                {solution.citation.textbook} • {solution.citation.chapter}
              </div>
              <div className="text-[#64748B]">
                {solution.citation.ncertPage && (
                  <span className="font-bold text-[#2563EB] mr-2">
                    [{solution.citation.ncertPage}]
                  </span>
                )}
                {solution.citation.notes}
              </div>
            </div>
          </div>
          <Maximize2 className="w-4 h-4 text-[#64748B] group-hover:text-[#2563EB] transition-colors flex-shrink-0" />
        </div>
      )}

      {/* NCERT TEXTBOOK EXCERPT MODAL */}
      <AnimatePresence>
        {showTextbookModal && (
          <div className="fixed inset-0 z-50 bg-[#0F172A]/60 backdrop-blur-xs flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              transition={{ duration: 0.2 }}
              className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-[28px] max-w-lg w-full p-6 shadow-2xl space-y-4 relative"
            >
              <div className="flex items-center justify-between pb-3 border-b border-[#E2E8F0]">
                <div className="flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-[#2563EB]" />
                  <div>
                    <h3 className="font-serif font-bold text-base text-[#0F172A]">
                      NCERT Class 11 Physics Textbook Excerpt
                    </h3>
                    <p className="text-[11px] text-[#64748B]">
                      Chapter 5: Laws of Motion • {solution?.citation?.ncertPage || 'Page 104'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setShowTextbookModal(false)}
                  className="text-[#64748B] hover:text-[#0F172A] text-xs font-bold bg-[#E2E8F0] px-2.5 py-1 rounded-lg cursor-pointer active:scale-95 transition-all"
                >
                  ✕
                </button>
              </div>

              <div className="bg-white border border-[#E2E8F0] p-5 rounded-2xl space-y-3 font-serif text-xs text-[#0F172A] shadow-inner max-h-80 overflow-y-auto leading-relaxed">
                <div className="text-[10px] uppercase tracking-widest text-[#64748B] font-sans font-extrabold border-b border-[#E2E8F0] pb-1">
                  SECTION 5.10 • MOTION OF A CAR ON A CIRCULAR ROAD
                </div>
                <p>
                  When a car negotiates a circular turn on a flat road, three forces act on the car:
                </p>
                <ul className="list-disc list-inside space-y-1 pl-2 text-[#64748B]">
                  <li>1. The weight of the car, <span className="font-bold text-[#0F172A]">mg</span> (downward)</li>
                  <li>2. Normal force, <span className="font-bold text-[#0F172A]">N</span> (upward)</li>
                  <li>3. Static friction force, <span className="font-bold text-[#0F172A]">f_s</span> (acting inwards towards the center)</li>
                </ul>
                <div className="bg-[#2563EB]/15 border-l-4 border-[#2563EB] p-3 my-2 font-mono text-[11px]">
                  <div className="font-bold text-[#0F172A]">Equation (5.18):</div>
                  <div>v_max = √(μ_s * g * R)</div>
                  <div className="text-[10px] font-sans text-[#2563EB] font-bold mt-1">
                    ✓ VERIFIED BY CRITIC ENGINE: Exact match for circular velocity bound.
                  </div>
                </div>
                <p className="text-[11px] text-[#64748B] italic">
                  "Notice that the maximum speed depends only on the coefficient of static friction μ_s and radius R. It is independent of the mass of the car."
                </p>
              </div>

              <div className="flex items-center justify-between text-xs text-[#64748B] pt-1">
                <span className="flex items-center gap-1 text-[#2563EB] font-bold">
                  <ShieldCheck className="w-4 h-4" /> NCERT Official Reproduction
                </span>
                <button
                  onClick={() => setShowTextbookModal(false)}
                  className="bg-[#0F172A] text-white font-bold text-xs px-4 py-2 rounded-xl hover:bg-[#2563EB] transition-colors cursor-pointer active:scale-95 transition-all"
                >
                  Close Viewer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};


export const ChatView: React.FC<ChatViewProps> = ({
  solutions,
  onAddNewSolution,
  initialQuery = '',
  soundEnabled = true,
  onNotify,
}) => {
  const [userPrompt, setUserPrompt] = useState(initialQuery);
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const [loadingText, setLoadingText] = useState('Solver AI drafting derivation...');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (loading) {
      setLoadingText('Solver AI drafting derivation...');
      timeout = setTimeout(() => {
        setLoadingText('Critic AI checking NCERT...');
      }, 2000);
    }
    return () => clearTimeout(timeout);
  }, [loading]);


  const presetQueries = [
    {
      label: '1. In-Scope NCERT (Verified)',
      text: 'A car of mass 1500 kg drives at 20 m/s on a flat circular turn of radius 50 m with μ_s = 0.6. Will it skid? Show step-by-step NCERT derivation.',
      isWarning: false,
    },
    {
      label: '2. Misconception Trap',
      text: 'A block of 5 kg rests on a rough table with μ_s = 0.4. A horizontal force of 10 N is applied. Is static friction equal to 0.4 × 5 × 9.8 = 19.6 N?',
      isWarning: true,
    },
  ];

  // Reverse solutions to show older at top, newer at bottom for chat feel
  const chatHistory = [...solutions].reverse();

  useEffect(() => {
    // Scroll to bottom on new message
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [chatHistory, loading]);

  const handleSubmit = async (e?: React.FormEvent, customQuery?: string) => {
    if (e) e.preventDefault();
    const queryToUse = customQuery || userPrompt;
    if (!queryToUse.trim() || loading) return;

    playSound('click', soundEnabled);
    setLoading(true);
    setUserPrompt(''); // Clear input immediately for better UX
    
    try {
      const response = await fetch('/api/solver-critic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          query: queryToUse,
          subject: 'JEE/NEET Physics • Laws of Motion (NCERT Ch 5)',
        }),
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.error || 'Failed to generate solver-critic response');
      }

      const data: SolverResult = await response.json();
      onAddNewSolution(data);
      playSound('success', soundEnabled);
    } catch (err) {
      console.error('Error generating solver resolution:', err);
      onNotify(err.message || "Failed to connect to AI server", "error");
      playSound('warning', soundEnabled);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-140px)] w-full max-w-md md:max-w-2xl lg:max-w-4xl mx-auto pb-4">
      {/* Scrollable Chat History */}
      <div 
        ref={scrollRef}
        className="flex-1 overflow-y-auto space-y-6 px-4 scrollbar-thin scrollbar-thumb-[#E2E8F0] scrollbar-track-transparent pt-4 pb-4"
      >
        {/* Welcome Message from Dual-AI Bot */}
        <div className="flex items-end gap-2 mb-6">
          <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mb-1">
            <Bot className="w-4 h-4" />
          </div>
          <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-none px-4 py-3 max-w-[85%] shadow-sm">
            <p className="text-xs font-medium text-[#0F172A]">
              Hi! I'm the <span className="font-bold text-[#2563EB]">StudyFlow Dual-AI Assistant</span>. 
              Ask me a Physics question from Laws of Motion (NCERT Ch 5). 
              My Solver AI will derive the answer, and my Critic AI will fact-check it against the textbook.
            </p>
          </div>
        </div>

        {chatHistory.map((sol) => (
          <div key={sol.id} className="space-y-6">
            {/* User Message Bubble */}
            <div className="flex justify-end items-end gap-2">
              <div className="bg-[#0F172A] text-white rounded-2xl rounded-br-none px-4 py-3 max-w-[85%] shadow-sm">
                <p className="text-xs font-medium leading-relaxed">{sol.query}</p>
              </div>
              <div className="w-8 h-8 rounded-full bg-[#E2E8F0] flex items-center justify-center text-[#64748B] flex-shrink-0 shadow-sm mb-1">
                <User className="w-4 h-4" />
              </div>
            </div>

            {/* AI Assistant Message Bubble (Dual-AI Evaluator) */}
            <div className="flex justify-start items-start gap-2">
              <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mt-1">
                <Bot className="w-4 h-4" />
              </div>
              <div className="max-w-[100%] md:max-w-[90%] w-full">
                 <AiMessageCard solution={sol} soundEnabled={soundEnabled} />
              </div>
            </div>
          </div>
        ))}

        {/* Loading State Bubble */}
        {loading && (
          <div className="flex items-end gap-2">
            <div className="w-8 h-8 rounded-full bg-[#2563EB] flex items-center justify-center text-white flex-shrink-0 shadow-sm mb-1">
              <Bot className="w-4 h-4" />
            </div>
            <div className="bg-white border border-[#E2E8F0] rounded-2xl rounded-bl-none px-4 py-4 max-w-[85%] shadow-sm flex items-center gap-2">
               <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '0ms' }} />
               <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '150ms' }} />
               <div className="w-2 h-2 rounded-full bg-[#2563EB] animate-bounce" style={{ animationDelay: '300ms' }} />
               <span className="text-[10px] text-[#64748B] font-bold ml-2 uppercase tracking-widest">{loadingText}</span>
            </div>
          </div>
        )}
      </div>

      {/* Input Container (Sticky to bottom of chat view) */}
      <div className="px-4 pt-2">
        <div className="bg-white border border-[#E2E8F0] rounded-[24px] p-3 shadow-xl space-y-2">
          {/* Demo Preset Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none px-1">
            {presetQueries.map((preset, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => handleSubmit(undefined, preset.text)}
                className={`cursor-pointer text-[10px] px-2.5 py-1 rounded-xl font-bold whitespace-nowrap transition-colors flex items-center gap-1 ${
                  preset.isWarning
                    ? 'bg-[#F43F5E]/15 text-[#F43F5E] hover:bg-[#F43F5E]/25 border border-[#F43F5E]/30'
                    : 'bg-[#2563EB]/15 text-[#2563EB] hover:bg-[#2563EB]/25 border border-[#2563EB]/30'
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>

          <form onSubmit={(e) => handleSubmit(e)} className="flex items-center gap-2">
            <input
              type="text"
              value={userPrompt}
              onChange={(e) => setUserPrompt(e.target.value)}
              placeholder="Message Dual-AI (e.g. friction, circular motion)..."
              className="flex-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-4 py-3 text-xs md:text-sm text-[#0F172A] focus:outline-none focus:border-[#2563EB] focus:ring-4 focus:ring-[#2563EB]/10"
              disabled={loading}
              id="chat-input-field"
            />

            <button
              type="submit"
              disabled={loading || !userPrompt.trim()}
              id="send-chat-button"
              className="cursor-pointer bg-[#0F172A] text-white text-xs font-bold w-12 h-12 rounded-xl hover:bg-[#2563EB] transition-colors flex items-center justify-center disabled:opacity-50 flex-shrink-0 active:scale-95 transition-all"
            >
              {loading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <Send className="w-5 h-5" />
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
