/**
 * Context Priority & False-Positive Prevention Matrix
 * Visualizes Section 13 (Context Priority) and Section 14 (Avoid False Positives).
 */

import React from 'react';
import { Shield, ArrowDown, Check, X, Layers, AlertCircle, Compass, Zap } from 'lucide-react';
import { CONTEXT_PRIORITY_HIERARCHY } from '../../agent/config/contextPriority';
import { FALSE_POSITIVE_POLICIES } from '../../agent/config/falsePositiveRules';

export const AgentPriorityMatrix: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
        <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
          <span>SECTION 13 &amp; 14 · CONTEXT PRECEDENCE</span>
          <span>·</span>
          <span>ANTI-NOISE DISCIPLINE</span>
        </div>
        <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
          Context Priority Hierarchy &amp; False-Positive Prevention
        </h2>
        <p className="mt-1 text-xs text-slate-400 max-w-3xl">
          Generic textbook recommendations are always subordinated to explicit project architecture,
          threat models, and team standards. The engine operates under strict anti-false-positive constraints.
        </p>
      </div>

      {/* Priority Hierarchy Stack */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-white">
              Strict Context Priority Ordering (Highest to Lowest)
            </h3>
            <span className="text-xs font-mono text-sky-400">Higher rank overrides lower</span>
          </div>

          <div className="space-y-2.5">
            {CONTEXT_PRIORITY_HIERARCHY.map((tier, idx) => (
              <div
                key={tier.id}
                className="p-3 rounded-lg border border-slate-800 bg-slate-900/60 flex items-start gap-3 hover:border-slate-700 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-800 text-sky-400 font-mono text-xs font-bold shrink-0 mt-0.5">
                  {idx + 1}
                </div>

                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-100">{tier.title}</span>
                    <span className="text-[11px] font-mono text-slate-400">Rank: {tier.rank}</span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 leading-relaxed">{tier.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className="mt-4 p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 text-xs text-sky-300">
            <strong>Key Guarantee:</strong> When a generic best practice contradicts an established project architecture rule
            or team decision, the project-specific context automatically wins without exception.
          </div>
        </div>

        {/* False Positive Rules Column */}
        <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white">False-Positive Prevention Policies</h3>
              <span className="text-xs font-mono text-emerald-400">Strict Anti-Noise</span>
            </div>

            <div className="space-y-3">
              {FALSE_POSITIVE_POLICIES.map((policy) => (
                <div key={policy.id} className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/80 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-200">{policy.name}</span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                        policy.filterAction === 'SUPPRESS'
                          ? 'bg-emerald-950/50 text-emerald-400 border-emerald-800'
                          : policy.filterAction === 'DROP'
                          ? 'bg-rose-950/50 text-rose-400 border-rose-800'
                          : 'bg-amber-950/50 text-amber-400 border-amber-800'
                      }`}
                    >
                      {policy.filterAction}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{policy.description}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 font-mono">
            Enforced in Phase 1 engine core before any finding reaches developer notification.
          </div>
        </div>
      </div>
    </div>
  );
};
