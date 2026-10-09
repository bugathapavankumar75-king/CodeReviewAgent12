/**
 * Landing Page Component
 * Developer-focused introductory screen for the Context-Aware AI Code Review Agent.
 */

import React from 'react';
import {
  Bot,
  Shield,
  Layers,
  Sparkles,
  ArrowRight,
  GitPullRequest,
  CheckCircle2,
  FileCode2,
  Cpu,
  Lock,
  Zap,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { useAuth } from '../../context/AuthContext';

interface LandingPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({ onNavigate }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-[#0b0f17] text-slate-100 flex flex-col font-sans">
      {/* Top Navbar */}
      <header className="border-b border-slate-800/80 bg-[#0d131f]/80 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950">
              <Bot className="h-5 w-5" />
            </div>
            <span className="text-base font-bold text-white tracking-tight">
              CodeReview<span className="text-sky-400">Agent</span>
            </span>
          </div>

          <div className="flex items-center gap-3 text-xs">
            {isAuthenticated ? (
              <button
                onClick={() => onNavigate('/dashboard')}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-950 transition-all"
              >
                <span>Go to Dashboard</span>
                <ArrowRight className="h-3.5 w-3.5" />
              </button>
            ) : (
              <>
                <button
                  onClick={() => onNavigate('/login')}
                  className="px-3 py-1.5 rounded-lg text-slate-300 hover:text-white hover:bg-slate-800 transition-colors font-medium"
                >
                  Sign In
                </button>
                <button
                  onClick={() => onNavigate('/signup')}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md shadow-sky-950 transition-all"
                >
                  <span>Get Started</span>
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 pt-16 pb-20 flex flex-col items-center text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-950/80 border border-sky-800/80 text-sky-300 text-xs font-mono mb-6">
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>Next-Generation Context-Aware Code Review</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight max-w-4xl leading-tight sm:leading-tight">
          AI Code Review Powered by Your{' '}
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-indigo-400">
            Architecture, Standards &amp; History
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-400 max-w-2xl leading-relaxed">
          Generic linters and LLM chats lack context. Our agent evaluates your pull requests against explicit 3-tier layering boundaries, threat constraints, and historical team decisions.
        </p>

        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-4">
          <button
            onClick={() => onNavigate(isAuthenticated ? '/dashboard' : '/signup')}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-sm font-semibold shadow-lg shadow-sky-950/50 transition-all hover:scale-102"
          >
            <span>Start Free Workspace Review</span>
            <ArrowRight className="h-4 w-4" />
          </button>
          <button
            onClick={() => onNavigate('/code-review')}
            className="flex items-center gap-2 px-5 py-3 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-medium border border-slate-800 transition-colors"
          >
            <FileCode2 className="h-4 w-4 text-sky-400" />
            <span>Open Interactive Code Editor</span>
          </button>
        </div>

        {/* Key Benefits Grid */}
        <div className="mt-20 grid grid-cols-1 md:grid-cols-3 gap-6 w-full text-left">
          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/70 hover:border-slate-700 transition-colors space-y-3">
            <div className="h-10 w-10 rounded-xl bg-sky-500/10 border border-sky-500/30 flex items-center justify-center text-sky-400">
              <Layers className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Strict Architecture Enforcer</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Detects Controllers directly querying database persistence or Services leaking HTTP framework objects, ensuring clean 3-tier layering.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/70 hover:border-slate-700 transition-colors space-y-3">
            <div className="h-10 w-10 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-400">
              <Shield className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Deep Security &amp; Safety</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Audits unparameterized SQL injections, stack trace leakage (CWE-209), unvalidated request payloads, and plaintext credentials.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/70 hover:border-slate-700 transition-colors space-y-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <Zap className="h-5 w-5" />
            </div>
            <h3 className="text-base font-semibold text-white">Team Memory &amp; Feedback</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Never warns about rejected rules twice. Developer decisions (Accept, Reject, Modify) are preserved in Team Memory as living standards.
            </p>
          </div>
        </div>

        {/* Feature Highlights Bar */}
        <div className="mt-16 w-full p-6 rounded-2xl border border-slate-800 bg-[#0d131f]/90 flex flex-wrap items-center justify-around gap-6 text-xs font-mono text-slate-400">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>13 Programming Languages</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Click-to-Code Line Jump</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Re-Review Delta Tracking</span>
          </div>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 text-emerald-400" />
            <span>Zero Hallucinations Engine</span>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-[#0a0f18] py-6 px-4 text-center text-xs text-slate-500">
        <p>© 2026 Context-Aware AI Code Review Agent · Phase 2 Application Shell</p>
      </footer>
    </div>
  );
};
