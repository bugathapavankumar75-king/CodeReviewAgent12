/**
 * Automated Test Runner Dashboard
 * Verifies business logic, repository persistence, and HTTP integration pipelines.
 */

import React, { useState } from 'react';
import { Play, CheckCircle2, XCircle, Clock, ShieldCheck, RefreshCw } from 'lucide-react';
import { ArchitectureEngine } from '../services/architectureEngine';
import type { TestSuiteSummary } from '../../tests/testRunner';
import type { TestResult } from '../../tests/unit/services.test';

interface TestDashboardProps {
  onTestComplete?: () => void;
}

export const TestDashboard: React.FC<TestDashboardProps> = () => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [summary, setSummary] = useState<TestSuiteSummary | null>(null);
  const [filter, setFilter] = useState<'all' | 'passed' | 'failed'>('all');

  const handleRunTests = async () => {
    setIsRunning(true);
    try {
      const res = await ArchitectureEngine.executeTests();
      setSummary(res);
    } catch (e) {
      console.error('Test execution failed', e);
    } finally {
      setIsRunning(false);
    }
  };

  const filteredResults: TestResult[] = summary?.results.filter((r: TestResult) => {
    if (filter === 'passed') return r.passed;
    if (filter === 'failed') return !r.passed;
    return true;
  }) || [];

  return (
    <div className="space-y-6">
      {/* Test Runner Control Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
              <span>TEST SUITE · UNIT & INTEGRATION</span>
              <span>·</span>
              <span>TESTS/ DIRECTORY</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
              Architecture Test Runner
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Executes isolated unit tests verifying service business logic &amp; model repository contracts,
              plus end-to-end integration tests validating HTTP controller &amp; routing pipelines.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunTests}
              disabled={isRunning}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-all disabled:opacity-50"
            >
              {isRunning ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Play className="h-4 w-4 fill-current" />
              )}
              <span>{isRunning ? 'Running Test Suites...' : 'Run All Test Suites'}</span>
            </button>
          </div>
        </div>

        {/* Metrics Grid */}
        {summary && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80">
            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">TOTAL TESTS</div>
              <div className="text-xl font-semibold text-white font-mono tabular-nums mt-0.5">
                {summary.totalTests}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-emerald-950/20 border border-emerald-900/40">
              <div className="text-[11px] text-emerald-400 font-mono">PASSED</div>
              <div className="text-xl font-semibold text-emerald-300 font-mono tabular-nums mt-0.5">
                {summary.passedCount}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-rose-950/20 border border-rose-900/40">
              <div className="text-[11px] text-rose-400 font-mono">FAILED</div>
              <div className="text-xl font-semibold text-rose-300 font-mono tabular-nums mt-0.5">
                {summary.failedCount}
              </div>
            </div>

            <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800">
              <div className="text-[11px] text-slate-400 font-mono">EXECUTION TIME</div>
              <div className="text-xl font-semibold text-sky-400 font-mono tabular-nums mt-0.5">
                {summary.totalDurationMs}ms
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Test Results Table */}
      {summary ? (
        <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 overflow-hidden">
          {/* Filter Bar */}
          <div className="flex items-center justify-between px-5 py-3 border-b border-slate-800 bg-[#0f172a]">
            <div className="text-xs font-semibold text-slate-200">
              Test Assertions ({filteredResults.length})
            </div>

            <div className="flex items-center gap-1 p-0.5 bg-slate-900 rounded-lg border border-slate-800">
              {(['all', 'passed', 'failed'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setFilter(mode)}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md capitalize transition-colors ${
                    filter === mode
                      ? 'bg-slate-800 text-sky-400 shadow-sm'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {mode}
                </button>
              ))}
            </div>
          </div>

          <div className="divide-y divide-slate-800/80">
            {filteredResults.map((test: TestResult, idx: number) => (
              <div
                key={idx}
                className="px-5 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2 hover:bg-slate-800/30 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-3">
                  {test.passed ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5 sm:mt-0" />
                  ) : (
                    <XCircle className="h-4 w-4 text-rose-400 shrink-0 mt-0.5 sm:mt-0" />
                  )}

                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-slate-200">{test.name}</span>
                      <span className="text-[10px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded border border-slate-700/60">
                        {test.suite}
                      </span>
                    </div>
                    {test.error && (
                      <p className="mt-1 text-xs font-mono text-rose-400 bg-rose-950/40 p-2 rounded border border-rose-900/60">
                        {test.error}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-500 self-end sm:self-auto">
                  <Clock className="h-3 w-3" />
                  <span className="tabular-nums">{test.durationMs}ms</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-10 text-center bg-slate-900/20">
          <ShieldCheck className="h-10 w-10 text-sky-500/50 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">No test run executed yet</h4>
          <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
            Click &quot;Run All Test Suites&quot; to execute all assertions across unit and integration suites.
          </p>
        </div>
      )}
    </div>
  );
};
