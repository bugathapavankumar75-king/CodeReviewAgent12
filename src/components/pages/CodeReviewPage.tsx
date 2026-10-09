/**
 * Code Review Page Shell
 * Wraps the existing Phase 1 CodeWorkspace in a rich PR review header:
 * - Mock Repository & Pull Request metadata banner
 * - Branch info & reviewer status
 * - Embeds the complete, existing CodeWorkspace (per-file state, Save, Review Code, Review Project, Review Results below editor)
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  GitPullRequest,
  GitBranch,
  User,
  Clock,
  Shield,
  CheckCircle2,
  AlertTriangle,
  Beaker,
  Sparkles,
} from 'lucide-react';
import { CodeWorkspace } from '../workspace/CodeWorkspace';
import type { AppRoute } from '../../router/Navigation';

interface CodeReviewPageProps {
  onNavigate?: (route: AppRoute) => void;
}

export const CodeReviewPage: React.FC<CodeReviewPageProps> = ({ onNavigate }) => {
  return (
    <div className="space-y-4">
      {/* Section 6: Mock Repository & Pull Request Context Shell */}
      <div className="p-4 sm:p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/90 backdrop-blur-sm shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <span className="flex items-center gap-1.5 text-xs font-mono text-slate-400">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              <strong className="text-white">task-management-api</strong>
            </span>
            <span className="text-slate-600">/</span>
            <span className="flex items-center gap-1 text-xs font-mono text-sky-400 font-semibold">
              <GitPullRequest className="h-3.5 w-3.5" />
              <span>PR #24</span>
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
              Review Shell Active
            </span>
          </div>

          <h1 className="text-base sm:text-lg font-bold text-white tracking-tight">
            Add authentication middleware &amp; secure session headers
          </h1>

          <div className="flex items-center gap-3 text-xs font-mono text-slate-400 flex-wrap">
            <span className="flex items-center gap-1">
              <GitBranch className="h-3 w-3 text-slate-500" />
              <span>feature/auth-middleware → main</span>
            </span>
            <span>·</span>
            <span>Author: Pavan Kumar</span>
            <span>·</span>
            <span>Updated 15 mins ago</span>
          </div>
        </div>

        {/* Right Status Card */}
        <div className="flex items-center gap-3 shrink-0">
          <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-right text-xs font-mono hidden sm:block">
            <span className="text-slate-400 block text-[10px] uppercase font-semibold">
              Active Review Engine
            </span>
            <span className="text-emerald-400 font-bold flex items-center justify-end gap-1">
              <Shield className="h-3.5 w-3.5" />
              <span>Context-Aware v2</span>
            </span>
          </div>

          {onNavigate && (
            <button
              onClick={() => onNavigate('/studio')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 text-xs font-mono transition-colors"
              title="Open Phase 1 Acceptance Suite & Diagnostics"
            >
              <Beaker className="h-3.5 w-3.5 text-amber-400" />
              <span>Phase 1 Studio</span>
            </button>
          )}
        </div>
      </div>

      {/* Embedded Existing Phase 1 Code Workspace (Zero duplication, 100% feature reuse) */}
      <div className="pt-1">
        <CodeWorkspace />
      </div>
    </div>
  );
};
