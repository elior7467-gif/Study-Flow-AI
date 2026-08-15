import React, { useState } from 'react';
import { SolverResult } from '../types';
import { ShieldCheck, AlertTriangle, BookOpen, CheckCircle2, XCircle, RefreshCw } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';
import { useAuth } from '@clerk/clerk-react';

interface Props {
  data: SolverResult & { criticAuditStatus?: 'VERIFIED' | 'FLAGGED' | 'VERIFYING' };
  preprocessMath: (s: string) => string;
  userId?: string;
  chatId?: string | null;
  messageId?: string;
  onNotify?: (msg: string, type: 'success' | 'warning' | 'info') => void;
}

export const DualAiResponseView: React.FC<Props> = ({ data, preprocessMath, userId, chatId, messageId, onNotify }) => {
  const isVerified = data.criticAuditStatus === 'VERIFIED';
  const isVerifying = (data.criticAuditStatus as string) === 'VERIFYING';
  
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
      {/* Badge Header */}
      <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-sm relative overflow-hidden ${
        isVerifying 
          ? 'bg-blue-500/10 border border-blue-500/20'
          : isVerified 
            ? 'bg-emerald-500/10 border border-emerald-500/20 shimmer-effect' 
            : 'bg-amber-500/10 border border-amber-500/20'
      }`}>
        {isVerifying ? (
          <RefreshCw className="w-6 h-6 text-blue-500 mt-0.5 flex-shrink-0 relative z-10 animate-spin" />
        ) : isVerified ? (
          <ShieldCheck className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0 relative z-10" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0 relative z-10" />
        )}
        <div className="relative z-10">
          <h3 className={`font-bold text-sm ${
            isVerifying 
              ? 'text-blue-600 dark:text-blue-400'
              : isVerified 
                ? 'text-emerald-600 dark:text-emerald-400' 
                : 'text-amber-600 dark:text-amber-400'
          }`}>
            {isVerifying 
              ? 'Verifying against Ground Truth...' 
              : isVerified 
                ? 'Verified by Critic AI' 
                : 'Honest Warning from Critic AI'}
          </h3>
          <p className="text-xs opacity-90 mt-1.5 leading-relaxed">
            {isVerifying
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
        <div className="bg-neo-concave shadow-neo-inner p-3 rounded-xl flex items-center gap-2 text-xs text-neo opacity-80">
          <BookOpen className="w-4 h-4 text-[#2563EB]" />
          <span>Source: {data.citation.textbook}, {data.citation.chapter} {data.citation.ncertPage && `(Page ${data.citation.ncertPage})`}</span>
        </div>
      )}

      {/* Summary */}
      {data.summary && (
        <div className="text-sm font-medium leading-relaxed bg-neo-convex shadow-neo-sm p-4 rounded-2xl">
          {data.summary}
        </div>
      )}

      {/* Steps */}
      {data.steps && (
        <div className="space-y-4 mt-4">
          {data.steps.map((step, idx) => (
            <div key={idx} className="bg-neo-convex shadow-neo-sm p-4 rounded-2xl space-y-3 relative overflow-hidden">
              <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
                <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Step {step.stepNumber}: {step.title}</span>
                {!isVerifying && (
                  step.verified ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  ) : (
                    <XCircle className="w-4 h-4 text-rose-500" />
                  )
                )}
              </div>
              
              <p className="text-sm leading-relaxed">{step.description}</p>
              
              {step.mathBlock && (
                <div className="bg-neo-concave shadow-neo-inner p-3 rounded-xl overflow-x-auto my-2 text-sm">
                  <ReactMarkdown 
                    remarkPlugins={[remarkGfm, remarkMath]}
                    rehypePlugins={[[rehypeKatex, { strict: false }]]}
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
            rehypePlugins={[[rehypeKatex, { strict: false }]]}
          >
            {preprocessMath(data.finalEquation)}
          </ReactMarkdown>
        </div>
      )}
    </div>
  );
};
