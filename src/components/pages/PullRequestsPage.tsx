/**
 * Pull Requests Page Component
 * Lists pull requests across repositories with author, review status, diff summary, and click-to-review.
 */

import React, { useState } from 'react';
import {
  GitPullRequest,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  ExternalLink,
  Filter,
  Code2,
  GitBranch,
  User,
  Plus,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { MOCK_PULL_REQUESTS, type MockPullRequest } from '../../mock/mockData';

interface PullRequestsPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const PullRequestsPage: React.FC<PullRequestsPageProps> = ({ onNavigate }) => {
  const [prs] = useState<MockPullRequest[]>(MOCK_PULL_REQUESTS);
  const [statusFilter, setStatusFilter] = useState<'all' | 'open' | 'merged' | 'closed'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredPRs = prs.filter((pr) => {
    if (statusFilter !== 'all' && pr.status !== statusFilter) return false;
    if (
      searchQuery &&
      !pr.title.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !pr.repoName.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !pr.author.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const getReviewBadge = (status: MockPullRequest['reviewStatus'], issues: number) => {
    switch (status) {
      case 'issues_found':
      case 'changes_requested':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-rose-950/80 text-rose-300 border border-rose-800">
            <AlertTriangle className="h-3 w-3 text-rose-400" />
            <span>{issues > 0 ? `${issues} Issues Found` : 'Changes Requested'}</span>
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-emerald-950/80 text-emerald-300 border border-emerald-800">
            <CheckCircle2 className="h-3 w-3 text-emerald-400" />
            <span>Approved</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-mono font-medium bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="h-3 w-3 text-slate-400" />
            <span>Review Pending</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <GitPullRequest className="h-6 w-6 text-sky-400" />
            <span>Pull Requests</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Automated architectural checks, vulnerability scanning, and review history across all open PRs.
          </p>
        </div>

        {/* Action: Open Active PR Review */}
        <button
          onClick={() => onNavigate('/code-review')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors shrink-0"
        >
          <Code2 className="h-4 w-4" />
          <span>Review Active PR (#24)</span>
        </button>
      </div>

      {/* Search & Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1 bg-[#0d131f] p-1 rounded-xl border border-slate-800 text-xs font-mono">
          {(['all', 'open', 'merged'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg capitalize transition-colors ${
                statusFilter === st
                  ? 'bg-sky-600 text-white font-semibold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {st}
            </button>
          ))}
        </div>

        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter PRs by title, author, or repository..."
            className="w-full bg-[#0d131f] border border-slate-800 rounded-xl pl-10 pr-4 py-1.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
      </div>

      {/* PRs List */}
      <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 divide-y divide-slate-800/80 overflow-hidden shadow-sm">
        {filteredPRs.length > 0 ? (
          filteredPRs.map((pr) => (
            <div
              key={pr.id}
              onClick={() => onNavigate('/code-review')}
              className="p-5 hover:bg-[#0d131f] transition-colors cursor-pointer space-y-3 group"
            >
              {/* Title & Status */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-sm font-bold text-sky-400">#{pr.number}</span>
                    <h3 className="text-sm font-semibold text-white group-hover:text-sky-300 transition-colors">
                      {pr.title}
                    </h3>
                  </div>

                  <div className="flex items-center gap-3 text-xs text-slate-400 font-mono flex-wrap">
                    <span className="text-slate-300 font-semibold">{pr.repoName}</span>
                    <span>·</span>
                    <span className="flex items-center gap-1 text-slate-400">
                      <GitBranch className="h-3 w-3 text-slate-500" />
                      <span>{pr.sourceBranch} → {pr.targetBranch}</span>
                    </span>
                    <span>·</span>
                    <span>by {pr.author}</span>
                  </div>
                </div>

                <div className="shrink-0 flex items-center gap-2">
                  {getReviewBadge(pr.reviewStatus, pr.issuesCount)}
                </div>
              </div>

              {/* Bottom Details Bar */}
              <div className="flex items-center justify-between text-[11px] font-mono text-slate-500 pt-1">
                <div className="flex items-center gap-3">
                  <span>{pr.diffSummary.filesChanged} files changed</span>
                  <span className="text-emerald-400">+{pr.diffSummary.additions}</span>
                  <span className="text-rose-400">-{pr.diffSummary.deletions}</span>
                </div>

                <div className="flex items-center gap-1 text-sky-400 font-medium group-hover:translate-x-1 transition-transform">
                  <span>Open Code Review</span>
                  <ExternalLink className="h-3 w-3" />
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-xs text-slate-500">
            No pull requests match the selected filters.
          </div>
        )}
      </div>
    </div>
  );
};
