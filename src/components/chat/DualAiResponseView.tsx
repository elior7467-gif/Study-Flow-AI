import React, { useState } from 'react';
import { SolverResult } from '../../types';
import { ShieldCheck, AlertTriangle, BookOpen, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import { m } from 'motion/react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAuth } from '@clerk/clerk-react';

interface Props {
  data: Omit<Partial<SolverResult>, 'criticAuditStatus'> & { criticAuditStatus?: 'VERIFIED' | 'FLAGGED' | 'VERIFYING' | 'STREAMING' };
  preprocessMath: (s: string) => string;
  userId?: string;
  chatId?: string | null;
  messageId?: string;
  onNotify?: (msg: string, type: 'success' | 'warning' | 'info') => void;
}

export const DualAiResponseView: React.FC<Props> = React.memo(({ data, preprocessMath, userId, chatId, messageId, onNotify }) => {
  const isVerified = data.criticAuditStatus === 'VERIFIED';
  const isVerifying = data.criticAuditStatus === 'VERIFYING';
  const isStreaming = data.criticAuditStatus === 'STREAMING';
  
  const [isFlagging, setIsFlagging] = useState(false);
  const [isFlagged, setIsFlagged] = useState(false);
  const { getToken } = useAuth();

  const handleFlagForReview = async () => {
    if (!userId || !chatId || !messageId) {
      onNotify?.("Missing chat context to flag message.", "warning");
      return;
    }
    
    setIsFlagging(true);
    try {
      const token = await getToken({ template: 'supabase' });
      const response = await fetch('/api/db/flag-for-review', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          userId,
          chatId,
          messageId,
          question: data.query,
          criticNotes: data.criticAuditNotes
        })
      });
      
      if (!response.ok) throw new Error('Failed to flag message');
      
      setIsFlagged(true);
      onNotify?.("Flagged for Teacher Review successfully!", "success");
    } catch (err) {
      console.error(err);
      onNotify?.("Failed to flag. Please try again.", "warning");
    } finally {
      setIsFlagging(false);
    }
  };
  
  return (
    <div className="space-y-4 w-full">
      {/* First Principles Timeline Visualizer */}
      <div className="bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 p-4 rounded-2xl mb-4">
        <h4 className="text-[10px] font-bold text-zinc-900 dark:text-zinc-50 opacity-80 uppercase tracking-widest mb-3">AI Execution Pipeline</h4>
        <div className="flex items-center justify-between relative">
          {/* Connecting Line */}
          <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-black/5 dark:bg-white/5 -translate-y-1/2 z-0">
             <m.div 
               className="h-full bg-gradient-to-r from-blue-500 to-emerald-500"
               initial={{ width: '0%' }}
               animate={{ width: isVerifying ? '50%' : '100%' }}
               transition={{ duration: 1.5, ease: 'easeInOut' }}
             />
          </div>

          {/* Node 1: First Principles */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-[#09090b] px-2">
            <m.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }}
              className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
            >
              <BookOpen className="w-3 h-3" />
            </m.div>
            <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Concept</span>
          </div>

          {/* Node 2: Derivation */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-[#09090b] px-2">
            <m.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.3 }}
              className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30"
            >
              <RefreshCw className="w-3 h-3" />
            </m.div>
            <span className="text-[9px] font-bold text-zinc-900 dark:text-zinc-50 uppercase tracking-wider">Derivation</span>
          </div>

          {/* Node 3: Critic Review */}
          <div className="relative z-10 flex flex-col items-center gap-2 bg-white dark:bg-[#09090b] px-2">
            <m.div 
              initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.6 }}
              className={`w-6 h-6 rounded-full flex items-center justify-center text-white shadow-lg transition-colors duration-500 ${
                isStreaming ? 'bg-black/5 dark:bg-white/5 text-zinc-900 dark:text-zinc-50/30' : isVerifying ? 'bg-black/10 dark:bg-white/10 text-zinc-900 dark:text-zinc-50' : isVerified ? 'bg-emerald-500 shadow-emerald-500/30' : 'bg-amber-500 shadow-amber-500/30'
              }`}
            >
              {(isVerifying || isStreaming) ? <RefreshCw className={`w-3 h-3 opacity-50 ${isVerifying ? 'animate-spin' : ''}`} /> : isVerified ? <ShieldCheck className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
            </m.div>
            <span className={`text-[9px] font-bold uppercase tracking-wider ${(isVerifying || isStreaming) ? 'text-zinc-900 dark:text-zinc-50 opacity-50' : 'text-zinc-900 dark:text-zinc-50'}`}>Critic</span>
          </div>
        </div>
      </div>

      {/* Badge Header */}
      <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-sm relative overflow-hidden ${
        isVerifying 
          ? 'bg-blue-500/10 border border-blue-500/20'
          : isVerified 
            ? 'bg-emerald-500/10 border border-emerald-500/20 shimmer-effect' 
            : 'bg-amber-500/10 border border-amber-500/20'
      }`}>
        {isStreaming ? (
          <RefreshCw className="w-6 h-6 text-zinc-900 dark:text-zinc-50/30 mt-0.5 flex-shrink-0 relative z-10" />
        ) : isVerifying ? (
          <RefreshCw className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0 relative z-10 animate-spin" />
        ) : isVerified ? (
          <ShieldCheck className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0 relative z-10" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0 relative z-10" />
        )}
        <div className="relative z-10">
          <h3 className={`font-bold text-sm ${
            isStreaming
              ? 'text-zinc-900 dark:text-zinc-50 opacity-70'
              : isVerifying 
                ? 'text-blue-600 dark:text-blue-400'
                : isVerified 
                  ? 'text-emerald-600 dark:text-emerald-400' 
                  : 'text-amber-600 dark:text-amber-400'
          }`}>
            {isStreaming
              ? 'Awaiting Solver to finish...'
              : isVerifying 
                ? 'Verifying against Ground Truth...' 
                : isVerified 
                  ? 'Verified by Critic AI' 
                  : 'Honest Warning from Critic AI'}
          </h3>
          <p className="text-xs opacity-90 mt-1.5 leading-relaxed">
            {isStreaming
              ? 'The Critic AI will begin verification once the derivation is complete.'
              : isVerifying
                ? 'The Critic AI is currently line-by-line verifying this derivation against standard NCERT curriculum.'
                : isVerified 
                  ? 'This derivation has been line-by-line verified against standard NCERT curriculum.' 
                  : data.criticAuditNotes || 'This question involves out-of-scope concepts or tricky assumptions. Do not trust the derivation completely.'}
          </p>
          {!isVerified && !isVerifying && onNotify && userId && (
            <button 
              onClick={handleFlagForReview}
              disabled={isFlagging || isFlagged}
              className={`mt-3 px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isFlagged 
                  ? 'bg-amber-500/20 text-amber-600 dark:text-amber-400 opacity-70 cursor-not-allowed' 
                  : 'bg-amber-500 text-white shadow-sm hover:bg-amber-600 active:scale-95'
              }`}
            >
              {isFlagging ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              ) : isFlagged ? (
                <ShieldCheck className="w-3.5 h-3.5" />
              ) : (
                <AlertTriangle className="w-3.5 h-3.5" />
              )}
              {isFlagged ? 'Flagged for Teacher' : 'Flag for Teacher Review'}
            </button>
          )}
        </div>
      </div>

      {/* Citation if verified */}
      {isVerified && data.citation && (
        <div className="bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl flex items-center gap-2 text-xs text-zinc-900 dark:text-zinc-50 opacity-80">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <span>Source: {data.citation.textbook}, {data.citation.chapter} {data.citation.ncertPage && `(Page ${data.citation.ncertPage})`}</span>
        </div>
      )}

      {/* Summary */}
      {/* Derivation Title */}
      <h2 className="font-bold text-xl mb-3 pr-8 relative">
        {data.title || 'Solving...'}
        {isStreaming && <span className="absolute ml-2 animate-pulse bg-white dark:bg-[#09090b] w-2 h-5 inline-block top-1"></span>}
      </h2>
      
      {data.summary && (
        <p className="text-sm opacity-80 mb-6 leading-relaxed">
          {data.summary}
        </p>
      )}

      {/* Steps */}
      {data.steps && data.steps.length > 0 && (
        <div className="space-y-4">
          {data.steps.map((step: any, idx: number) => (
            <div key={idx} className="bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 p-4 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Step {step.stepNumber || idx + 1}: {step.title || 'Step'}</span>
                {!isVerifying && !isStreaming && (
                  step.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )
                )}
              </div>
              
              {step.description && <p className="text-sm leading-relaxed">{step.description}</p>}
              
              {step.mathBlock && (
                <div className="bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 p-3 rounded-xl overflow-x-auto my-2 text-sm">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
                  >
                    {preprocessMath(step.mathBlock)}
                  </ReactMarkdown>
                </div>
              )}
              
              {!isVerifying && !step.verified && step.criticFeedback && (
                <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed">
                  <strong>Critic Alert:</strong> {step.criticFeedback}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Final Equation */}
      {data.finalEquation && (
        <div className="mt-4 p-4 rounded-2xl bg-[#2563EB]/5 border border-[#2563EB]/20 text-center shadow-sm">
          <ReactMarkdown 
            remarkPlugins={[remarkGfm, remarkMath]}
            rehypePlugins={[[rehypeKatex, { strict: false, throwOnError: false }]]}
          >
            {preprocessMath(data.finalEquation)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
}, (prevProps, nextProps) => {
  return prevProps.messageId === nextProps.messageId && 
         prevProps.userId === nextProps.userId &&
         prevProps.chatId === nextProps.chatId &&
         prevProps.onNotify === nextProps.onNotify &&
         prevProps.preprocessMath === nextProps.preprocessMath &&
         JSON.stringify(prevProps.data) === JSON.stringify(nextProps.data);
});
