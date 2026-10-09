/**
 * Team Memory & Feedback Evolution Explorer
 * Explains and visualizes the separation of AI suggestions, Developer decisions, and Established Team Rules.
 */

import React, { useState } from 'react';
import { History, ShieldCheck, UserCheck, Bot, ArrowDown, Sparkles, Check, Trash2 } from 'lucide-react';
import { TeamMemoryStore } from '../../agent/memory/memoryStore';
import { FeedbackProcessor } from '../../agent/feedback/feedbackProcessor';
import type { MemoryRecord } from '../../agent/memory/memory.model';

export const AgentMemoryExplorer: React.FC = () => {
  const [records, setRecords] = useState<MemoryRecord[]>(TeamMemoryStore.getRecords());
  const feedbackHistory = FeedbackProcessor.getFeedbackHistory();

  const handleRefresh = () => {
    setRecords(TeamMemoryStore.getRecords());
  };

  const authorityBadges: Record<string, { label: string; icon: any; style: string }> = {
    AI_SUGGESTION: {
      label: 'AI Suggestion (Transient)',
      icon: Bot,
      style: 'text-slate-400 bg-slate-900 border-slate-700',
    },
    DEVELOPER_DECISION: {
      label: 'Developer Decision (Human Action)',
      icon: UserCheck,
      style: 'text-amber-400 bg-amber-950/40 border-amber-800',
    },
    ESTABLISHED_TEAM_RULE: {
      label: 'Established Team Rule (Permanent Consensus)',
      icon: ShieldCheck,
      style: 'text-emerald-400 bg-emerald-950/40 border-emerald-800',
    },
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
          <span>TEAM MEMORY &amp; FEEDBACK MODEL</span>
          <span>·</span>
          <span>STRICT VALIDATION GATE</span>
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
          Validated Team Memory &amp; Feedback Precedents
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-3xl">
          The agent maintains an explicit distinction between transient AI observations, individual developer actions,
          and validated team decisions. AI suggestions are never automatically converted into permanent team rules.
        </p>
      </div>

      {/* Memory Update Logic Diagram (Section 11) */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/40 p-5">
        <div className="text-xs font-semibold text-white mb-3">
          Section 11: Memory Update Flow Pipeline
        </div>

        <div className="grid grid-cols-1 md:grid-cols-6 gap-2 text-center text-xs">
          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <Bot className="h-4 w-4 text-sky-400 mb-1" />
            <div className="font-semibold text-slate-200">1. AI Finding</div>
            <div className="text-[10px] text-slate-500 mt-1">Transient observation</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <UserCheck className="h-4 w-4 text-amber-400 mb-1" />
            <div className="font-semibold text-slate-200">2. Dev Review</div>
            <div className="text-[10px] text-slate-500 mt-1">Human scrutiny</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <div className="text-xs font-mono font-bold text-sky-400 mb-1">ACCEPT / REJECT</div>
            <div className="font-semibold text-slate-200">3. Decision</div>
            <div className="text-[10px] text-slate-500 mt-1">Explicit action</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <History className="h-4 w-4 text-purple-400 mb-1" />
            <div className="font-semibold text-slate-200">4. Reason Log</div>
            <div className="text-[10px] text-slate-500 mt-1">Audit trail recorded</div>
          </div>

          <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 flex flex-col items-center justify-center">
            <ShieldCheck className="h-4 w-4 text-emerald-400 mb-1" />
            <div className="font-semibold text-slate-200">5. Validation Gate</div>
            <div className="text-[10px] text-slate-500 mt-1">Consensus check</div>
          </div>

          <div className="p-3 rounded-lg bg-emerald-950/30 border border-emerald-800/60 flex flex-col items-center justify-center">
            <Sparkles className="h-4 w-4 text-emerald-400 mb-1" />
            <div className="font-semibold text-emerald-300">6. Team Memory</div>
            <div className="text-[10px] text-emerald-500 mt-1">Reusable context</div>
          </div>
        </div>
      </div>

      {/* Active Memory Records Table */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 overflow-hidden">
        <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0f172a]">
          <div className="text-xs font-semibold text-white">
            Active Team Memory Records ({records.length})
          </div>
          <button
            onClick={handleRefresh}
            className="text-xs text-slate-400 hover:text-white font-mono"
          >
            Refresh Records
          </button>
        </div>

        <div className="divide-y divide-slate-800/80">
          {records.map((rec) => {
            const auth = authorityBadges[rec.authority_level] || authorityBadges.DEVELOPER_DECISION;

            return (
              <div key={rec.memory_id} className="p-4 space-y-2 hover:bg-slate-800/20 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs font-bold text-sky-400 bg-sky-950/60 px-2 py-0.5 rounded border border-sky-800">
                      {rec.memory_id}
                    </span>
                    <span className="text-xs font-mono text-slate-300 bg-slate-800 px-2 py-0.5 rounded">
                      {rec.type}
                    </span>
                    <span className="text-xs font-semibold text-white">{rec.content}</span>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-medium border flex items-center gap-1 ${auth.style}`}>
                    <auth.icon className="h-3 w-3" />
                    <span>{auth.label}</span>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs text-slate-400 font-mono text-[11px] pt-1">
                  <div>
                    <span className="text-slate-500">Rule: </span>
                    <span className="text-sky-300">{rec.rule_id}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Scope: </span>
                    <span className="text-slate-300">{rec.file_pattern}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Author: </span>
                    <span className="text-slate-300">{rec.developer_id || 'System'}</span>
                  </div>
                </div>

                {rec.developer_reason && (
                  <div className="text-xs text-slate-300 bg-slate-900/80 p-2.5 rounded-lg border border-slate-800/80 mt-1">
                    <span className="text-slate-500 text-[10px] uppercase font-mono block mb-0.5">Developer Reason:</span>
                    {rec.developer_reason}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Feedback Audit Log */}
      {feedbackHistory.length > 0 && (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-4">
          <div className="text-xs font-semibold text-slate-300 mb-2 font-mono">
            Recent Feedback Audit Log ({feedbackHistory.length} actions recorded):
          </div>
          <div className="space-y-1.5 font-mono text-xs">
            {feedbackHistory.slice(-5).map((fb) => (
              <div key={fb.feedback_id} className="p-2 rounded bg-slate-900/60 border border-slate-800 flex items-center justify-between text-[11px]">
                <div className="flex items-center gap-2">
                  <span className="text-sky-400">{fb.decision}</span>
                  <span className="text-slate-400">on {fb.rule_id}</span>
                  <span className="text-slate-500">({fb.file})</span>
                </div>
                <span className="text-slate-500">{fb.reason}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
