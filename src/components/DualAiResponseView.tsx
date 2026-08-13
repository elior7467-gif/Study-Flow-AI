import React from 'react';
import { SolverResult } from '../types';
import { ShieldCheck, AlertTriangle, BookOpen, CheckCircle2, XCircle } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface Props {
  data: SolverResult;
  preprocessMath: (s: string) => string;
}

export const DualAiResponseView: React.FC<Props> = ({ data, preprocessMath }) => {
  const isVerified = data.criticAuditStatus === 'VERIFIED';
  
  return (
    <div className="space-y-4 w-full">
      {/* Badge Header */}
      <div className={`p-4 rounded-2xl flex items-start gap-3 shadow-sm relative overflow-hidden ${isVerified ? 'bg-emerald-500/10 border border-emerald-500/20 shimmer-effect' : 'bg-amber-500/10 border border-amber-500/20'}`}>
        {isVerified ? (
          <ShieldCheck className="w-6 h-6 text-emerald-500 mt-0.5 flex-shrink-0 relative z-10" />
        ) : (
          <AlertTriangle className="w-6 h-6 text-amber-500 mt-0.5 flex-shrink-0 relative z-10" />
        )}
        <div className="relative z-10">
          <h3 className={`font-bold text-sm ${isVerified ? 'text-emerald-600 dark:text-emerald-400' : 'text-amber-600 dark:text-amber-400'}`}>
            {isVerified ? 'Verified by Critic AI' : 'Honest Warning from Critic AI'}
          </h3>
          <p className="text-xs opacity-90 mt-1.5 leading-relaxed">
            {isVerified 
              ? 'This derivation has been line-by-line verified against standard NCERT curriculum.' 
              : data.criticAuditNotes || 'This question involves out-of-scope concepts or tricky assumptions. Do not trust the derivation completely.'}
          </p>
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
      <div className="text-sm font-medium leading-relaxed bg-neo-convex shadow-neo-sm p-4 rounded-2xl">
        {data.summary}
      </div>

      {/* Steps */}
      <div className="space-y-4 mt-4">
        {data.steps.map((step, idx) => (
          <div key={idx} className="bg-neo-convex shadow-neo-sm p-4 rounded-2xl space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between border-b border-black/5 dark:border-white/5 pb-2">
              <span className="text-xs font-bold text-[#2563EB] uppercase tracking-wider">Step {step.stepNumber}: {step.title}</span>
              {step.verified ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
              ) : (
                <XCircle className="w-4 h-4 text-rose-500" />
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
            
            {!step.verified && step.criticFeedback && (
              <div className="mt-2 text-xs text-rose-600 dark:text-rose-400 bg-rose-500/10 p-2.5 rounded-lg border border-rose-500/20 leading-relaxed">
                <strong>Critic Alert:</strong> {step.criticFeedback}
              </div>
            )}
          </div>
        ))}
      </div>

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
