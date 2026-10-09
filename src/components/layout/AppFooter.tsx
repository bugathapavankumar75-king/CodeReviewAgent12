/**
 * Application Footer Component
 */

import React from 'react';
import { Bot, GitBranch, Shield, Zap } from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';

interface AppFooterProps {
  onNavigate?: (route: AppRoute) => void;
}

export const AppFooter: React.FC<AppFooterProps> = ({ onNavigate }) => {
  return (
    <footer className="border-t border-slate-800/80 bg-[#0a0f18] py-8 px-4 sm:px-6 mt-12 text-xs text-slate-500">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Brand info */}
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 rounded-lg bg-sky-500/10 flex items-center justify-center text-sky-400 border border-sky-500/20">
            <Bot className="h-3.5 w-3.5" />
          </div>
          <div>
            <span className="font-semibold text-slate-300">Context-Aware AI Code Review Agent</span>
            <span className="mx-2 text-slate-600">·</span>
            <span>Phase 2 Web Application Shell</span>
          </div>
        </div>

        {/* Capabilities badges */}
        <div className="flex items-center gap-4 text-xs font-mono flex-wrap">
          <span className="flex items-center gap-1.5 text-slate-400">
            <Shield className="h-3.5 w-3.5 text-emerald-400" />
            <span>Strict Layering Enforcement</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <Zap className="h-3.5 w-3.5 text-amber-400" />
            <span>Team Memory Learning</span>
          </span>
          <span className="flex items-center gap-1.5 text-slate-400">
            <GitBranch className="h-3.5 w-3.5 text-sky-400" />
            <span>Multi-Repo Context</span>
          </span>
        </div>

        {/* Quick links */}
        <div className="flex items-center gap-4 text-slate-400">
          <button
            onClick={() => onNavigate && onNavigate('/dashboard')}
            className="hover:text-white transition-colors"
          >
            Dashboard
          </button>
          <button
            onClick={() => onNavigate && onNavigate('/repositories')}
            className="hover:text-white transition-colors"
          >
            Repositories
          </button>
          <button
            onClick={() => onNavigate && onNavigate('/pull-requests')}
            className="hover:text-white transition-colors"
          >
            Pull Requests
          </button>
          <button
            onClick={() => onNavigate && onNavigate('/code-review')}
            className="hover:text-white transition-colors"
          >
            Code Review
          </button>
        </div>
      </div>
    </footer>
  );
};
