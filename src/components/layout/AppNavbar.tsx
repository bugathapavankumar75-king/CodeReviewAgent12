/**
 * Global Navigation Header Component
 * Provides:
 * - App Branding & Logo
 * - Main navigation links: Dashboard, Repositories, PRs, Code Review, Knowledge, Settings
 * - Active page indicator
 * - Diagnostics / Phase 1 Studio toggle
 * - User Profile menu with Sign Out
 * - Responsive mobile drawer
 */

import React, { useState } from 'react';
import {
  Bot,
  LayoutDashboard,
  FolderGit2,
  GitPullRequest,
  Code2,
  BookOpen,
  Settings,
  LogOut,
  User,
  Menu,
  X,
  Sparkles,
  ChevronDown,
  CheckCircle2,
  Beaker,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { useAuth } from '../../context/AuthContext';

interface AppNavbarProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
}

export const AppNavbar: React.FC<AppNavbarProps> = ({ currentRoute, onNavigate }) => {
  const { user, logout } = useAuth();
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navLinks: { label: string; route: AppRoute; icon: React.FC<{ className?: string }> }[] = [
    { label: 'Dashboard', route: '/dashboard', icon: LayoutDashboard },
    { label: 'Repositories', route: '/repositories', icon: FolderGit2 },
    { label: 'Pull Requests', route: '/pull-requests', icon: GitPullRequest },
    { label: 'Code Review', route: '/code-review', icon: Code2 },
    { label: 'Knowledge', route: '/knowledge', icon: BookOpen },
    { label: 'Settings', route: '/settings', icon: Settings },
  ];

  const handleLinkClick = (route: AppRoute) => {
    onNavigate(route);
    setMobileMenuOpen(false);
    setUserDropdownOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0c121e]/95 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="flex items-center justify-between h-16">
          {/* Left: Brand Logo & Title */}
          <div className="flex items-center gap-6">
            <button
              onClick={() => handleLinkClick('/dashboard')}
              className="flex items-center gap-2.5 text-left group focus:outline-none"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-md shadow-sky-950 group-hover:scale-105 transition-transform">
                <Bot className="h-5 w-5" />
              </div>
              <div>
                <span className="text-sm font-bold text-white tracking-tight flex items-center gap-1.5">
                  CodeReview<span className="text-sky-400">Agent</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800/80">
                    Phase 2
                  </span>
                </span>
                <span className="text-[10px] text-slate-400 block -mt-0.5 hidden sm:block">
                  Context-Aware AI Review
                </span>
              </div>
            </button>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item) => {
                const Icon = item.icon;
                const isActive = currentRoute === item.route;

                return (
                  <button
                    key={item.route}
                    onClick={() => handleLinkClick(item.route)}
                    className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-sky-500/10 text-sky-300 font-semibold border border-sky-500/30 shadow-sm'
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                    }`}
                  >
                    <Icon className={`h-4 w-4 ${isActive ? 'text-sky-400' : 'text-slate-500'}`} />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right: Quick Action & User Menu */}
          <div className="hidden sm:flex items-center gap-3">
            {/* Phase 1 Studio Diagnostic Shortcut */}
            <button
              onClick={() => handleLinkClick('/studio')}
              className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-mono transition-colors ${
                currentRoute === '/studio'
                  ? 'bg-amber-950/80 text-amber-300 border border-amber-800'
                  : 'text-slate-400 hover:text-amber-300 hover:bg-slate-800/60'
              }`}
              title="View Phase 1 diagnostics, memory inspector, and run the 12 acceptance test suites"
            >
              <Beaker className="h-3.5 w-3.5 text-amber-400" />
              <span>Phase 1 Studio</span>
            </button>

            {/* Review Code Action Button */}
            <button
              onClick={() => handleLinkClick('/code-review')}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm shadow-sky-950"
            >
              <Sparkles className="h-3.5 w-3.5" />
              <span>Review Code</span>
            </button>

            {/* User Profile Dropdown */}
            <div className="relative">
              <button
                onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                className="flex items-center gap-2 p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs text-slate-300 focus:outline-none"
              >
                <div className="h-6 w-6 rounded-full bg-gradient-to-tr from-sky-500 to-emerald-500 flex items-center justify-center text-[10px] font-bold text-white uppercase">
                  {user?.name ? user.name.slice(0, 2) : 'PK'}
                </div>
                <span className="font-medium text-xs text-slate-200 hidden md:inline">
                  {user?.name || 'Developer'}
                </span>
                <ChevronDown className="h-3 w-3 text-slate-500" />
              </button>

              {userDropdownOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-xl border border-slate-800 bg-[#0f172a] p-1.5 shadow-2xl z-50 text-xs animate-fade-in font-sans">
                  <div className="px-3 py-2 border-b border-slate-800">
                    <p className="font-semibold text-white">{user?.name || 'Developer'}</p>
                    <p className="text-[11px] text-slate-400 font-mono truncate">{user?.email}</p>
                    <span className="inline-block mt-1 px-1.5 py-0.2 rounded text-[10px] bg-slate-800 text-sky-400 font-mono">
                      {user?.role || 'Staff Engineer'}
                    </span>
                  </div>

                  <div className="py-1">
                    <button
                      onClick={() => handleLinkClick('/settings')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-left transition-colors"
                    >
                      <Settings className="h-3.5 w-3.5 text-slate-400" />
                      <span>Settings</span>
                    </button>
                    <button
                      onClick={() => handleLinkClick('/knowledge')}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-slate-300 hover:bg-slate-800 text-left transition-colors"
                    >
                      <BookOpen className="h-3.5 w-3.5 text-slate-400" />
                      <span>Knowledge Datasets</span>
                    </button>
                  </div>

                  <div className="pt-1 border-t border-slate-800">
                    <button
                      onClick={() => {
                        setUserDropdownOpen(false);
                        logout();
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-rose-400 hover:bg-rose-950/40 text-left transition-colors font-medium"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Mobile Hamburger Button */}
          <div className="flex lg:hidden items-center gap-2">
            <button
              onClick={() => handleLinkClick('/code-review')}
              className="p-2 rounded-lg bg-sky-600 text-white text-xs font-semibold"
            >
              <Sparkles className="h-4 w-4" />
            </button>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-400 hover:text-white bg-slate-900 border border-slate-800"
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-800 bg-[#0d131f] px-4 py-4 space-y-2 animate-fade-in text-xs">
          {navLinks.map((item) => {
            const Icon = item.icon;
            const isActive = currentRoute === item.route;

            return (
              <button
                key={item.route}
                onClick={() => handleLinkClick(item.route)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg font-medium transition-colors ${
                  isActive
                    ? 'bg-sky-600 text-white font-semibold'
                    : 'text-slate-300 hover:bg-slate-800'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span>{item.label}</span>
              </button>
            );
          })}

          <div className="pt-2 border-t border-slate-800 space-y-1">
            <button
              onClick={() => handleLinkClick('/studio')}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-amber-400 hover:bg-slate-800 font-mono"
            >
              <Beaker className="h-4 w-4" />
              <span>Phase 1 Studio &amp; Tests</span>
            </button>
            <button
              onClick={() => {
                setMobileMenuOpen(false);
                logout();
              }}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-rose-400 hover:bg-rose-950/30"
            >
              <LogOut className="h-4 w-4" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
