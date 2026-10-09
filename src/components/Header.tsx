/**
 * Top Navigation Bar
 * Follows the 3-Zone Top Bar Contract strictly:
 * [Wordmark] — [Nav Tabs] — [Actions]
 */

import React from 'react';
import { Bot, Play, Sparkles, RefreshCw, Layers } from 'lucide-react';

export type AgentStudioTab =
  | 'workspace'
  | 'workbench'
  | 'knowledge'
  | 'tests'
  | 'memory'
  | 'priority'
  | 'explorer';

interface HeaderProps {
  activeTab: AgentStudioTab;
  onTabChange: (tab: AgentStudioTab) => void;
  onRunAll12Tests: () => void;
  isRunningTests: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  onTabChange,
  onRunAll12Tests,
  isRunningTests,
}) => {
  const navItems: Array<{ id: AgentStudioTab; label: string }> = [
    { id: 'workspace', label: 'Code Workspace' },
    { id: 'workbench', label: 'Scenario Workbench' },
    { id: 'knowledge', label: '8 Knowledge Datasets' },
    { id: 'tests', label: '12 Test Cases' },
    { id: 'memory', label: 'Team Memory' },
    { id: 'priority', label: 'Context Priority' },
    { id: 'explorer', label: 'Code & Schemas' },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-800 bg-[#0d131f]/95 backdrop-blur-md">
      <div className="flex h-14 items-center justify-between px-4 sm:px-6">
        {/* Zone 1: Single text wordmark */}
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-sky-500/10 border border-sky-500/30 text-sky-400">
            <Bot className="h-4 w-4" />
          </div>
          <span className="text-base font-semibold tracking-tight text-white">
            CodeReview Agent
          </span>
          <span className="hidden sm:inline text-xs text-slate-500 font-mono">
            Phase 1 · Context-Aware Foundation
          </span>
        </div>

        {/* Zone 2: Navigation Links */}
        <nav className="flex items-center gap-1 sm:gap-2">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap ${
                  isActive
                    ? 'bg-slate-800 text-sky-400 shadow-sm border border-slate-700/80'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Zone 3: Primary Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={onRunAll12Tests}
            disabled={isRunningTests}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-sky-600 hover:bg-sky-500 disabled:opacity-50 rounded-md transition-colors whitespace-nowrap shadow-sm shadow-sky-950"
          >
            {isRunningTests ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Play className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Run 12 Tests</span>
          </button>
        </div>
      </div>
    </header>
  );
};
