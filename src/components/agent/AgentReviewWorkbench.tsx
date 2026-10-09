/**
 * Context-Aware Review Workbench
 * Interactive review runner, finding inspector, and developer feedback simulator.
 */

import React, { useState } from 'react';
import { Play, CheckCircle2, ShieldAlert, AlertTriangle, Info, Send, ThumbsUp, ThumbsDown, Edit3, XCircle, Check, Sparkles } from 'lucide-react';
import { ReviewEngine } from '../../agent/review/reviewEngine';
import { FeedbackProcessor } from '../../agent/feedback/feedbackProcessor';
import { REVIEW_TEST_CASES } from '../../agent/test-cases/testCases.data';
import type { ReviewResponse, ReviewFinding } from '../../agent/models/reviewOutput.model';
import type { FeedbackAction } from '../../agent/feedback/feedback.model';
import { SEVERITY_LEVELS } from '../../agent/models/severity.model';
import { ConfidenceUtils } from '../../agent/models/confidence.model';

export const AgentReviewWorkbench: React.FC = () => {
  const [selectedTestCaseId, setSelectedTestCaseId] = useState<string>('TC-002');
  const [activeReviewResponse, setActiveReviewResponse] = useState<ReviewResponse | null>(null);
  const [feedbackReasons, setFeedbackReasons] = useState<Record<string, string>>({});
  const [markAsTeamRule, setMarkAsTeamRule] = useState<Record<string, boolean>>({});
  const [feedbackStatus, setFeedbackStatus] = useState<Record<string, string>>({});

  const currentTestCase = REVIEW_TEST_CASES.find((tc) => tc.id === selectedTestCaseId) || REVIEW_TEST_CASES[1];

  const handleRunReview = () => {
    const res = ReviewEngine.evaluate(currentTestCase.input);
    setActiveReviewResponse(res);
  };

  const handleSendFeedback = (finding: ReviewFinding, action: FeedbackAction) => {
    const reason = feedbackReasons[finding.finding_id] || `Developer selected ${action}`;
    const isTeamRule = markAsTeamRule[finding.finding_id] || false;

    const result = FeedbackProcessor.recordFeedback({
      feedback_id: `FB-${Date.now().toString(36).toUpperCase()}`,
      developer_id: 'usr_current_engineer',
      review_id: activeReviewResponse?.review_id || 'REV-DEFAULT',
      finding_id: finding.finding_id,
      rule_id: finding.rule_id,
      file: finding.file,
      decision: action,
      reason,
      mark_as_team_decision: isTeamRule,
      timestamp: new Date().toISOString(),
    });

    setFeedbackStatus((prev) => ({
      ...prev,
      [finding.finding_id]: `${action} recorded: ${result.message}`,
    }));

    // If developer rejected, re-run review immediately to show that the finding is now suppressed!
    if (action === 'REJECT') {
      setTimeout(() => {
        const reevaluated = ReviewEngine.evaluate(currentTestCase.input);
        setActiveReviewResponse(reevaluated);
      }, 700);
    }
  };

  return (
    <div className="space-y-6">
      {/* Scenario / Input Selector */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
              <span>CONTEXT-AWARE CODE REVIEW WORKBENCH</span>
              <span>·</span>
              <span>GROUNDED IN PROJECT KNOWLEDGE</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
              Review Evaluation &amp; Feedback Console
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-2xl">
              Select a code change scenario, execute the review engine, inspect findings against project rules,
              and record developer feedback to simulate team memory evolution.
            </p>
          </div>

          <button
            onClick={handleRunReview}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-all self-start sm:self-auto"
          >
            <Play className="h-4 w-4 fill-current" />
            <span>Analyze Code Changes</span>
          </button>
        </div>

        {/* Preset Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <label className="block text-xs font-medium text-slate-400 mb-2">Select Code Change Input:</label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {REVIEW_TEST_CASES.slice(0, 8).map((tc) => {
              const isSelected = selectedTestCaseId === tc.id;
              return (
                <button
                  key={tc.id}
                  onClick={() => {
                    setSelectedTestCaseId(tc.id);
                    setActiveReviewResponse(null);
                  }}
                  className={`p-2.5 rounded-lg text-left text-xs transition-colors border ${
                    isSelected
                      ? 'bg-slate-800 border-sky-500 text-white shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                  }`}
                >
                  <div className="font-semibold truncate">{tc.name}</div>
                  <div className="text-[11px] text-slate-500 font-mono truncate mt-0.5">
                    {tc.input.code.changedFiles[0]?.path}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Code Diff Preview */}
        <div className="mt-4 p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-xs font-mono">
          <div className="flex items-center justify-between text-slate-500 pb-2 mb-2 border-b border-slate-800/80 text-[11px]">
            <span>Git Diff: {currentTestCase.input.code.changedFiles[0]?.path}</span>
            <span>{currentTestCase.description}</span>
          </div>
          <pre className="text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
            {currentTestCase.input.code.changedFiles[0]?.diff}
          </pre>
        </div>
      </div>

      {/* Review Response Display */}
      {activeReviewResponse ? (
        <div className="space-y-5">
          {/* Summary & Metadata Card */}
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5">
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <span>REVIEW ID: {activeReviewResponse.review_id}</span>
                  <span>·</span>
                  <span>{activeReviewResponse.timestamp.split('T')[1].slice(0, 8)} UTC</span>
                </div>
                <h3 className="text-base font-semibold text-white mt-1">Review Response Summary</h3>
                <p className="text-xs text-slate-400 mt-0.5">{activeReviewResponse.review_notes}</p>
              </div>

              {/* Context Used Badges */}
              <div className="flex flex-wrap gap-1.5 self-start lg:self-auto">
                {activeReviewResponse.context_used.map((ctx, idx) => (
                  <span
                    key={idx}
                    className="px-2.5 py-1 rounded-md text-xs font-mono font-medium bg-slate-800/90 text-sky-400 border border-slate-700/80"
                  >
                    {ctx}
                  </span>
                ))}
              </div>
            </div>

            {/* Counts Breakdown Grid */}
            <div className="grid grid-cols-2 sm:grid-cols-6 gap-3 mt-4 pt-4 border-t border-slate-800/80 font-mono text-xs">
              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">FILES / LINES</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {activeReviewResponse.summary.files_reviewed} / {activeReviewResponse.summary.lines_changed}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">TOTAL FINDINGS</div>
                <div className="text-sm font-semibold text-white mt-0.5">
                  {activeReviewResponse.summary.findings_count}
                </div>
              </div>

              <div className="p-2.5 rounded bg-rose-950/30 border border-rose-900/50">
                <div className="text-[10px] text-rose-400">CRITICAL</div>
                <div className="text-sm font-semibold text-rose-300 mt-0.5">
                  {activeReviewResponse.summary.critical_count}
                </div>
              </div>

              <div className="p-2.5 rounded bg-orange-950/30 border border-orange-900/50">
                <div className="text-[10px] text-orange-400">HIGH</div>
                <div className="text-sm font-semibold text-orange-300 mt-0.5">
                  {activeReviewResponse.summary.high_count}
                </div>
              </div>

              <div className="p-2.5 rounded bg-amber-950/30 border border-amber-900/50">
                <div className="text-[10px] text-amber-400">MEDIUM</div>
                <div className="text-sm font-semibold text-amber-300 mt-0.5">
                  {activeReviewResponse.summary.medium_count}
                </div>
              </div>

              <div className="p-2.5 rounded bg-slate-900/60 border border-slate-800">
                <div className="text-[10px] text-slate-400">LOW / INFO</div>
                <div className="text-sm font-semibold text-slate-300 mt-0.5">
                  {activeReviewResponse.summary.low_count} / {activeReviewResponse.summary.info_count}
                </div>
              </div>
            </div>
          </div>

          {/* Finding Cards */}
          {activeReviewResponse.findings.length > 0 ? (
            <div className="space-y-4">
              {activeReviewResponse.findings.map((finding) => {
                const sevMeta = SEVERITY_LEVELS[finding.severity];

                return (
                  <div
                    key={finding.finding_id}
                    className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5 space-y-4"
                  >
                    {/* Header line */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800/80">
                      <div className="flex items-center gap-2.5">
                        <span className={`px-2.5 py-0.5 rounded text-xs font-mono font-bold ${sevMeta.badgeStyle}`}>
                          {finding.severity}
                        </span>
                        <span className="px-2 py-0.5 rounded text-xs font-mono bg-slate-800 text-slate-300 border border-slate-700">
                          {finding.category}
                        </span>
                        <span className="text-sm font-semibold text-white">{finding.title}</span>
                      </div>

                      <div className="flex items-center gap-3 text-xs font-mono">
                        <span className="text-sky-400">Rule: {finding.rule_id}</span>
                        <span className="text-slate-600">·</span>
                        <span className="text-slate-400">
                          Confidence: <strong className="text-emerald-400">{ConfidenceUtils.formatPercentage(finding.confidence)}</strong>
                        </span>
                      </div>
                    </div>

                    {/* File & Location */}
                    <div className="text-xs font-mono text-slate-400">
                      <span className="text-slate-500">Location: </span>
                      <span className="text-sky-300">{finding.file}</span>
                      <span className="text-slate-500">:line {finding.line}</span>
                    </div>

                    {/* Problem Statement */}
                    <div>
                      <div className="text-xs font-medium text-slate-300 mb-1">Problem Identified:</div>
                      <p className="text-xs text-slate-400 leading-relaxed bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/60">
                        {finding.problem}
                      </p>
                    </div>

                    {/* Evidence & Reason */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <div className="font-medium text-slate-400 mb-1">Concrete Evidence:</div>
                        <p className="text-slate-300 font-mono text-[11px] bg-slate-950 p-2 rounded border border-slate-900">
                          {finding.evidence}
                        </p>
                      </div>
                      <div>
                        <div className="font-medium text-slate-400 mb-1">Why this Matters:</div>
                        <p className="text-slate-300 text-xs bg-slate-950 p-2 rounded border border-slate-900 leading-relaxed">
                          {finding.reason}
                        </p>
                      </div>
                    </div>

                    {/* Actionable Recommendation */}
                    <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 text-xs">
                      <div className="font-medium text-sky-400 mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5" />
                        <span>Actionable Recommendation:</span>
                      </div>
                      <p className="text-slate-200 leading-relaxed">{finding.recommendation}</p>
                    </div>

                    {/* Developer Feedback Action Section */}
                    <div className="mt-4 pt-3 border-t border-slate-800/80 bg-slate-900/40 -mx-5 -mb-5 p-4 rounded-b-xl space-y-3">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <span className="text-xs font-medium text-slate-300 flex items-center gap-1.5">
                          <Edit3 className="h-3.5 w-3.5 text-sky-400" />
                          <span>Developer Feedback &amp; Action:</span>
                        </span>

                        <label className="flex items-center gap-2 text-xs text-slate-400 cursor-pointer select-none">
                          <input
                            type="checkbox"
                            checked={markAsTeamRule[finding.finding_id] || false}
                            onChange={(e) =>
                              setMarkAsTeamRule((prev) => ({
                                ...prev,
                                [finding.finding_id]: e.target.checked,
                              }))
                            }
                            className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0"
                          />
                          <span>Promote decision to permanent team rule</span>
                        </label>
                      </div>

                      {/* Reason input */}
                      <input
                        type="text"
                        placeholder="Developer explanation or rationale (e.g. 'Performance benchmark PR-142 showed...')"
                        value={feedbackReasons[finding.finding_id] || ''}
                        onChange={(e) =>
                          setFeedbackReasons((prev) => ({
                            ...prev,
                            [finding.finding_id]: e.target.value,
                          }))
                        }
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-sky-500"
                      />

                      {/* Feedback buttons */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        <button
                          onClick={() => handleSendFeedback(finding, 'ACCEPT')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-300 border border-emerald-800 transition-colors"
                        >
                          <ThumbsUp className="h-3 w-3" />
                          <span>ACCEPT</span>
                        </button>

                        <button
                          onClick={() => handleSendFeedback(finding, 'REJECT')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-800 transition-colors"
                          title="Rejecting will record rationale in memory and suppress future identical findings"
                        >
                          <ThumbsDown className="h-3 w-3" />
                          <span>REJECT</span>
                        </button>

                        <button
                          onClick={() => handleSendFeedback(finding, 'MODIFY')}
                          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-amber-950/60 hover:bg-amber-900/80 text-amber-300 border border-amber-800 transition-colors"
                        >
                          <Edit3 className="h-3 w-3" />
                          <span>MODIFY</span>
                        </button>

                        <button
                          onClick={() => handleSendFeedback(finding, 'NOT_APPLICABLE')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          NOT_APPLICABLE
                        </button>

                        <button
                          onClick={() => handleSendFeedback(finding, 'ALREADY_FIXED')}
                          className="px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                        >
                          ALREADY_FIXED
                        </button>
                      </div>

                      {feedbackStatus[finding.finding_id] && (
                        <div className="text-xs font-mono text-emerald-400 bg-emerald-950/40 p-2 rounded border border-emerald-900/60">
                          {feedbackStatus[finding.finding_id]}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="p-8 text-center rounded-xl border border-slate-800 bg-[#0f172a]/60">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-sm font-semibold text-white">Zero Defects Found</h4>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                The code changes fully comply with all project architecture rules, security standards,
                exceptions, and team precedents.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="p-10 text-center rounded-xl border border-dashed border-slate-800 bg-slate-900/20">
          <Sparkles className="h-10 w-10 text-sky-400/50 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-slate-200">Ready to perform context-aware code review</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click &quot;Analyze Code Changes&quot; to test the engine with the selected scenario.
          </p>
        </div>
      )}
    </div>
  );
};
