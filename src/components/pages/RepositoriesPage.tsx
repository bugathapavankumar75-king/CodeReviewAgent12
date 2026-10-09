/**
 * Repositories Page Component
 * Displays connected codebases with language, review status, open PRs, and "New Repository" action.
 */

import React, { useState } from 'react';
import {
  FolderGit2,
  Plus,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  GitPullRequest,
  Star,
  ExternalLink,
  X,
  Check,
  Code2,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { MOCK_REPOSITORIES, type MockRepository } from '../../mock/mockData';

interface RepositoriesPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const RepositoriesPage: React.FC<RepositoriesPageProps> = ({ onNavigate }) => {
  const [repositories, setRepositories] = useState<MockRepository[]>(MOCK_REPOSITORIES);
  const [searchQuery, setSearchQuery] = useState('');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [newRepoName, setNewRepoName] = useState('');
  const [newRepoDescription, setNewRepoDescription] = useState('');
  const [newRepoLanguage, setNewRepoLanguage] = useState('TypeScript');

  const filteredRepos = repositories.filter(
    (r) =>
      r.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      r.language.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateRepo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRepoName.trim()) return;

    const newRepo: MockRepository = {
      id: `repo-${Date.now().toString(36)}`,
      name: newRepoName.trim().toLowerCase().replace(/\s+/g, '-'),
      description: newRepoDescription.trim() || 'Internal service repository',
      language: newRepoLanguage,
      defaultBranch: 'main',
      openPRCount: 1,
      totalReviews: 0,
      lastUpdated: 'Just now',
      status: 'passing',
      criticalIssuesCount: 0,
      stars: 1,
    };

    setRepositories([newRepo, ...repositories]);
    setIsNewModalOpen(false);
    setNewRepoName('');
    setNewRepoDescription('');
  };

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <FolderGit2 className="h-6 w-6 text-sky-400" />
            <span>Connected Repositories</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Manage your project codebases, architecture rules, and automated pull request reviews.
          </p>
        </div>

        {/* Section 4: [ New Repository ] Button */}
        <button
          onClick={() => setIsNewModalOpen(true)}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors shrink-0"
        >
          <Plus className="h-4 w-4" />
          <span>New Repository</span>
        </button>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex items-center gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 h-4 w-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search repositories by name, language, or description..."
            className="w-full bg-[#0d131f] border border-slate-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
          />
        </div>
        <span className="text-xs text-slate-500 font-mono hidden sm:inline">
          Showing {filteredRepos.length} of {repositories.length}
        </span>
      </div>

      {/* Repositories Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredRepos.map((repo) => (
          <div
            key={repo.id}
            className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 hover:border-slate-700 transition-all flex flex-col justify-between space-y-4 shadow-sm"
          >
            <div className="space-y-2">
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-base font-bold text-white tracking-tight hover:text-sky-300 transition-colors">
                    {repo.name}
                  </span>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium bg-slate-800 text-sky-400 border border-slate-700">
                    {repo.language}
                  </span>
                </div>

                <div className="shrink-0">
                  {repo.status === 'issues_detected' ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-amber-950/80 text-amber-300 border border-amber-800">
                      <AlertTriangle className="h-3 w-3 text-amber-400" />
                      <span>{repo.criticalIssuesCount} Issues</span>
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                      <CheckCircle2 className="h-3 w-3 text-emerald-400" />
                      <span>Clean</span>
                    </span>
                  )}
                </div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
                {repo.description}
              </p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
              <div className="flex items-center gap-3 text-slate-400">
                <span className="flex items-center gap-1 text-indigo-300">
                  <GitPullRequest className="h-3.5 w-3.5" />
                  <span>{repo.openPRCount} open PRs</span>
                </span>
                <span>·</span>
                <span className="text-slate-500">{repo.totalReviews} reviews</span>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() => onNavigate('/pull-requests')}
                  className="px-2.5 py-1 rounded-lg text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors text-[11px]"
                >
                  PRs
                </button>
                <button
                  onClick={() => onNavigate('/code-review')}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-medium text-[11px] transition-colors"
                >
                  <Code2 className="h-3 w-3" />
                  <span>Review Code</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New Repository Modal Dialog */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg p-6 rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FolderGit2 className="h-5 w-5 text-sky-400" />
                <h3 className="text-base font-bold text-white">Connect New Repository</h3>
              </div>
              <button
                onClick={() => setIsNewModalOpen(false)}
                className="p-1 rounded text-slate-400 hover:text-white"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <form onSubmit={handleCreateRepo} className="space-y-4 text-xs">
              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Repository Name</label>
                <input
                  type="text"
                  required
                  value={newRepoName}
                  onChange={(e) => setNewRepoName(e.target.value)}
                  placeholder="e.g. user-identity-service"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Description</label>
                <textarea
                  rows={2}
                  value={newRepoDescription}
                  onChange={(e) => setNewRepoDescription(e.target.value)}
                  placeholder="Service architectural purpose, boundaries, and domain rules..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-slate-300 font-medium">Primary Language</label>
                <select
                  value={newRepoLanguage}
                  onChange={(e) => setNewRepoLanguage(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
                >
                  <option value="TypeScript">TypeScript</option>
                  <option value="Python">Python</option>
                  <option value="Go">Go</option>
                  <option value="Java">Java</option>
                  <option value="C#">C#</option>
                  <option value="Rust">Rust</option>
                  <option value="C++">C++</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-semibold shadow-md transition-colors"
                >
                  <Check className="h-3.5 w-3.5" />
                  <span>Create Repository</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
