import React, { useEffect, useState } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'motion/react';
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
    const handleMouseMove = (e: MouseEvent) => {
      mouseX.set((e.clientX / window.innerWidth - 0.5) * 20);
      mouseY.set((e.clientY / window.innerHeight - 0.5) * 20);
    };
    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
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
    <div className="min-h-[100dvh] bg-neo flex relative overflow-x-hidden overflow-y-auto perspective-1000">
      {/* Decorative background blobs with impressive animations */}
      <motion.div 
        variants={glowVariants}
        animate="animate"
        className="fixed top-[-10%] left-[-10%] w-[600px] h-[600px] bg-[#2563EB]/15 rounded-full blur-[120px] pointer-events-none" 
      />
      <motion.div 
        variants={glowVariants}
        animate="animate"
        className="fixed bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-[#F43F5E]/10 rounded-full blur-[120px] pointer-events-none"
        style={{ animationDelay: '2s' }}
      />
      
      {/* Grid Pattern overlay */}
      <div className="fixed inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCI+PGRlZnM+PHBhdHRlcm4gaWQ9ImdyaWQiIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgcGF0dGVyblVuaXRzPSJ1c2VyU3BhY2VPblVzZSI+PHBhdGggZD0iTSAwIDQwIEwgNDAgNDAgNDAgMCIgZmlsbD0ibm9uZSIgc3Ryb2tlPSJibGFjayIgc3Ryb2tlLW9wYWNpdHk9IjAuMDQiIHN0cm9rZS13aWR0aD0iMSIvPjwvcGF0dGVybj48L2RlZnM+PHJlY3Qgd2lkdGg9IjEwMCUiIGhlaWdodD0iMTAwJSIgZmlsbD0idXJsKCNncmlkKSIvPjwvc3ZnPg==')] opacity-50 pointer-events-none" />

      {/* Dark Mode Toggle Button */}
      {onToggleDarkMode && (
        <button
          onClick={onToggleDarkMode}
          className="fixed top-4 right-4 z-50 p-2 sm:p-3 bg-neo-convex shadow-neo rounded-full hover:shadow-neo-accent transition-all duration-300"
          aria-label="Toggle Dark Mode"
        >
          {isDarkMode ? <Sun className="w-5 h-5 text-amber-500" /> : <Moon className="w-5 h-5 text-indigo-500" />}
        </button>
      )}

      {/* Content Wrapper */}
      <div className="m-auto w-full max-w-7xl flex flex-col lg:flex-row items-center justify-center p-4 sm:p-6 lg:p-8 z-10 py-12 lg:py-16">
        
        {/* Left Column: Branding & Features */}
        <div className="w-full lg:w-1/2 max-w-xl flex flex-col justify-center mb-12 lg:mb-0 lg:pr-12 relative">
          <motion.div
            initial={{ opacity: 0, x: -40, rotateY: 10 }}
            animate={{ opacity: 1, x: 0, rotateY: 0 }}
            transition={{ duration: 0.8, ease: [0.25, 0.8, 0.25, 1] }}
            style={{ 
              x: leftColX, 
              y: leftColY 
            }}
          >
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 px-3 py-1.5 sm:px-4 sm:py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-600 dark:text-blue-400 mb-6 sm:mb-8 text-xs sm:text-sm font-semibold tracking-wide"
            >
              <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              <span>StudyFlow AI 2.0 is Here</span>
              <ChevronRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 opacity-70 ml-1" />
            </motion.div>

            <motion.div 
              variants={floatVariants}
              animate="animate"
              className="w-20 h-20 sm:w-24 sm:h-24 bg-gradient-to-br from-[#2563EB] to-[#1E40AF] rounded-[28px] sm:rounded-[32px] flex items-center justify-center shadow-neo-accent mb-6 sm:mb-8 transform -rotate-3 hover:rotate-0 hover:scale-110 transition-all duration-500 ease-out cursor-pointer"
            >
              <Bot className="w-10 h-10 sm:w-12 sm:h-12 text-white" />
            </motion.div>

            <motion.h1 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-extrabold text-neo mb-4 sm:mb-6 tracking-tight leading-[1.1]"
            >
              Master your exams with <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#2563EB] to-[#60A5FA]">StudyFlow AI</span>
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="text-neo opacity-80 font-medium text-base sm:text-lg lg:text-xl mb-8 sm:mb-12 leading-relaxed max-w-md"
            >
              The only test prep AI with a built-in <span className="font-bold text-[#2563EB]">Fact-Checker</span>. No hallucinations. Just verified derivations.
            </motion.p>

            <div className="space-y-4 sm:space-y-6 relative hidden sm:block">
              {/* Connecting line */}
              <div className="absolute left-7 top-7 bottom-7 w-0.5 bg-gradient-to-b from-[#2563EB] to-transparent opacity-20 hidden md:block"></div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-neo-convex shadow-neo hover:shadow-neo-accent hover:-translate-y-1 transition-all duration-300 border border-[var(--neo-border)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-neo-concave flex items-center justify-center flex-shrink-0 shadow-neo-inner relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <ShieldCheck className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-neo mb-1.5 group-hover:text-[#2563EB] transition-colors">Zero Hallucination Guarantee</div>
                  <div className="text-sm sm:text-[15px] text-neo opacity-75 leading-snug">Critic AI line-audits every step against textbooks to ensure absolute accuracy.</div>
                </div>
              </motion.div>
              
              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.5 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-neo-convex shadow-neo hover:shadow-neo-accent hover:-translate-y-1 transition-all duration-300 border border-[var(--neo-border)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-neo-concave flex items-center justify-center flex-shrink-0 shadow-neo-inner relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-neo mb-1.5 group-hover:text-[#2563EB] transition-colors">Step-by-Step Derivations</div>
                  <div className="text-sm sm:text-[15px] text-neo opacity-75 leading-snug">Solver AI breaks down complex scientific problems into easy, understandable chunks.</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-neo-convex shadow-neo hover:shadow-neo-accent hover:-translate-y-1 transition-all duration-300 border border-[var(--neo-border)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-neo-concave flex items-center justify-center flex-shrink-0 shadow-neo-inner relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <Box className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-neo mb-1.5 group-hover:text-[#2563EB] transition-colors">Interactive Vault</div>
                  <div className="text-sm sm:text-[15px] text-neo opacity-75 leading-snug">Visualize complex concepts with interactive 3D simulators and comprehensive study tools.</div>
                </div>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.5, delay: 0.7 }}
                className="flex items-start gap-4 sm:gap-5 p-4 sm:p-5 rounded-[24px] sm:rounded-[28px] bg-neo-convex shadow-neo hover:shadow-neo-accent hover:-translate-y-1 transition-all duration-300 border border-[var(--neo-border)] group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 via-blue-500/5 to-blue-500/0 opacity-0 group-hover:opacity-100 translate-x-[-100%] group-hover:translate-x-[100%] transition-all duration-1000 ease-in-out" />
                <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-[18px] sm:rounded-2xl bg-neo-concave flex items-center justify-center flex-shrink-0 shadow-neo-inner relative z-10 group-hover:bg-[#2563EB]/10 transition-colors">
                  <LineChart className="w-6 h-6 sm:w-7 sm:h-7 text-[#2563EB]" />
                </div>
                <div className="pt-1 relative z-10">
                  <div className="text-lg sm:text-xl font-bold text-neo mb-1.5 group-hover:text-[#2563EB] transition-colors">Smart Analytics</div>
                  <div className="text-sm sm:text-[15px] text-neo opacity-75 leading-snug">Track your learning progress, identify weak spots, and optimize your study sessions.</div>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Sign In Component */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, rotateY: -10 }}
          animate={{ opacity: 1, scale: 1, rotateY: 0 }}
          transition={{ duration: 0.7, delay: 0.3, ease: [0.25, 0.8, 0.25, 1] }}
          className="w-full lg:w-1/2 max-w-[440px] z-10"
          style={{ 
            x: smoothMouseX, 
            y: smoothMouseY 
          }}
        >
          <div className="bg-neo-convex shadow-neo-accent rounded-[32px] sm:rounded-[40px] p-2 sm:p-3 border border-[var(--neo-border)] relative group">
            {/* Subtle animated border glow */}
            <div className="absolute inset-0 rounded-[32px] sm:rounded-[40px] bg-gradient-to-r from-[#2563EB] to-[#F43F5E] opacity-0 group-hover:opacity-10 blur-xl transition-opacity duration-700 pointer-events-none" />
            
            <div className="bg-neo-concave rounded-[24px] sm:rounded-[32px] p-4 sm:p-6 shadow-neo-inner flex justify-center relative z-10 overflow-hidden">
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
                      headerTitle: "text-2xl sm:text-3xl font-extrabold text-neo mb-1 sm:mb-2",
                      headerSubtitle: "text-neo opacity-70 text-sm sm:text-base font-medium",
                      socialButtonsBlockButton: "bg-neo-convex shadow-neo-sm border-none text-neo hover:bg-neo hover:shadow-neo transition-all rounded-xl sm:rounded-2xl h-10 sm:h-12 mb-2 sm:mb-3",
                      socialButtonsBlockButtonText: "font-bold text-sm text-neo",
                      socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
                      dividerLine: "bg-[var(--neo-shadow-dark)] opacity-40",
                      dividerText: "text-neo opacity-50 font-medium text-xs sm:text-sm",
                      formFieldLabel: "text-neo font-bold text-xs sm:text-sm mb-1 sm:mb-1.5",
                      formFieldInput: "bg-neo-concave shadow-neo-inner border-none rounded-xl sm:rounded-2xl text-neo focus:ring-2 focus:ring-[#2563EB] h-10 sm:h-12 px-3 sm:px-4 transition-shadow text-sm",
                      formButtonPrimary: "bg-gradient-to-r from-[#2563EB] to-[#1E40AF] shadow-neo-accent border-none rounded-xl sm:rounded-2xl text-white hover:opacity-90 hover:scale-[1.02] transition-all h-10 sm:h-12 font-extrabold text-sm sm:text-base mt-1 sm:mt-2 active:scale-[0.98]",
                      footerAction: "text-neo bg-transparent",
                      footerActionText: "text-neo opacity-70 font-medium text-xs sm:text-sm",
                      footerActionLink: "text-[#2563EB] hover:text-[#1E40AF] font-bold ml-1 transition-colors text-xs sm:text-sm",
                      identityPreviewText: "text-neo font-medium text-sm",
                      identityPreviewEditButton: "text-[#2563EB] hover:text-[#1E40AF]",
                      formFieldSuccessText: "text-green-600 font-medium text-xs",
                      formFieldErrorText: "text-red-500 font-medium text-xs mt-1",
                      alert: "bg-neo-concave shadow-neo-inner border-none text-neo rounded-lg sm:rounded-xl text-sm",
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
                      headerTitle: "text-2xl sm:text-3xl font-extrabold text-neo mb-1 sm:mb-2",
                      headerSubtitle: "text-neo opacity-70 text-sm sm:text-base font-medium",
                      socialButtonsBlockButton: "bg-neo-convex shadow-neo-sm border-none text-neo hover:bg-neo hover:shadow-neo transition-all rounded-xl sm:rounded-2xl h-10 sm:h-12 mb-2 sm:mb-3",
                      socialButtonsBlockButtonText: "font-bold text-sm text-neo",
                      socialButtonsProviderIcon: "w-4 h-4 sm:w-5 sm:h-5",
                      dividerLine: "bg-[var(--neo-shadow-dark)] opacity-40",
                      dividerText: "text-neo opacity-50 font-medium text-xs sm:text-sm",
                      formFieldLabel: "text-neo font-bold text-xs sm:text-sm mb-1 sm:mb-1.5",
                      formFieldInput: "bg-neo-concave shadow-neo-inner border-none rounded-xl sm:rounded-2xl text-neo focus:ring-2 focus:ring-[#2563EB] h-10 sm:h-12 px-3 sm:px-4 transition-shadow text-sm",
                      formButtonPrimary: "bg-gradient-to-r from-[#2563EB] to-[#1E40AF] shadow-neo-accent border-none rounded-xl sm:rounded-2xl text-white hover:opacity-90 hover:scale-[1.02] transition-all h-10 sm:h-12 font-extrabold text-sm sm:text-base mt-1 sm:mt-2 active:scale-[0.98]",
                      footerAction: "text-neo bg-transparent",
                      footerActionText: "text-neo opacity-70 font-medium text-xs sm:text-sm",
                      footerActionLink: "text-[#2563EB] hover:text-[#1E40AF] font-bold ml-1 transition-colors text-xs sm:text-sm",
                      identityPreviewText: "text-neo font-medium text-sm",
                      identityPreviewEditButton: "text-[#2563EB] hover:text-[#1E40AF]",
                      formFieldSuccessText: "text-green-600 font-medium text-xs",
                      formFieldErrorText: "text-red-500 font-medium text-xs mt-1",
                      alert: "bg-neo-concave shadow-neo-inner border-none text-neo rounded-lg sm:rounded-xl text-sm",
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
        </motion.div>
      </div>
    </div>
  );
};
