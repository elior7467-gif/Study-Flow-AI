import React, { useEffect, useState } from 'react';
import { m, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Bot, ShieldCheck, Sparkles, Moon, Sun, Box, LineChart, ChevronRight } from 'lucide-react';
import { SignIn, SignUp } from '@clerk/clerk-react';
import { dark } from '@clerk/themes';

interface LoginViewProps {
  soundEnabled: boolean;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({ soundEnabled, isDarkMode, onToggleDarkMode }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  const smoothMouseX = useSpring(mouseX, { stiffness: 150, damping: 25 });
  const smoothMouseY = useSpring(mouseY, { stiffness: 150, damping: 25 });
  
  const leftColX = useTransform(smoothMouseX, (v) => v * -1);
  const leftColY = useTransform(smoothMouseY, (v) => v * -1);
  const [isSignUp, setIsSignUp] = useState(() => window.location.hash.includes('sign-up'));

  useEffect(() => {
    const handleHashChange = () => setIsSignUp(window.location.hash.includes('sign-up'));
    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  useEffect(() => {
    let rafId: number;
    const handleMouseMove = (e: MouseEvent) => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(() => {
        mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
        mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
      });
    };
    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      cancelAnimationFrame(rafId);
    };
  }, []);

  // Floating animation variants
  const floatVariants = {
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  const glowVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.3, 0.6, 0.3],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut" as const
      }
    }
  };

  return (
    <div className="h-full w-full min-h-[100dvh] bg-white dark:bg-[#09090b] relative overflow-x-hidden overflow-y-auto perspective-1000 scroll-smooth">
      {/* Decorative background blobs with impressive animations */}
      <m.div 
        variants={glowVariants}
        animate="animate"
        className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#2563EB]/15 rounded-full blur-[120px] pointer-events-none transform-gpu will-change-transform" 
      />
      <m.div 
        variants={glowVariants}
        animate="animate"
        className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#F43F5E]/10 rounded-full blur-[120px] pointer-events-none transform-gpu will-change-transform"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Grid Pattern overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLW9wYWNpdHk9IjAuMDQiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />

      {/* Dark Mode Toggle Button */}
      {onToggleDarkMode && (
        <button
          onClick={onToggleDarkMode}
          className="fixed top-4 right-4 z-50 p-3 bg-white/80 dark:bg-[#09090b]/80 backdrop-blur-md border border-slate-200 dark:border-white/10 shadow-sm rounded-full hover:scale-110 hover:shadow-md transition-all duration-300 group"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? 
            <Sun className="w-5 h-5 text-amber-500 group-hover:rotate-45 transition-transform duration-300" /> : 
            <Moon className="w-5 h-5 text-indigo-500 group-hover:-rotate-12 transition-transform duration-300" />
          }
        </button>
      )}

      {/* Hero Content Wrapper */}
      <div className="w-full max-w-7xl mx-auto flex flex-col lg:flex-row items-start justify-between p-4 sm:p-6 lg:p-8 z-10 pt-16 lg:pt-20 pb-16 lg:pb-24 relative gap-12 lg:gap-8">
        
        {/* Left Column: Branding & Features */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col justify-start mb-12 lg:mb-0 lg:pr-12 relative">
          <m.div
            initial={{ opacity: 0, x: -40, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            style={{ 
              x: leftColX, 
              y: leftColY 
            }}
          >
            <m.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6 sm:mb-8 text-xs sm:text-sm font-semibold tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>StudyFlow AI 2.0 is Here</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 ml-1" />
            </m.div>

            <m.div 
              variants={floatVariants}
              animate="animate"
              className="w-20 h-20 sm:w-24 sm:h-24 rounded-[28px] sm:rounded-[32px] flex items-center justify-center shadow-sm border border-[#2563EB]/20 mb-6 sm:mb-8 transform -rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-500 ease-out cursor-pointer overflow-hidden bg-zinc-100 dark:bg-white/[0.06]"
            >
              <img src="/logo.jpg" alt="StudyFlow AI" className="w-full h-full object-cover" />
            </m.div>

            <m.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-4 sm:mb-6 tracking-tight leading-[1.1]"
            >
              Master your exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">StudyFlow AI</span>
            </m.h1>
            <m.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-zinc-900 dark:text-zinc-50 opacity-80 font-medium text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 leading-relaxed max-w-md"
            >
              The only test prep AI with a built-in <span className="font-bold text-[#2563EB]">Fact-Checker</span>. No hallucinations. Just verified derivations.
            </m.p>

            <div className="space-y-4 sm:space-y-6 relative hidden sm:block">
              {/* Connecting line */}
              <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gradient-to-b from-[#2563EB] to-transparent opacity-20 hidden md:block"></div>
              
              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-sm border border-[#2563EB] hover:-translate-y-1 transition-all duration-300 border border-[rgba(0,0,0,0.05)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 group-hover:text-[#2563EB] transition-colors">Zero Hallucination Guarantee</div>
                  <div className="text-sm sm:text-[15px] text-zinc-900 dark:text-zinc-50 opacity-75 leading-snug">Critic AI line-audits every step against textbooks to ensure absolute accuracy.</div>
                </div>
              </m.div>
              
              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-sm border border-[#2563EB] hover:-translate-y-1 transition-all duration-300 border border-[rgba(0,0,0,0.05)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 group-hover:text-[#2563EB] transition-colors">Step-by-Step Derivations</div>
                  <div className="text-sm sm:text-[15px] text-zinc-900 dark:text-zinc-50 opacity-75 leading-snug">Solver AI breaks down complex scientific problems into easy, understandable chunks.</div>
                </div>
              </m.div>

              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-sm border border-[#2563EB] hover:-translate-y-1 transition-all duration-300 border border-[rgba(0,0,0,0.05)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <Box className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 group-hover:text-[#2563EB] transition-colors">Interactive Vault</div>
                  <div className="text-sm sm:text-[15px] text-zinc-900 dark:text-zinc-50 opacity-75 leading-snug">Visualize complex concepts with interactive 3D simulators and comprehensive study tools.</div>
                </div>
              </m.div>

              <m.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 shadow-sm hover:shadow-sm border border-[#2563EB] hover:-translate-y-1 transition-all duration-300 border border-[rgba(0,0,0,0.05)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 flex items-center justify-center flex-shrink-0 bg-zinc-50/50 dark:bg-zinc-900/50 relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <LineChart className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-1.5 group-hover:text-[#2563EB] transition-colors">Smart Analytics</div>
                  <div className="text-sm sm:text-[15px] text-zinc-900 dark:text-zinc-50 opacity-75 leading-snug">Track your learning progress, identify weak spots, and optimize your study sessions.</div>
                </div>
              </m.div>
            </div>
          </m.div>
        </div>

        {/* Right Column: Sign In Component */}
        <m.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full lg:w-1/2 max-w-[440px] z-10"
          style={{ 
            x: smoothMouseX, 
            y: smoothMouseY 
          }}
        >
          <div className="bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 shadow-sm border border-[#2563EB] rounded-[32px] sm:rounded-[40px] p-2 sm:p-3 border border-[rgba(0,0,0,0.05)] relative group">
            {/* Subtle animated border glow */}
            <div className="absolute inset-0 rounded-[32px] sm:rounded-[40px] bg-gradient-to-r from-[#2563EB] to-[#F43F5E] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-700 pointer-events-none" />
            
            <div className="bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 bg-zinc-50/50 dark:bg-zinc-900/50 flex justify-center relative z-10 overflow-hidden">
              {isSignUp ? (
                <SignUp 
                  routing="hash" 
                  forceRedirectUrl="/"
                  signInUrl="#/sign-in"
                  appearance={{
                    baseTheme: isDarkMode ? dark : undefined,
                    elements: {
                      rootBox: "w-full flex justify-center",
                      card: "shadow-none bg-transparent m-0 p-0 w-full max-w-full sm:max-w-sm",
                      headerTitle: "text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-1 sm:mb-2",
                      headerSubtitle: "text-zinc-900 dark:text-zinc-50 opacity-70 text-sm sm:text-base font-medium",
                      socialButtonsBlockButton: "bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 border-none text-zinc-900 dark:text-zinc-50 hover:bg-white dark:bg-[#09090b] hover:shadow-sm border border-black/5 dark:border-white/5 transition-all rounded-xl sm:rounded-2xl h-10 sm:h-12 mb-2 sm:mb-3",
                      socialButtonsBlockButtonText: "font-bold text-sm text-zinc-900 dark:text-zinc-50",
                      socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
                      dividerLine: "bg-[var(--neo-shadow-dark)] opacity-40",
                      dividerText: "text-zinc-900 dark:text-zinc-50 opacity-50 font-medium text-xs sm:text-sm",
                      formFieldLabel: "text-zinc-900 dark:text-zinc-50 font-bold text-xs sm:text-sm mb-1 sm:mb-1.5",
                      formFieldInput: "bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-xl sm:rounded-2xl text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-[#2563EB] h-10 sm:h-12 px-3 sm:px-4 transition-shadow text-sm",
                      formButtonPrimary: "bg-gradient-to-r from-[#2563EB] to-[#1E40AF] shadow-sm border border-[#2563EB] border-none rounded-xl sm:rounded-2xl text-white hover:opacity-90 hover:scale-[1.02] transition-all h-10 sm:h-12 font-extrabold text-sm sm:text-base mt-1 sm:mt-2 active:scale-[0.98]",
                      footerAction: "text-zinc-900 dark:text-zinc-50 bg-transparent",
                      footerActionText: "text-zinc-900 dark:text-zinc-50 opacity-70 font-medium text-xs sm:text-sm",
                      footerActionLink: "text-[#2563EB] hover:text-[#1E40AF] font-bold ml-1 transition-colors text-xs sm:text-sm",
                      identityPreviewText: "text-zinc-900 dark:text-zinc-50 font-medium text-sm",
                      identityPreviewEditButton: "text-[#2563EB] hover:text-[#1E40AF]",
                      formFieldSuccessText: "text-green-600 font-medium text-xs",
                      formFieldErrorText: "text-red-500 font-medium text-xs mt-1",
                      alert: "bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 border-none text-zinc-900 dark:text-zinc-50 rounded-lg sm:rounded-xl text-sm",
                      footer: "bg-transparent border-none mt-4 sm:mt-6",
                      header: "mb-4 sm:mb-6",
                      form: "gap-3 sm:gap-4",
                      formFieldRow: "mb-2 sm:mb-4",
                    },
                    layout: {
                      socialButtonsPlacement: "top",
                      socialButtonsVariant: "blockButton",
                    }
                  }}
                />
              ) : (
                <SignIn 
                  routing="hash" 
                  forceRedirectUrl="/"
                  signUpForceRedirectUrl="/"
                  signUpUrl="#/sign-up"
                  appearance={{
                    baseTheme: isDarkMode ? dark : undefined,
                    elements: {
                      rootBox: "w-full flex justify-center",
                      card: "shadow-none bg-transparent m-0 p-0 w-full max-w-full sm:max-w-sm",
                      headerTitle: "text-2xl sm:text-3xl font-extrabold text-zinc-900 dark:text-zinc-50 mb-1 sm:mb-2",
                      headerSubtitle: "text-zinc-900 dark:text-zinc-50 opacity-70 text-sm sm:text-base font-medium",
                      socialButtonsBlockButton: "bg-white dark:bg-[#09090b] border border-black/5 dark:border-white/5 border-none text-zinc-900 dark:text-zinc-50 hover:bg-white dark:bg-[#09090b] hover:shadow-sm border border-black/5 dark:border-white/5 transition-all rounded-xl sm:rounded-2xl h-10 sm:h-12 mb-2 sm:mb-3",
                      socialButtonsBlockButtonText: "font-bold text-sm text-zinc-900 dark:text-zinc-50",
                      socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
                      dividerLine: "bg-[var(--neo-shadow-dark)] opacity-40",
                      dividerText: "text-zinc-900 dark:text-zinc-50 opacity-50 font-medium text-xs sm:text-sm",
                      formFieldLabel: "text-zinc-900 dark:text-zinc-50 font-bold text-xs sm:text-sm mb-1 sm:mb-1.5",
                      formFieldInput: "bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 border-none rounded-xl sm:rounded-2xl text-zinc-900 dark:text-zinc-50 focus:ring-2 focus:ring-[#2563EB] h-10 sm:h-12 px-3 sm:px-4 transition-shadow text-sm",
                      formButtonPrimary: "bg-gradient-to-r from-[#2563EB] to-[#1E40AF] shadow-sm border border-[#2563EB] border-none rounded-xl sm:rounded-2xl text-white hover:opacity-90 hover:scale-[1.02] transition-all h-10 sm:h-12 font-extrabold text-sm sm:text-base mt-1 sm:mt-2 active:scale-[0.98]",
                      footerAction: "text-zinc-900 dark:text-zinc-50 bg-transparent",
                      footerActionText: "text-zinc-900 dark:text-zinc-50 opacity-70 font-medium text-xs sm:text-sm",
                      footerActionLink: "text-[#2563EB] hover:text-[#1E40AF] font-bold ml-1 transition-colors text-xs sm:text-sm",
                      identityPreviewText: "text-zinc-900 dark:text-zinc-50 font-medium text-sm",
                      identityPreviewEditButton: "text-[#2563EB] hover:text-[#1E40AF]",
                      formFieldSuccessText: "text-green-600 font-medium text-xs",
                      formFieldErrorText: "text-red-500 font-medium text-xs mt-1",
                      alert: "bg-zinc-50 dark:bg-zinc-900 border border-black/5 dark:border-white/5 bg-zinc-50/50 dark:bg-zinc-900/50 border-none text-zinc-900 dark:text-zinc-50 rounded-lg sm:rounded-xl text-sm",
                      footer: "bg-transparent border-none mt-4 sm:mt-6",
                      header: "mb-4 sm:mb-6",
                      form: "gap-3 sm:gap-4",
                      formFieldRow: "mb-2 sm:mb-4",
                    },
                    layout: {
                      socialButtonsPlacement: "top",
                      socialButtonsVariant: "blockButton",
                    }
                  }}
                />
              )}
            </div>
          </div>
        </m.div>
      </div>

      {/* NEW BENTO GRID SECTION */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16 z-10 relative">
        <div className="mb-10 text-center max-w-2xl mx-auto">
          <div className="inline-block px-3 py-1 mb-4 rounded-full bg-zinc-100 dark:bg-white/5 border border-black/5 dark:border-white/10 text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-900 dark:text-zinc-300">
            Next-Gen Learning
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight leading-tight">
            An entire academic ecosystem <br className="hidden sm:block"/> <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">in one unified platform.</span>
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[280px]">
          
          {/* Bento Card 1 - Large */}
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: [0.32, 0.72, 0, 1] }}
            className="md:col-span-8 group relative rounded-[2rem] bg-zinc-50 dark:bg-[#0E0E10] border border-black/5 dark:border-white/10 p-2 overflow-hidden hover:shadow-xl transition-shadow duration-700"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
            <div className="h-full rounded-[calc(2rem-8px)] bg-white dark:bg-[#151518] border border-black/5 dark:border-white/5 p-8 relative flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
               
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-blue-500/10 flex items-center justify-center mb-4">
                   <Bot className="w-6 h-6 text-blue-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Dual-AI Architecture</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm">Two neural models working in tandem. One solves the problem, the other mathematically verifies every single step against textbook axioms.</p>
               </div>

               {/* Decorative Graphic */}
               <div className="absolute right-0 bottom-0 w-64 h-64 translate-x-16 translate-y-16 opacity-30 dark:opacity-20 pointer-events-none group-hover:scale-105 transition-transform duration-700 transform-gpu will-change-transform">
                 <div className="w-full h-full border-[20px] border-blue-500 rounded-full blur-2xl transform-gpu" />
               </div>
            </div>
          </m.div>

          {/* Bento Card 2 - Small */}
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.1, ease: [0.32, 0.72, 0, 1] }}
            className="md:col-span-4 group relative rounded-[2rem] bg-zinc-50 dark:bg-[#0E0E10] border border-black/5 dark:border-white/10 p-2 overflow-hidden hover:shadow-xl transition-shadow duration-700"
          >
            <div className="h-full rounded-[calc(2rem-8px)] bg-white dark:bg-[#151518] border border-black/5 dark:border-white/5 p-8 relative flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-amber-500/10 flex items-center justify-center mb-4">
                   <Moon className="w-6 h-6 text-amber-500" />
                 </div>
                 <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Beautiful Dark Mode</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm">Engineered for late-night study sessions with perfect OLED contrast.</p>
               </div>
            </div>
          </m.div>

          {/* Bento Card 3 - Medium */}
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.2, ease: [0.32, 0.72, 0, 1] }}
            className="md:col-span-5 group relative rounded-[2rem] bg-zinc-50 dark:bg-[#0E0E10] border border-black/5 dark:border-white/10 p-2 overflow-hidden hover:shadow-xl transition-shadow duration-700"
          >
            <div className="h-full rounded-[calc(2rem-8px)] bg-white dark:bg-[#151518] border border-black/5 dark:border-white/5 p-8 relative flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center mb-4">
                   <LineChart className="w-6 h-6 text-emerald-500" />
                 </div>
                 <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Mastery Tracking</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 text-sm">Longitudinal analytics that track your cognitive progress across every topic and chapter.</p>
               </div>
            </div>
          </m.div>

          {/* Bento Card 4 - Large */}
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, delay: 0.3, ease: [0.32, 0.72, 0, 1] }}
            className="md:col-span-7 group relative rounded-[2rem] bg-zinc-50 dark:bg-[#0E0E10] border border-black/5 dark:border-white/10 p-2 overflow-hidden hover:shadow-xl transition-shadow duration-700"
          >
            <div className="h-full rounded-[calc(2rem-8px)] bg-white dark:bg-[#151518] border border-black/5 dark:border-white/5 p-8 relative flex flex-col justify-between overflow-hidden shadow-[inset_0_1px_1px_rgba(255,255,255,0.05)]">
               <div className="relative z-10">
                 <div className="w-12 h-12 rounded-2xl bg-purple-500/10 flex items-center justify-center mb-4">
                   <Box className="w-6 h-6 text-purple-500" />
                 </div>
                 <h3 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-2">Interactive 3D Vault</h3>
                 <p className="text-zinc-500 dark:text-zinc-400 max-w-sm text-sm">Don't just read about physics—experience it. Interactive simulations map directly to your curriculum.</p>
               </div>
               
               <div className="absolute right-0 bottom-0 w-48 h-48 translate-x-8 translate-y-8 opacity-40 dark:opacity-20 pointer-events-none group-hover:scale-110 transition-transform duration-1000 ease-[cubic-bezier(0.32,0.72,0,1)] transform-gpu will-change-transform">
                 <div className="w-full h-full bg-gradient-to-tr from-purple-500 to-transparent blur-3xl rounded-full transform-gpu" />
               </div>
            </div>
          </m.div>

        </div>
      </div>

      {/* HOW IT WORKS SECTION */}
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 z-10 relative border-t border-black/5 dark:border-white/5">
        <m.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">How StudyFlow Works</h2>
          <p className="mt-4 text-base sm:text-lg text-zinc-500 dark:text-zinc-400 max-w-xl mx-auto">From confusion to complete mastery in three simple steps.</p>
        </m.div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12 relative">
          <div className="hidden md:block absolute top-12 left-1/6 right-1/6 h-px bg-gradient-to-r from-transparent via-blue-500/20 to-transparent -z-10" />
          
          {[
            {
              step: "1",
              title: "Upload or Type",
              desc: "Snap a photo of your homework or type out your conceptual question.",
              color: "blue"
            },
            {
              step: "2",
              title: "AI Solves & Audits",
              desc: "Our Solver model breaks it down, while the Critic model verifies every step against NCERT.",
              color: "purple"
            },
            {
              step: "3",
              title: "Track Mastery",
              desc: "Every interaction builds your longitudinal analytics profile to highlight weak spots.",
              color: "emerald"
            }
          ].map((item, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.7, delay: i * 0.2, ease: [0.32, 0.72, 0, 1] }}
              className="text-center group"
            >
              <div className={`w-20 h-20 mx-auto bg-${item.color}-50 dark:bg-${item.color}-900/10 rounded-[24px] flex items-center justify-center text-${item.color}-600 dark:text-${item.color}-400 font-bold text-2xl mb-8 shadow-sm border border-${item.color}-500/20 group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500 ease-out`}>
                {item.step}
              </div>
              <h3 className="text-xl font-bold text-zinc-900 dark:text-zinc-50 mb-3">{item.title}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-base leading-relaxed">{item.desc}</p>
            </m.div>
          ))}
        </div>
      </div>

      {/* WALL OF LOVE (TESTIMONIALS) */}
      <div className="w-full bg-zinc-50 dark:bg-[#0A0A0B] py-16 lg:py-20 z-10 relative border-t border-black/5 dark:border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <m.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Trusted by Students</h2>
          </m.div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
            {[
              {
                text: "The dual-AI checking is incredible. Regular ChatGPT makes up formulas for Physics sometimes, but StudyFlow actually corrects itself mid-explanation. Saved my grades.",
                name: "Rahul S.",
                title: "Class 11 CBSE",
                color: "blue"
              },
              {
                text: "I love the interactive vault. Being able to visualize kinematics in 3D right next to the chat makes understanding the concepts so much easier.",
                name: "Ananya P.",
                title: "JEE Aspirant",
                color: "emerald"
              },
              {
                text: "The analytics dashboard is a game changer. It literally tells me I'm weak at Rotational Mechanics before I even take a mock test.",
                name: "Karan M.",
                title: "NEET Aspirant",
                color: "rose"
              }
            ].map((t, i) => (
              <m.div 
                key={i}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-50px" }}
                transition={{ duration: 0.7, delay: i * 0.2, ease: [0.32, 0.72, 0, 1] }}
                className="bg-white dark:bg-[#151518] p-8 rounded-[32px] shadow-lg shadow-black/5 dark:shadow-none border border-black/5 dark:border-white/5 hover:-translate-y-2 transition-transform duration-500 ease-out"
              >
                <div className="flex text-amber-400 mb-6 text-xl">{"★★★★★"}</div>
                <p className="text-zinc-700 dark:text-zinc-300 mb-8 text-base leading-relaxed italic">"{t.text}"</p>
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-2xl bg-${t.color}-500/10 flex items-center justify-center text-${t.color}-500 font-bold text-xl`}>
                    {t.name[0]}
                  </div>
                  <div>
                    <div className="text-base font-bold text-zinc-900 dark:text-zinc-50">{t.name}</div>
                    <div className="text-sm text-zinc-500">{t.title}</div>
                  </div>
                </div>
              </m.div>
            ))}
          </div>
        </div>
      </div>

      {/* FREQUENTLY ASKED QUESTIONS */}
      <div className="w-full max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-20 z-10 relative">
        <m.div 
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.7 }}
          className="text-center mb-12"
        >
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">Got Questions?</h2>
        </m.div>

        <div className="space-y-6">
          {[
            { q: "Is StudyFlow AI free?", a: "Yes, the core solver and basic analytics are completely free to use. Premium features like 3D simulations are available in the Vault." },
            { q: "How is this different from ChatGPT?", a: "StudyFlow uses a Dual-AI architecture. While one AI generates the solution, a separate Critic AI mathematically audits every step against verified textbook axioms to ensure zero hallucinations." },
            { q: "Does it work for college level?", a: "Absolutely. StudyFlow is optimized for high school (CBSE/JEE/NEET) and undergraduate level physics, chemistry, and mathematics." }
          ].map((faq, i) => (
            <m.div 
              key={i}
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.5, delay: i * 0.15, ease: [0.32, 0.72, 0, 1] }}
              className="bg-white dark:bg-[#0E0E10] border border-black/5 dark:border-white/10 p-6 rounded-[24px] shadow-sm hover:shadow-md transition-shadow"
            >
              <h3 className="text-lg font-bold text-zinc-900 dark:text-zinc-50 mb-2">{faq.q}</h3>
              <p className="text-zinc-500 dark:text-zinc-400 text-sm leading-relaxed">{faq.a}</p>
            </m.div>
          ))}
        </div>
      </div>

      {/* FOOTER */}
      <footer className="w-full bg-white dark:bg-[#09090b] py-12 border-t border-black/5 dark:border-white/5 z-10 relative">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg overflow-hidden bg-zinc-100 dark:bg-white/[0.06] flex items-center justify-center border border-black/5 dark:border-white/5">
              <img src="/logo.jpg" alt="StudyFlow AI" className="w-full h-full object-cover" />
            </div>
            <span className="font-extrabold text-zinc-900 dark:text-zinc-50 tracking-tight">StudyFlow AI</span>
          </div>
          <div className="flex gap-6 text-sm font-medium text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-300 transition-colors cursor-pointer">
            <span>Privacy Policy</span>
            <span>Terms of Service</span>
            <span>Contact Support</span>
          </div>
          <div className="text-xs text-zinc-400">
            &copy; {new Date().getFullYear()} StudyFlow AI. All rights reserved.
          </div>
        </div>
      </footer>

    </div>
  );
};
