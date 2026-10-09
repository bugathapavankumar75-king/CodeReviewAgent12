/**
 * Dashboard Page Component
 * Developer-focused overview showing repositories, pull requests, review metrics, and recent activity.
 */

import React from 'react';
import {
  FolderGit2,
  GitPullRequest,
  CheckCircle2,
  AlertTriangle,
  ShieldAlert,
  Sparkles,
  ArrowRight,
  Clock,
  Code2,
  BookOpen,
  Activity,
  Layers,
  ChevronRight,
  TrendingUp,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import {
  MOCK_DASHBOARD_METRICS,
  MOCK_REPOSITORIES,
  MOCK_PULL_REQUESTS,
  MOCK_RECENT_ACTIVITY,
} from '../../mock/mockData';
import { useAuth } from '../../context/AuthContext';

interface DashboardPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const DashboardPage: React.FC<DashboardPageProps> = ({ onNavigate }) => {
  const { user } = useAuth();
  const metrics = MOCK_DASHBOARD_METRICS;
  const recentActivity = MOCK_RECENT_ACTIVITY;
  const repos = MOCK_REPOSITORIES;

  return (
    <div className="space-y-6">
      {/* Top Welcome Banner & Primary Actions */}
      <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 backdrop-blur-sm shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
              Welcome back, {user?.name || 'Developer'}
            </h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-sky-950 text-sky-400 border border-sky-800">
              Active Context
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            AI Code Review Agent is monitoring <strong className="text-slate-300">{metrics.totalRepositories} repositories</strong> and <strong className="text-slate-300">{metrics.activePullRequests} open pull requests</strong> against team architecture standards and threat boundaries.
          </p>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={() => onNavigate('/code-review')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors"
          >
            <Sparkles className="h-4 w-4" />
            <span>Open Code Review</span>
          </button>
          <button
            onClick={() => onNavigate('/pull-requests')}
            className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-800 transition-colors"
          >
            <GitPullRequest className="h-4 w-4 text-sky-400" />
            <span>View Pull Requests</span>
          </button>
        </div>
      </div>

      {/* 5-Metric Developer Statistics Grid (Section 3) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {/* Metric 1: Repositories */}
        <div
          onClick={() => onNavigate('/repositories')}
          className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] hover:border-slate-700 transition-all cursor-pointer group space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Repositories</span>
            <FolderGit2 className="h-4 w-4 text-sky-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.totalRepositories}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>4 microservices</span>
            <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-sky-400" />
          </div>
        </div>

        {/* Metric 2: Pull Requests */}
        <div
          onClick={() => onNavigate('/pull-requests')}
          className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] hover:border-slate-700 transition-all cursor-pointer group space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Open PRs</span>
            <GitPullRequest className="h-4 w-4 text-indigo-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.activePullRequests}</div>
          <div className="text-[11px] text-slate-500 flex items-center justify-between">
            <span>3 need review</span>
            <ChevronRight className="h-3 w-3 text-slate-600 group-hover:text-indigo-400" />
          </div>
        </div>

        {/* Metric 3: Reviews */}
        <div
          onClick={() => onNavigate('/code-review')}
          className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] hover:border-slate-700 transition-all cursor-pointer group space-y-2 shadow-sm"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Total Reviews</span>
            <Code2 className="h-4 w-4 text-emerald-400 group-hover:scale-110 transition-transform" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.totalReviews}</div>
          <div className="text-[11px] text-emerald-400 font-mono flex items-center gap-1">
            <TrendingUp className="h-3 w-3" />
            <span>{metrics.reviewPassRate}% pass rate</span>
          </div>
        </div>

        {/* Metric 4: Total Issues Found */}
        <div className="p-4 rounded-xl border border-slate-800 bg-[#0d131f] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs font-medium">Issues Caught</span>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.totalIssuesFound}</div>
          <div className="text-[11px] text-slate-500 font-mono">
            Across 7 categories
          </div>
        </div>

        {/* Metric 5: Critical Issues */}
        <div className="p-4 rounded-xl border border-rose-900/60 bg-[#160b12] space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-rose-300">
            <span className="text-xs font-medium">Critical Issues</span>
            <ShieldAlert className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-rose-300 tracking-tight">{metrics.criticalIssuesOpen}</div>
          <div className="text-[11px] text-rose-400/80 font-mono">
            Security &amp; Invariant Risks
          </div>
        </div>
      </div>

      {/* Main Two-Column Section: Repositories (Left) & Recent Review Activity (Right) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Monitored Repositories (7 cols) */}
        <div className="lg:col-span-7 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Active Repositories</h2>
            </div>
            <button
              onClick={() => onNavigate('/repositories')}
              className="text-xs text-sky-400 hover:text-sky-300 font-medium flex items-center gap-1"
            >
              <span>View all ({repos.length})</span>
              <ArrowRight className="h-3 w-3" />
            </button>
          </div>

          <div className="space-y-2.5">
            {repos.map((repo) => (
              <div
                key={repo.id}
                onClick={() => onNavigate('/code-review')}
                className="p-4 rounded-xl border border-slate-800 bg-[#0f172a]/70 hover:bg-[#0f172a] hover:border-slate-700 transition-all cursor-pointer group shadow-sm"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                        {repo.name}
                      </span>
                      <span className="px-2 py-0.2 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700">
                        {repo.language}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 line-clamp-1">{repo.description}</p>
                  </div>

                  <div className="shrink-0 text-right">
                    {repo.status === 'issues_detected' ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-amber-950/70 text-amber-300 border border-amber-800/80">
                        <AlertTriangle className="h-3 w-3 text-amber-400" />
                        <span>{repo.criticalIssuesCount} Critical</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-mono font-medium bg-emerald-950/70 text-emerald-300 border border-emerald-800/80">
                        <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                        <span>Clean</span>
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>{repo.openPRCount} open PRs</span>
                    <span>·</span>
                    <span>{repo.totalReviews} reviews</span>
                  </div>
                  <span>Updated {repo.lastUpdated}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Recent Review Activity (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Activity className="h-4 w-4 text-emerald-400" />
              <h2 className="text-sm font-bold text-white tracking-tight">Recent Review Activity</h2>
            </div>
            <button
              onClick={() => onNavigate('/code-review')}
              className="text-xs text-slate-400 hover:text-white"
            >
              Live Feed
            </button>
          </div>

          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
            {recentActivity.map((act) => (
              <div
                key={act.id}
                onClick={() => onNavigate('/code-review')}
                className="p-3.5 hover:bg-[#0f172a] transition-colors cursor-pointer space-y-1.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-semibold text-slate-200 truncate">
                    {act.repoName} {act.prNumber ? `· #${act.prNumber}` : ''}
                  </span>
                  <span className="text-[10px] text-slate-500 shrink-0">{act.timestamp}</span>
                </div>

                {act.prTitle && (
                  <p className="text-xs text-slate-400 line-clamp-1">{act.prTitle}</p>
                )}

                <div className="flex items-center justify-between text-[11px] font-mono pt-1">
                  <span className="text-slate-500 text-[10px] truncate max-w-[180px]">
                    {act.file}
                  </span>

                  {act.status === 'CHANGES_REQUESTED' ? (
                    <span className="text-rose-400 font-semibold flex items-center gap-1">
                      <span>{act.issuesFound} issues</span>
                      {act.criticalIssues > 0 && <span>({act.criticalIssues} crit)</span>}
                    </span>
                  ) : (
                    <span className="text-emerald-400 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Approved</span>
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Quick Knowledge & Standards Shortcut */}
          <div
            onClick={() => onNavigate('/knowledge')}
            className="p-4 rounded-xl border border-sky-900/60 bg-sky-950/20 hover:bg-sky-950/30 transition-colors cursor-pointer flex items-center justify-between text-xs"
          >
            <div className="flex items-center gap-3">
              <BookOpen className="h-5 w-5 text-sky-400" />
              <div>
                <h4 className="font-semibold text-white">Project Knowledge Base</h4>
                <p className="text-[11px] text-slate-400">
                  Inspect active Architecture rules, Standards &amp; Exceptions
                </p>
              </div>
            </div>
            <ArrowRight className="h-4 w-4 text-sky-400" />
          </div>
        </div>
      </div>
    </div>
  );
};
