/**
 * Knowledge Page Component
 * Displays the Phase 1 Knowledge System with tabs for:
 * - Coding Standards
 * - Architecture Rules
 * - Security Rules
 * - Project Patterns
 * - Review History
 * - Exceptions
 */

import React, { useState } from 'react';
import {
  BookOpen,
  Shield,
  Layers,
  Code,
  Sparkles,
  History,
  AlertOctagon,
  Search,
  CheckCircle2,
} from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { KnowledgeRepository } from '../../agent/knowledge/index';
import { SEVERITY_LEVELS } from '../../agent/models/severity.model';
import type {
  SecurityRuleItem,
  ArchitectureRuleItem,
  CodingStandardItem,
  ProjectPatternItem,
  ReviewExceptionItem,
  ReviewHistoryItem,
} from '../../agent/knowledge/knowledge.types';

interface KnowledgePageProps {
  onNavigate?: (route: AppRoute) => void;
}

type KnowledgeTab =
  | 'standards'
  | 'architecture'
  | 'security'
  | 'patterns'
  | 'history'
  | 'exceptions';

export const KnowledgePage: React.FC<KnowledgePageProps> = () => {
  const [activeTab, setActiveTab] = useState<KnowledgeTab>('security');

  const standards = KnowledgeRepository.getCodingStandards();
  const archRules = KnowledgeRepository.getArchitectureRules();
  const secRules = KnowledgeRepository.getSecurityRules();
  const patterns = KnowledgeRepository.getProjectPatterns();
  const exceptions = KnowledgeRepository.getReviewExceptions();
  const reviewHistory = KnowledgeRepository.getReviewHistory();

  const tabs: { id: KnowledgeTab; label: string; count: number; icon: React.FC<{ className?: string }> }[] = [
    { id: 'security', label: 'Security Rules', count: secRules.length, icon: Shield },
    { id: 'architecture', label: 'Architecture Rules', count: archRules.length, icon: Layers },
    { id: 'standards', label: 'Coding Standards', count: standards.length, icon: Code },
    { id: 'patterns', label: 'Project Patterns', count: patterns.length, icon: Sparkles },
    { id: 'exceptions', label: 'Review Exceptions', count: exceptions.length, icon: AlertOctagon },
    { id: 'history', label: 'Review History', count: reviewHistory.length, icon: History },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
            <BookOpen className="h-6 w-6 text-sky-400" />
            <span>Project Knowledge Base</span>
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Explicit team standards, architectural invariants, threat constraints, and approved exceptions used by the AI Review Engine.
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-800 pb-2 scrollbar-none text-xs font-mono">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;

          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl whitespace-nowrap transition-colors ${
                isActive
                  ? 'bg-sky-600 text-white font-semibold shadow-md shadow-sky-950'
                  : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${isActive ? 'bg-sky-700 text-white' : 'bg-slate-800 text-slate-400'}`}>
                {tab.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Security Rules */}
      {activeTab === 'security' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {secRules.map((r: SecurityRuleItem) => {
              const sev = SEVERITY_LEVELS[r.severity] || SEVERITY_LEVELS['HIGH'];
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/80 px-2 py-0.5 rounded border border-sky-800">
                          {r.id}
                        </span>
                        <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${sev.badgeStyle}`}>
                          {r.severity}
                        </span>
                        {r.cwe && (
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-400 border border-slate-700">
                            {r.cwe}
                          </span>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-white tracking-tight">{r.name}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-300 leading-relaxed bg-[#0b0f17] p-3 rounded-xl border border-slate-800/80">
                    {r.rule}
                  </p>

                  <div className="text-xs text-slate-400 space-y-1 text-[11px] font-mono">
                    <span className="text-slate-500 uppercase block">Rationale:</span>
                    <span className="text-slate-300">{r.rationale}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Architecture Rules */}
      {activeTab === 'architecture' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {archRules.map((r: ArchitectureRuleItem) => {
              const sev = SEVERITY_LEVELS[r.severity] || SEVERITY_LEVELS['HIGH'];
              return (
                <div
                  key={r.id}
                  className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-indigo-400 bg-indigo-950/80 px-2 py-0.5 rounded border border-indigo-800">
                      {r.id}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold ${sev.badgeStyle}`}>
                      {r.severity}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      Boundary: {r.boundary}
                    </span>
                  </div>
                  <h3 className="text-sm font-semibold text-white">{r.name}</h3>
                  <p className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-xl border border-slate-800/80">
                    {r.rule}
                  </p>
                  <div className="text-[11px] font-mono text-slate-400">
                    <span className="text-slate-500 block uppercase mb-0.5">Enforcement Rationale:</span>
                    <span>{r.rationale}</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 3: Coding Standards */}
      {activeTab === 'standards' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {standards.map((s: CodingStandardItem) => (
              <div
                key={s.id}
                className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-800">
                    {s.id}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {s.category}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{s.name}</h3>
                <p className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-xl border border-slate-800/80">
                  {s.rule}
                </p>
                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-900/50 text-xs text-emerald-200">
                  <strong className="text-emerald-400 block text-[10px] uppercase font-mono">Good Practice:</strong>
                  <span className="font-mono text-[11px]">{s.goodExample}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 4: Project Patterns */}
      {activeTab === 'patterns' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {patterns.map((p: ProjectPatternItem) => (
              <div
                key={p.id}
                className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 space-y-3 shadow-sm hover:border-slate-700 transition-colors"
              >
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-800">
                    {p.id}
                  </span>
                  <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-2 py-0.5 rounded border border-slate-700">
                    {p.referenceFile}
                  </span>
                </div>
                <h3 className="text-sm font-semibold text-white">{p.patternName}</h3>
                <p className="text-xs text-slate-300 bg-[#0b0f17] p-3 rounded-xl border border-slate-800/80">
                  {p.problemSolved}
                </p>
                <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono text-slate-300">
                  <span className="text-slate-500 block text-[10px] uppercase mb-0.5">Solution Template:</span>
                  <span className="text-slate-200">{p.solutionTemplate}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Exceptions */}
      {activeTab === 'exceptions' && (
        <div className="space-y-4">
          <div className="space-y-3">
            {exceptions.map((e: ReviewExceptionItem) => (
              <div
                key={e.id}
                className="p-5 rounded-2xl border border-slate-800 bg-[#0f172a]/80 space-y-2 shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-rose-400 bg-rose-950/80 px-2 py-0.5 rounded border border-rose-800">
                      Rule: {e.ruleId}
                    </span>
                    <span className="font-mono text-xs text-slate-300">{e.scope}</span>
                  </div>
                  <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-950 text-emerald-400 border border-emerald-800">
                    Approved Exception
                  </span>
                </div>
                <p className="text-xs text-slate-300">
                  <strong>Reason:</strong> {e.reason}
                </p>
                <div className="text-[11px] font-mono text-slate-500">
                  Approved by {e.approvedBy} · {e.expiresAt ? `Expires: ${e.expiresAt}` : 'Permanent policy'}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 6: Review History */}
      {activeTab === 'history' && (
        <div className="space-y-4">
          {reviewHistory.length > 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#0f172a]/80 divide-y divide-slate-800 overflow-hidden shadow-sm">
              {reviewHistory.map((h: ReviewHistoryItem) => (
                <div key={h.id} className="p-4 flex items-center justify-between text-xs font-mono">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-white font-semibold">{h.id}</span>
                      <span className="text-slate-500">·</span>
                      <span className="text-sky-400">Rule {h.ruleId}</span>
                      <span className="text-slate-400">({h.filePattern})</span>
                    </div>
                    <div className="text-slate-400 text-[11px]">
                      Decision: <strong className={h.developerDecision === 'ACCEPT' ? 'text-emerald-400' : 'text-rose-400'}>{h.developerDecision}</strong> — {h.developerReason}
                    </div>
                  </div>

                  <span className="px-2 py-1 rounded bg-slate-800 text-slate-300 text-[11px]">
                    {h.establishedTeamRule ? 'Team Rule' : 'Recorded Decision'}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center text-xs text-slate-500 rounded-xl border border-slate-800 bg-[#0f172a]/60">
              No previous reviews logged.
            </div>
          )}
        </div>
      )}
    </div>
  );
};
