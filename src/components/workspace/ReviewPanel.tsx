/**
 * Workspace Review Results Panel
 * Displays structured, comprehensive review findings directly BELOW the code editor.
 * Includes:
 * - Dynamic Review Summary: Files Reviewed, Lines Analyzed, Issues Found, Severity breakdown
 * - Animated Loading Checklist state when review is executing
 * - Clean "No significant issues found" state when code is clean
 * - Finding cards with Severity, Category, Title, File : Line, Problem, Evidence, Why it matters, Recommendation, Confidence
 * - Click-to-code [ View Code ] navigation jumping to the exact line in the editor
 * - [ Mark as Fixed ] shortcut and [ Feedback ] actions (Accept, Reject, Ignore, Modify, N/A)
 * - Re-Review comparison delta (Previous vs Current, Resolved, Remaining, New)
 */

import React, { useState } from 'react';
import {
  AlertTriangle,
  ShieldAlert,
  CheckCircle2,
  Check,
  ThumbsUp,
  ThumbsDown,
  Edit3,
  ExternalLink,
  Filter,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle,
  HelpCircle,
  FileCheck,
  MessageSquare,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import type { ReviewFinding, ReviewResponse } from '../../agent/models/reviewOutput.model';
import type { ReReviewDiff } from './types';
import type { FeedbackAction } from '../../agent/feedback/feedback.model';
import { SEVERITY_LEVELS } from '../../agent/models/severity.model';
import { ConfidenceUtils } from '../../agent/models/confidence.model';

interface ReviewPanelProps {
  isReviewing?: boolean;
  reviewResponse: ReviewResponse | null;
  reReviewDiff: ReReviewDiff | null;
  onNavigateToLine: (file: string, line: number) => void;
  onSendFeedback: (
    finding: ReviewFinding,
    action: FeedbackAction,
    reason: string,
    markAsTeamRule: boolean
  ) => void;
  activeFilePath?: string;
  activeFileName?: string;
  activeFileLineCount?: number;
}

export const ReviewPanel: React.FC<ReviewPanelProps> = ({
  isReviewing = false,
  reviewResponse,
  reReviewDiff,
  onNavigateToLine,
  onSendFeedback,
  activeFilePath,
  activeFileName,
  activeFileLineCount = 0,
}) => {
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [categoryFilter, setCategoryFilter] = useState<string>('ALL');
  const [expandedFeedbackId, setExpandedFeedbackId] = useState<string | null>(null);
  const [feedbackInputs, setFeedbackInputs] = useState<Record<string, string>>({});
  const [teamRuleMarks, setTeamRuleMarks] = useState<Record<string, boolean>>({});
  const [feedbackSuccessMsgs, setFeedbackSuccessMsgs] = useState<Record<string, string>>({});

  // 1. SECTION 8: LOADING STATE
  if (isReviewing) {
    return (
      <div className="rounded-xl border border-sky-900/60 bg-[#0f172a]/90 p-8 shadow-xl space-y-5 animate-fade-in">
        <div className="flex items-center justify-center gap-3">
          <RefreshCw className="h-6 w-6 text-sky-400 animate-spin" />
          <h3 className="text-base font-semibold text-white tracking-tight">Analyzing your code...</h3>
        </div>
        <p className="text-xs text-slate-400 text-center max-w-md mx-auto">
          Executing multi-category evaluation on <span className="font-mono text-sky-300">{activeFileName || 'active file'}</span> against project context, coding standards, and security rules:
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 max-w-2xl mx-auto pt-2 text-xs font-mono text-slate-300">
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Syntax &amp; Parsing</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Logic &amp; Flow</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Security &amp; Auth</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Performance</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Architecture</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Code Quality</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Error Handling</span>
          </div>
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800">
            <Check className="h-4 w-4 text-emerald-400 shrink-0" />
            <span>Maintainability</span>
          </div>
        </div>
      </div>
    );
  }

  // 2. STANDBY STATE (No review run yet)
  if (!reviewResponse) {
    return (
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-8 text-center text-xs text-slate-500 shadow-sm space-y-3">
        <Sparkles className="h-9 w-9 text-sky-400/50 mx-auto" />
        <h3 className="font-semibold text-sm text-slate-200">Code Review Results</h3>
        <p className="max-w-md mx-auto text-slate-400 leading-relaxed">
          Click <span className="font-semibold text-sky-300 bg-sky-950 px-2 py-0.5 rounded border border-sky-800">[ ✨ Review Code ]</span> above to inspect <span className="font-mono text-slate-300">{activeFileName || 'the active file'}</span> for errors, vulnerabilities, and improvements.
        </p>
        <p className="text-[11px] text-slate-500">
          The code itself will never be modified automatically.
        </p>
      </div>
    );
  }

  const findings = reviewResponse.findings || [];

  // 3. SECTION 9: EMPTY RESULT (Clean code)
  if (findings.length === 0) {
    return (
      <div className="rounded-xl border border-emerald-900/70 bg-[#0a1b14] p-8 text-center space-y-3 shadow-lg animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 mx-auto">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="text-base font-semibold text-emerald-200">✓ No significant issues found</h3>
        <p className="max-w-md mx-auto text-xs text-emerald-300/80 leading-relaxed">
          The selected code in <span className="font-mono text-white">{activeFileName || 'the active file'}</span> passed all available code-quality, security, architecture, runtime, and correctness checks.
        </p>
        <div className="pt-2 text-[11px] font-mono text-slate-400">
          Lines analyzed: {activeFileLineCount || reviewResponse.summary.lines_changed || 0} · 0 issues detected
        </div>
      </div>
    );
  }

  // Filter findings by severity and category
  const filteredFindings = findings.filter((f) => {
    if (severityFilter !== 'ALL' && f.severity !== severityFilter) {
      return false;
    }
    if (categoryFilter !== 'ALL') {
      const cat = (f.category || '').toUpperCase();
      if (categoryFilter === 'SYNTAX' && !cat.includes('CORRECTNESS') && !f.rule_id.startsWith('SYNTAX')) return false;
      if (categoryFilter === 'LOGIC' && !f.rule_id.startsWith('LOGIC')) return false;
      if (categoryFilter === 'RUNTIME' && !f.rule_id.startsWith('RUNTIME') && !cat.includes('RELIABILITY')) return false;
      if (categoryFilter === 'SECURITY' && !cat.includes('SECURITY')) return false;
      if (categoryFilter === 'PERFORMANCE' && !cat.includes('PERFORMANCE')) return false;
      if (categoryFilter === 'QUALITY' && !cat.includes('MAINTAINABILITY') && !cat.includes('CODE_QUALITY') && !cat.includes('STANDARDS')) return false;
      if (categoryFilter === 'ARCHITECTURE' && !cat.includes('ARCHITECTURE')) return false;
      if (categoryFilter === 'ERROR_HANDLING' && !f.rule_id.startsWith('ERR')) return false;
      if (categoryFilter === 'TESTING' && !cat.includes('TESTING')) return false;
    }
    return true;
  });

  // Calculate dynamic severity counts (Section 7)
  const criticalCount = findings.filter((f) => f.severity === 'CRITICAL').length;
  const highCount = findings.filter((f) => f.severity === 'HIGH').length;
  const mediumCount = findings.filter((f) => f.severity === 'MEDIUM').length;
  const lowCount = findings.filter((f) => f.severity === 'LOW').length;
  const infoCount = findings.filter((f) => f.severity === 'INFO').length;

  const handleFeedbackSubmit = (finding: ReviewFinding, action: FeedbackAction) => {
    const reason = feedbackInputs[finding.finding_id] || `Action: ${action}`;
    const markTeam = teamRuleMarks[finding.finding_id] || false;

    onSendFeedback(finding, action, reason, markTeam);

    setFeedbackSuccessMsgs((prev) => ({
      ...prev,
      [finding.finding_id]: `Recorded "${action}" in Phase 1 Team Memory.`,
    }));
  };

  const getSeverityIcon = (sev: string) => {
    switch (sev) {
      case 'CRITICAL':
        return '🔴';
      case 'HIGH':
        return '🟠';
      case 'MEDIUM':
        return '🟡';
      case 'LOW':
        return '🔵';
      default:
        return '⚪';
    }
  };

  return (
    <div className="rounded-xl border border-slate-800 bg-[#0f172a]/95 overflow-hidden shadow-xl space-y-0 animate-fade-in">
      {/* 4. SECTION 7: REVIEW SUMMARY HEADER */}
      <div className="p-5 border-b border-slate-800 bg-[#0d131f] space-y-4">
        {/* Title and High-Level Counts */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-white tracking-tight">Code Review Results</h3>
              <span className="px-2.5 py-0.5 rounded text-xs font-mono font-bold bg-sky-950 text-sky-400 border border-sky-800">
                {findings.length} Issue{findings.length === 1 ? '' : 's'} Found
              </span>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono text-slate-400 mt-1">
              <span>Files Reviewed: <strong className="text-slate-200">{reviewResponse.summary.files_reviewed || 1}</strong></span>
              <span>Lines Analyzed: <strong className="text-slate-200">{activeFileLineCount || reviewResponse.summary.lines_changed || 0}</strong></span>
              <span>Issues Found: <strong className="text-slate-200">{findings.length}</strong></span>
            </div>
          </div>

          {/* Dynamic Severity Summary Bar (🔴 1 Critical 🟠 2 High 🟡 3 Medium 🔵 1 Low ⚪ 0 Info) */}
          <div className="flex items-center gap-2 flex-wrap font-mono text-xs">
            {criticalCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-rose-950/80 text-rose-300 border border-rose-800 font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🔴</span>
                <span>{criticalCount} Critical</span>
              </span>
            )}
            {highCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-orange-950/80 text-orange-300 border border-orange-800 font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🟠</span>
                <span>{highCount} High</span>
              </span>
            )}
            {mediumCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-amber-950/80 text-amber-300 border border-amber-800 font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🟡</span>
                <span>{mediumCount} Medium</span>
              </span>
            )}
            {lowCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-sky-950/80 text-sky-300 border border-sky-800 font-semibold flex items-center gap-1.5 shadow-sm">
                <span>🔵</span>
                <span>{lowCount} Low</span>
              </span>
            )}
            {infoCount > 0 && (
              <span className="px-2.5 py-1 rounded bg-slate-800 text-slate-300 border border-slate-700 font-semibold flex items-center gap-1.5 shadow-sm">
                <span>⚪</span>
                <span>{infoCount} Info</span>
              </span>
            )}
          </div>
        </div>

        {/* 5. SECTION 13: RE-REVIEW WORKFLOW COMPARISON DELTA */}
        {reReviewDiff && (
          <div className="p-3 rounded-lg bg-slate-900/90 border border-slate-800 text-xs font-mono flex flex-wrap items-center justify-between gap-3 animate-fade-in">
            <div className="flex items-center gap-3">
              <span className="text-slate-400 font-sans font-medium text-xs">Re-Review Comparison:</span>
              <span className="text-slate-300">Previous Review: {reReviewDiff.previousTotal} issues</span>
              <span className="text-slate-300">Current Review: {reReviewDiff.currentTotal} issues</span>
            </div>
            <div className="flex items-center gap-3">
              {reReviewDiff.resolved.length > 0 && (
                <span className="flex items-center gap-1 text-emerald-400 font-semibold bg-emerald-950/50 px-2 py-0.5 rounded border border-emerald-800">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>Resolved: {reReviewDiff.resolved.length}</span>
                </span>
              )}
              <span className="text-slate-400">
                Remaining: {reReviewDiff.stillPresent.length}
              </span>
              {reReviewDiff.newFindings.length > 0 && (
                <span className="text-rose-400 font-semibold bg-rose-950/50 px-2 py-0.5 rounded border border-rose-800">
                  New: {reReviewDiff.newFindings.length}
                </span>
              )}
            </div>
          </div>
        )}

        {/* Filters: Category & Severity */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-2.5 pt-1">
          {/* Category Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto text-[11px] font-mono scrollbar-none py-0.5">
            <span className="text-slate-500 font-sans mr-1">Filter:</span>
            {[
              { id: 'ALL', label: 'All Categories' },
              { id: 'SECURITY', label: 'Security' },
              { id: 'SYNTAX', label: 'Syntax' },
              { id: 'LOGIC', label: 'Logic' },
              { id: 'RUNTIME', label: 'Runtime' },
              { id: 'PERFORMANCE', label: 'Performance' },
              { id: 'ARCHITECTURE', label: 'Architecture' },
              { id: 'QUALITY', label: 'Code Quality' },
              { id: 'ERROR_HANDLING', label: 'Error Handling' },
              { id: 'TESTING', label: 'Testing' },
            ].map((cat) => (
              <button
                key={cat.id}
                onClick={() => setCategoryFilter(cat.id)}
                className={`px-2.5 py-1 rounded-md transition-colors whitespace-nowrap ${
                  categoryFilter === cat.id
                    ? 'bg-sky-600 text-white font-semibold shadow-sm'
                    : 'text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-800'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Severity Quick Toggles */}
          <div className="flex items-center gap-1 text-[11px] font-mono shrink-0">
            {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
              <button
                key={sev}
                onClick={() => setSeverityFilter(sev)}
                className={`px-2 py-0.5 rounded transition-colors ${
                  severityFilter === sev
                    ? 'bg-slate-700 text-white font-bold'
                    : 'text-slate-400 hover:text-white bg-slate-900 border border-slate-800'
                }`}
              >
                {sev}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* 6. FINDINGS LIST (Rendered matching user's ASCII mockup below editor) */}
      <div className="p-5 space-y-4 max-h-[800px] overflow-y-auto divide-y divide-slate-800/60">
        {filteredFindings.length > 0 ? (
          filteredFindings.map((finding, idx) => {
            const sevMeta = SEVERITY_LEVELS[finding.severity] || SEVERITY_LEVELS['INFO'];
            const sevEmoji = getSeverityIcon(finding.severity);
            const isFeedbackOpen = expandedFeedbackId === finding.finding_id;

            return (
              <div
                key={finding.finding_id}
                className={`space-y-3.5 transition-colors ${idx > 0 ? 'pt-4' : ''}`}
              >
                {/* Header: 🔴 CRITICAL · SECURITY */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-base select-none">{sevEmoji}</span>
                    <span className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold tracking-wide ${sevMeta.badgeStyle}`}>
                      {finding.severity} · {finding.category}
                    </span>
                    <h4 className="text-sm font-semibold text-white tracking-tight ml-1">
                      {finding.title}
                    </h4>
                  </div>

                  <div className="flex items-center gap-3 shrink-0 text-xs font-mono">
                    <span className="text-emerald-400 text-[11px] font-semibold">
                      Confidence: {Math.round(finding.confidence * 100)}%
                    </span>
                    <span className="text-slate-500 text-[10px]">ID: {finding.rule_id || finding.finding_id}</span>
                  </div>
                </div>

                {/* File : Line Location Button */}
                <div className="flex items-center gap-2 text-xs font-mono">
                  <span className="text-slate-400 font-semibold">{finding.file} : {finding.line}</span>
                  <button
                    onClick={() => onNavigateToLine(finding.file, finding.line)}
                    className="flex items-center gap-1 px-2.5 py-0.5 rounded bg-sky-950/80 text-sky-300 hover:text-white hover:bg-sky-900 border border-sky-800 transition-colors text-[11px]"
                    title="Jump to line and highlight in code editor above"
                  >
                    <Eye className="h-3 w-3" />
                    <span>View in Editor</span>
                  </button>
                </div>

                {/* Problem */}
                <div className="text-xs text-slate-300 leading-relaxed bg-[#0b0f17] p-3 rounded-lg border border-slate-800">
                  <strong className="text-slate-400 font-mono text-[11px] block mb-1 uppercase tracking-wide">
                    Problem:
                  </strong>
                  {finding.problem}
                </div>

                {/* Evidence */}
                {finding.evidence && (
                  <div className="text-xs font-mono text-slate-300 bg-slate-950 p-2.5 rounded-lg border border-slate-900">
                    <strong className="text-slate-500 text-[10px] uppercase block mb-0.5">Evidence:</strong>
                    <span>{finding.evidence}</span>
                  </div>
                )}

                {/* Why it matters */}
                {(finding.why_it_matters || finding.reason) && (
                  <div className="text-xs text-slate-400 leading-relaxed bg-[#0d131f] p-3 rounded-lg border border-slate-800/80">
                    <strong className="text-slate-500 font-mono text-[10px] block mb-1 uppercase tracking-wide">
                      Why it matters:
                    </strong>
                    {finding.why_it_matters || finding.reason}
                  </div>
                )}

                {/* Recommendation */}
                <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/60 text-xs text-sky-200 leading-relaxed">
                  <strong className="text-sky-400 font-mono text-[10px] block mb-1 uppercase tracking-wide">
                    Recommendation:
                  </strong>
                  {finding.recommendation}
                </div>

                {/* 7. ACTION BUTTONS: [View Code] [Mark as Fixed] [Feedback] */}
                <div className="pt-2 flex flex-wrap items-center justify-between gap-2.5">
                  <div className="flex items-center gap-2">
                    {/* View Code */}
                    <button
                      onClick={() => onNavigateToLine(finding.file, finding.line)}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-sm"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>View Code</span>
                    </button>

                    {/* Mark as Fixed */}
                    <button
                      onClick={() => handleFeedbackSubmit(finding, 'ALREADY_FIXED')}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-950/70 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 transition-colors"
                      title="Mark finding as resolved"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Mark as Fixed</span>
                    </button>

                    {/* Toggle Feedback Options */}
                    <button
                      onClick={() =>
                        setExpandedFeedbackId(isFeedbackOpen ? null : finding.finding_id)
                      }
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 transition-colors"
                    >
                      <MessageSquare className="h-3.5 w-3.5" />
                      <span>Feedback</span>
                      {isFeedbackOpen ? (
                        <ChevronUp className="h-3 w-3 ml-0.5" />
                      ) : (
                        <ChevronDown className="h-3 w-3 ml-0.5" />
                      )}
                    </button>
                  </div>

                  {feedbackSuccessMsgs[finding.finding_id] && (
                    <div className="text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-900/60 animate-fade-in">
                      {feedbackSuccessMsgs[finding.finding_id]}
                    </div>
                  )}
                </div>

                {/* Expanded Feedback Drawer */}
                {isFeedbackOpen && (
                  <div className="p-3.5 rounded-xl bg-slate-900/90 border border-slate-800 space-y-2.5 animate-fade-in text-xs">
                    <div className="flex items-center justify-between text-slate-400 font-mono text-[11px]">
                      <span>Submit Developer Decision to Team Memory:</span>
                      <label className="flex items-center gap-1.5 cursor-pointer select-none text-slate-300">
                        <input
                          type="checkbox"
                          checked={teamRuleMarks[finding.finding_id] || false}
                          onChange={(e) =>
                            setTeamRuleMarks((prev) => ({
                              ...prev,
                              [finding.finding_id]: e.target.checked,
                            }))
                          }
                          className="rounded bg-slate-800 border-slate-700 text-sky-600 focus:ring-0 text-xs"
                        />
                        <span>Save as Team Rule</span>
                      </label>
                    </div>

                    <input
                      type="text"
                      value={feedbackInputs[finding.finding_id] || ''}
                      onChange={(e) =>
                        setFeedbackInputs((prev) => ({
                          ...prev,
                          [finding.finding_id]: e.target.value,
                        }))
                      }
                      placeholder="Optional reason (e.g. 'Validation is already handled by middleware in route...')"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
                    />

                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      <button
                        onClick={() => handleFeedbackSubmit(finding, 'ACCEPT')}
                        className="px-2.5 py-1 rounded bg-emerald-950 hover:bg-emerald-900 text-emerald-300 border border-emerald-800 font-medium text-xs transition-colors"
                      >
                        Accept
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit(finding, 'REJECT')}
                        className="px-2.5 py-1 rounded bg-rose-950 hover:bg-rose-900 text-rose-300 border border-rose-800 font-medium text-xs transition-colors"
                        title="Rejection updates team memory to prevent repeated flagging"
                      >
                        Reject
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit(finding, 'IGNORE')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 font-medium text-xs transition-colors"
                      >
                        Ignore
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit(finding, 'MODIFY')}
                        className="px-2.5 py-1 rounded bg-amber-950 hover:bg-amber-900 text-amber-300 border border-amber-800 font-medium text-xs transition-colors"
                      >
                        Modify
                      </button>
                      <button
                        onClick={() => handleFeedbackSubmit(finding, 'NOT_APPLICABLE')}
                        className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700 font-medium text-xs transition-colors"
                      >
                        Not Applicable
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center text-xs text-slate-400 space-y-2">
            <CheckCircle2 className="h-10 w-10 text-emerald-400 mx-auto" />
            <h4 className="font-semibold text-white text-sm">No Issues Found in Current Filter</h4>
            <p className="text-slate-500 max-w-sm mx-auto">
              No findings matched the selected severity or category filter.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
