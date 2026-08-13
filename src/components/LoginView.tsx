import React from 'react';
import { motion } from 'motion/react';
import { Bot, ShieldCheck, Sparkles } from 'lucide-react';
import { SignIn } from '@clerk/clerk-react';

interface LoginViewProps {
  soundEnabled: boolean;
}

export const LoginView: React.FC<LoginViewProps> = ({ soundEnabled }) => {


  return (
    <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Decorative background blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-96 h-96 bg-[#2563EB]/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-10%] w-96 h-96 bg-[#F43F5E]/5 rounded-full blur-3xl pointer-events-none" />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="w-full max-w-md bg-white border border-[#E2E8F0] rounded-[32px] p-8 shadow-2xl relative z-10 text-center"
      >
        <div className="w-20 h-20 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-3xl mx-auto flex items-center justify-center shadow-xl mb-6 transform rotate-3">
          <Bot className="w-10 h-10 text-white -rotate-3" />
        </div>

        <h1 className="text-3xl font-extrabold text-[#0F172A] mb-2 tracking-tight">StudyFlow AI</h1>
        <p className="text-[#64748B] font-medium text-sm mb-8 leading-relaxed">
          The only test prep AI with a built-in <span className="font-bold text-[#2563EB]">NCERT Fact-Checker</span>. No hallucinations. Just verified derivations.
        </p>

        <div className="space-y-4 text-left mb-8">
          <div className="flex items-start gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
            <ShieldCheck className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Zero Hallucination Guarantee</div>
              <div className="text-[11px] text-[#64748B]">Critic AI line-audits every step against textbooks.</div>
            </div>
          </div>
          <div className="flex items-start gap-3 bg-[#F8FAFC] p-3 rounded-2xl border border-[#E2E8F0]">
            <Sparkles className="w-5 h-5 text-[#2563EB] flex-shrink-0 mt-0.5" />
            <div>
              <div className="text-xs font-bold text-[#0F172A]">Step-by-Step Derivations</div>
              <div className="text-[11px] text-[#64748B]">Solver AI breaks down complex physics and math.</div>
            </div>
          </div>
        </div>

        <div className="flex justify-center mt-6">
          <SignIn routing="hash" />
        </div>
      </motion.div>
    </div>
  );
};
