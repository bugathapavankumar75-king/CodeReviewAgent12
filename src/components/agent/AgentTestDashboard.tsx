/**
 * Phase 1 Agent Test Dashboard
 * Verifies all 12 required test scenarios: Correct code, Security, Architecture, Validation,
 * Performance, Framework Decoupling, Duplication, Approved Pattern, Exceptions, Rejections, Accepted Rules, Low Confidence.
 */

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, ShieldCheck, RefreshCw, Clock } from 'lucide-react';
import { AgentTestRunner, type AgentTestSuiteSummary, type TestCaseExecutionResult } from '../../agent/test-cases/testRunner';

export const AgentTestDashboard: React.FC = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [summary, setSummary] = useState<AgentTestSuiteSummary | null>(null);

  const handleRunAllTests = () => {
    setIsRunning(true);
    setTimeout(() => {
      const res = AgentTestRunner.runAll();
      setSummary(res);
      setIsRunning(false);
    }, 150);
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
              <span>PHASE 1 ACCEPTANCE SUITE</span>
              <span>·</span>
              <span>12 MANDATORY SCENARIOS</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
              Agent Test &amp; Semantic Verification Suite
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Validates that the agent correctly identifies vulnerabilities and architectural defects,
              while strictly suppressing false positives when code matches documented project exceptions or prior team rejections.
            </p>
          </div>

          <button
            onClick={handleRunAllTests}
            disabled={isRunning}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-all disabled:opacity-50 self-start sm:self-auto"
          >
            {isRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Play className="h-4 w-4 fill-current" />}
            <span>{isRunning ? 'Running 12 Scenarios...' : 'Run All 12 Test Cases'}</span>
          </button>
        </div>

        {/* Metrics Grid */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 font-mono">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">TOTAL SCENARIOS</div>
              <div className="text-xl font-semibold text-white tabular-nums mt-0.5">{summary.totalTests}</div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <div className="text-[11px] text-emerald-400">PASSED</div>
              <div className="text-xl font-semibold text-emerald-300 tabular-nums mt-0.5">{summary.passedCount}</div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
              <div className="text-[11px] text-rose-400">FAILED</div>
              <div className="text-xl font-semibold text-rose-300 tabular-nums mt-0.5">{summary.failedCount}</div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400">TOTAL DURATION</div>
              <div className="text-xl font-semibold text-sky-400 tabular-nums mt-0.5">{summary.totalDurationMs}ms</div>
            </div>
          </div>
        )}
      </div>

      {/* Test Cases Table */}
      {summary ? (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 overflow-hidden">
          <div className="px-5 py-3 border-b border-slate-800 bg-[#0f172a] text-xs font-semibold text-slate-200">
            Semantic Scenario Verifications ({summary.results.length})
          </div>

          <div className="divide-y divide-slate-800/80">
            {summary.results.map((result: TestCaseExecutionResult) => (
              <div
                key={result.testId}
                className="px-5 py-3.5 flex flex-col gap-2 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    {result.passed ? (
                      <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0" />
                    ) : (
                      <XCircle className="h-4 w-4 text-rose-400 shrink-0" />
                    )}
                    <span className="text-xs font-semibold text-white">{result.name}</span>
                  </div>

                  <div className="flex items-center gap-3 text-xs font-mono">
                    <span className="text-slate-400">
                      Expected: <strong className="text-sky-400">{result.expectedCategory}</strong>
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-400">
                      Actual: [
                      <strong className={result.actualCategories.length === 0 ? 'text-emerald-400' : 'text-amber-400'}>
                        {result.actualCategories.join(', ') || 'NONE'}
                      </strong>
                      ]
                    </span>
                    <span className="text-slate-600">·</span>
                    <span className="text-slate-500 tabular-nums">{result.durationMs}ms</span>
                  </div>
                </div>

                {/* Notes and details */}
                <div className="text-xs text-slate-400 pl-7 flex flex-wrap items-center gap-3 font-mono text-[11px]">
                  <span>Notes: {result.response.review_notes}</span>
                  {result.suppressionObserved && (
                    <span className="text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
                      Context Suppression Applied
                    </span>
                  )}
                  {result.failureReason && (
                    <span className="text-rose-400 bg-rose-950/40 p-1.5 rounded border border-rose-900/60 w-full mt-1">
                      {result.failureReason}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
          <ShieldCheck className="h-10 w-10 text-sky-400/50 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">No test execution summary yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Run All 12 Test Cases&quot; to verify the agent&apos;s Phase 1 foundation against all acceptance criteria.
          </p>
        </div>
      )}
    </div>
  );
};
