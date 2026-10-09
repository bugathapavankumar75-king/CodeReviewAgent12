/**
 * Settings Page Component
 * Sections for:
 * - Profile: Name, Email, Role, Team
 * - Review Settings: Default programming language, Review severity preferences, Enable/disable review categories
 * - Project Settings: Coding standards, Architecture preferences
 * - Account: Sign out
 */

import React, { useState } from 'react';
import {
  User,
  Sliders,
  Layers,
  LogOut,
  Check,
  Settings,
  Shield,
  Code2,
  Save,
  FolderGit2,
  Copy,
  ExternalLink,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { useAuth } from '../../context/AuthContext';
import { SUPPORTED_LANGUAGES } from '../workspace/languageConfig';

interface SettingsPageProps {
  onNavigate?: (route: AppRoute) => void;
}

export const SettingsPage: React.FC<SettingsPageProps> = () => {
  const { user, logout } = useAuth();

  // Profile State
  const [name, setName] = useState(user?.name || 'Pavan Kumar');
  const [email, setEmail] = useState(user?.email || 'pavan@example.com');
  const [role, setRole] = useState(user?.role || 'Staff Software Engineer');

  // GitHub Account State
  const [githubUsername, setGithubUsername] = useState(() => {
    return localStorage.getItem('github_username') || 'bugathapavankumar';
  });
  const [githubRepoName, setGithubRepoName] = useState(() => {
    return localStorage.getItem('github_repo_name') || 'ai-code-review-agent';
  });
  const [isGitHubConnected, setIsGitHubConnected] = useState(() => {
    return localStorage.getItem('github_connected') === 'true';
  });
  const [copiedGitCmd, setCopiedGitCmd] = useState(false);

  // Review Settings State
  const [defaultLanguage, setDefaultLanguage] = useState('typescript');
  const [minSeverity, setMinSeverity] = useState('LOW');
  const [enabledCategories, setEnabledCategories] = useState<Record<string, boolean>>({
    SECURITY: true,
    ARCHITECTURE: true,
    CORRECTNESS: true,
    PERFORMANCE: true,
    MAINTAINABILITY: true,
    CODING_STANDARDS: true,
    TESTING: true,
    RELIABILITY: true,
  });

  // Project Settings State
  const [enforceAsyncHandler, setEnforceAsyncHandler] = useState(true);
  const [enforce3TierLayering, setEnforce3TierLayering] = useState(true);
  const [banMomentAndAxios, setBanMomentAndAxios] = useState(true);

  const [savedNotification, setSavedNotification] = useState(false);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotification(true);
    setTimeout(() => setSavedNotification(false), 3000);
  };

  const toggleCategory = (cat: string) => {
    setEnabledCategories((prev) => ({ ...prev, [cat]: !prev[cat] }));
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-800">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <Settings className="h-6 w-6 text-sky-400" />
            <span>Workspace Settings</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Configure developer profile, AI reviewer severity thresholds, and architectural preferences.
          </p>
        </div>

        {savedNotification && (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-950 text-emerald-400 text-xs font-mono border border-emerald-800 animate-fade-in">
            <Check className="h-3.5 w-3.5" />
            <span>Settings saved successfully</span>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Section 1: Developer Profile */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-2 border-b border-slate-800">
            <User className="h-4 w-4 text-sky-400" />
            <h3>Developer Profile</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Full Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Work Email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Role / Title</label>
              <input
                type="text"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Assigned Team</label>
              <input
                type="text"
                disabled
                value="Platform Architecture"
                className="w-full bg-slate-900/60 border border-slate-800/60 rounded-xl px-3 py-2 text-xs text-slate-400 cursor-not-allowed font-mono"
              />
            </div>
          </div>
        </div>

        {/* Section 2: GitHub Account & Repository Connection */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 space-y-4 shadow-sm">
          <div className="flex items-center justify-between pb-2 border-b border-slate-800">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <FolderGit2 className="h-4 w-4 text-sky-400" />
              <h3>GitHub Account &amp; Remote Repository</h3>
            </div>
            <span
              className={`px-2 py-0.5 rounded text-[10px] font-mono font-semibold ${
                isGitHubConnected
                  ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                  : 'bg-slate-800 text-slate-400 border border-slate-700'
              }`}
            >
              {isGitHubConnected ? '● Connected' : '○ Not Linked'}
            </span>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Link your GitHub account to sync repositories, pull requests, and push this AI Studio project directly to your new GitHub repository.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">GitHub Username</label>
              <input
                type="text"
                value={githubUsername}
                onChange={(e) => {
                  setGithubUsername(e.target.value);
                  localStorage.setItem('github_username', e.target.value);
                }}
                placeholder="e.g. bugathapavankumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Target Repository Name</label>
              <input
                type="text"
                value={githubRepoName}
                onChange={(e) => {
                  setGithubRepoName(e.target.value);
                  localStorage.setItem('github_repo_name', e.target.value);
                }}
                placeholder="e.g. ai-code-review-agent"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2 text-xs">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-slate-300 font-mono text-[11px]">
                Terminal Push Command for New GitHub Account:
              </span>
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard.writeText(
                    `git remote add origin https://github.com/${githubUsername}/${githubRepoName}.git\ngit branch -M main\ngit push -u origin main`
                  );
                  setCopiedGitCmd(true);
                  setTimeout(() => setCopiedGitCmd(false), 3000);
                }}
                className="flex items-center gap-1 text-[11px] text-sky-400 hover:text-sky-300 font-mono transition-colors"
              >
                {copiedGitCmd ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedGitCmd ? 'Copied Commands!' : 'Copy Commands'}</span>
              </button>
            </div>
            <pre className="font-mono text-[11px] text-slate-400 overflow-x-auto p-2 bg-[#080d15] rounded border border-slate-800/80">
              git remote add origin https://github.com/{githubUsername}/{githubRepoName}.git{'\n'}
              git branch -M main{'\n'}
              git push -u origin main
            </pre>
          </div>

          <div className="flex items-center justify-between pt-1">
            <a
              href="https://github.com/new"
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 text-xs text-sky-400 hover:text-sky-300 transition-colors"
            >
              <span>Create empty repository on GitHub</span>
              <ExternalLink className="h-3 w-3" />
            </a>

            <button
              type="button"
              onClick={() => {
                const nextState = !isGitHubConnected;
                setIsGitHubConnected(nextState);
                localStorage.setItem('github_connected', nextState ? 'true' : 'false');
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
                isGitHubConnected
                  ? 'bg-rose-950/70 hover:bg-rose-900 text-rose-300 border border-rose-800'
                  : 'bg-sky-600 hover:bg-sky-500 text-white'
              }`}
            >
              {isGitHubConnected ? 'Disconnect GitHub' : 'Mark as Connected'}
            </button>
          </div>
        </div>

        {/* Section 3: Review Engine Settings */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-2 border-b border-slate-800">
            <Sliders className="h-4 w-4 text-emerald-400" />
            <h3>Review Engine Preferences</h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Default Workspace Language</label>
              <select
                value={defaultLanguage}
                onChange={(e) => setDefaultLanguage(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                {Object.values(SUPPORTED_LANGUAGES).map((l) => (
                  <option key={l.id} value={l.id}>
                    {l.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-slate-300 font-medium">Minimum Severity Threshold</label>
              <select
                value={minSeverity}
                onChange={(e) => setMinSeverity(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-sky-500 cursor-pointer"
              >
                <option value="CRITICAL">Critical Only</option>
                <option value="HIGH">High and Above</option>
                <option value="MEDIUM">Medium and Above</option>
                <option value="LOW">Low and Above (Recommended)</option>
                <option value="INFO">All (Including Observations)</option>
              </select>
            </div>
          </div>

          {/* Enable / Disable Review Categories */}
          <div className="pt-2 space-y-2">
            <label className="text-slate-300 font-medium text-xs block">Active Review Categories</label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
              {Object.keys(enabledCategories).map((cat) => (
                <label
                  key={cat}
                  className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer hover:border-slate-700 transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={enabledCategories[cat]}
                    onChange={() => toggleCategory(cat)}
                    className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                  />
                  <span className="font-mono text-[11px] text-slate-300">{cat}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Section 3: Project & Architecture Settings */}
        <div className="p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90 space-y-4 shadow-sm">
          <div className="flex items-center gap-2 text-sm font-semibold text-white pb-2 border-b border-slate-800">
            <Layers className="h-4 w-4 text-indigo-400" />
            <h3>Project Architecture Rules</h3>
          </div>

          <div className="space-y-3 text-xs">
            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Strict 3-Tier Layering Boundaries (ARCH-001)</span>
                <span className="text-slate-400 text-[11px]">
                  Controllers cannot directly import or query repositories; must route through domain Services.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enforce3TierLayering}
                onChange={(e) => setEnforce3TierLayering(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-sky-600 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Asynchronous Route Handler Wrapper (STD-001)</span>
                <span className="text-slate-400 text-[11px]">
                  Require asyncHandler error forwarding on all Express route controller methods.
                </span>
              </div>
              <input
                type="checkbox"
                checked={enforceAsyncHandler}
                onChange={(e) => setEnforceAsyncHandler(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-sky-600 h-4 w-4"
              />
            </label>

            <label className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 cursor-pointer">
              <div>
                <span className="font-semibold text-white block">Banned Dependency Enforcement (TECH-001)</span>
                <span className="text-slate-400 text-[11px]">
                  Flag imports of deprecated or banned packages (axios, moment, lodash) in favor of native primitives.
                </span>
              </div>
              <input
                type="checkbox"
                checked={banMomentAndAxios}
                onChange={(e) => setBanMomentAndAxios(e.target.checked)}
                className="rounded bg-slate-800 border-slate-700 text-sky-600 h-4 w-4"
              />
            </label>
          </div>
        </div>

        {/* Section 4: Account Actions & Save */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl border border-slate-800 bg-[#0f172a]/90">
          <button
            type="button"
            onClick={logout}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 text-xs font-semibold transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span>Sign Out of Account</span>
          </button>

          <button
            type="submit"
            className="flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors"
          >
            <Save className="h-4 w-4" />
            <span>Save Settings</span>
          </button>
        </div>
      </form>
    </div>
  );
};
