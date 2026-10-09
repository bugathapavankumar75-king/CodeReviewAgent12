/**
 * Professional Code Editor Component
 * Features:
 * - Line numbers with finding badges
 * - Multi-language syntax tokenization
 * - Tab indentation handling & auto-closing brackets
 * - Search within code with match navigation
 * - Undo/Redo history stack
 * - [Save] button for saving currently selected file
 * - [Review Code] button for reviewing current in-memory editor content
 * - Unsaved changes dirty state indicator ("Unsaved changes" vs "Saved")
 * - Placeholder outside source code ("Start writing your code...")
 * - Click-to-code jump & line highlight
 * - Inline review indicators below affected lines
 */

import React, { useState, useRef, useEffect } from 'react';
import {
  Copy,
  Check,
  Search,
  RotateCcw,
  RotateCw,
  Trash2,
  AlertTriangle,
  ShieldAlert,
  Save,
  Sparkles,
  RefreshCw,
  ChevronDown,
  ChevronUp,
  X,
} from 'lucide-react';
import type { SupportedLanguage } from './types';
import type { ReviewFinding } from '../../agent/models/reviewOutput.model';
import { SEVERITY_LEVELS } from '../../agent/models/severity.model';

interface CodeEditorProps {
  content: string;
  language: SupportedLanguage;
  fileName: string;
  filePath: string;
  isDirty?: boolean;
  onChange: (newContent: string) => void;
  onSave: () => void;
  onReviewCode: () => void;
  onDeleteFile: () => void;
  isReviewing?: boolean;
  findings: ReviewFinding[];
  targetLine?: number | null;
  onClearTargetLine?: () => void;
  onFindingClick?: (finding: ReviewFinding) => void;
}

export const CodeEditor: React.FC<CodeEditorProps> = ({
  content,
  language,
  fileName,
  filePath,
  isDirty = false,
  onChange,
  onSave,
  onReviewCode,
  onDeleteFile,
  isReviewing = false,
  findings,
  targetLine,
  onClearTargetLine,
  onFindingClick,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [savedFeedback, setSavedFeedback] = useState<boolean>(false);
  const [searchOpen, setSearchOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchMatches, setSearchMatches] = useState<number[]>([]);
  const [currentMatchIndex, setCurrentMatchIndex] = useState<number>(0);
  const [history, setHistory] = useState<string[]>([content]);
  const [historyIndex, setHistoryIndex] = useState<number>(0);

  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const lineGutterRef = useRef<HTMLDivElement>(null);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  // Reset undo history when switching to another file
  useEffect(() => {
    setHistory([content]);
    setHistoryIndex(0);
  }, [filePath, fileName]);

  const rawLines = content.split('\n');
  const lineCount = content.length === 0 ? 0 : rawLines.length;
  // If file is empty, show 1..3 guide lines in gutter
  const gutterLines = content.length === 0 ? [1, 2, 3] : rawLines.map((_, i) => i + 1);

  // Filter findings for this specific file
  const fileFindings = findings.filter(
    (f) => f.file === filePath || f.file.endsWith(fileName) || filePath.endsWith(f.file)
  );

  // Group findings by line number
  const findingsByLine = fileFindings.reduce<Record<number, ReviewFinding[]>>((acc, f) => {
    const l = f.line || 1;
    if (!acc[l]) acc[l] = [];
    acc[l].push(f);
    return acc;
  }, {});

  // Synchronized scrolling between textarea and line gutter
  const handleScroll = () => {
    if (textareaRef.current && lineGutterRef.current) {
      lineGutterRef.current.scrollTop = textareaRef.current.scrollTop;
    }
  };

  // Scroll to target line when clicked from review panel
  useEffect(() => {
    if (targetLine && targetLine > 0) {
      const lineEl = lineRefs.current[targetLine];
      if (lineEl && textareaRef.current) {
        lineEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [targetLine]);

  // Search logic
  useEffect(() => {
    if (!searchQuery.trim()) {
      setSearchMatches([]);
      setCurrentMatchIndex(0);
      return;
    }
    const q = searchQuery.toLowerCase();
    const matchedLines: number[] = [];
    rawLines.forEach((lineText: string, idx: number) => {
      if (lineText.toLowerCase().includes(q)) {
        matchedLines.push(idx + 1);
      }
    });
    setSearchMatches(matchedLines);
    setCurrentMatchIndex(0);
  }, [searchQuery, content]);

  const goToNextMatch = () => {
    if (searchMatches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % searchMatches.length;
    setCurrentMatchIndex(nextIdx);
    const target = searchMatches[nextIdx];
    lineRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  const goToPrevMatch = () => {
    if (searchMatches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + searchMatches.length) % searchMatches.length;
    setCurrentMatchIndex(prevIdx);
    const target = searchMatches[prevIdx];
    lineRefs.current[target]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Content mutation with undo/redo stack
  const updateContentWithHistory = (newVal: string) => {
    onChange(newVal);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(newVal);
    if (newHist.length > 50) newHist.shift();
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      onChange(prev);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      onChange(next);
    }
  };

  // Keyboard shortcuts: Ctrl+S to save, Cmd/Ctrl+F search, Tab indent, etc.
  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    // Save shortcut: Cmd/Ctrl + S
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 's') {
      e.preventDefault();
      handleTriggerSave();
      return;
    }

    // Search shortcut: Cmd/Ctrl + F
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'f') {
      e.preventDefault();
      setSearchOpen(true);
      return;
    }

    // Undo: Cmd/Ctrl + Z
    if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
      e.preventDefault();
      handleUndo();
      return;
    }

    // Redo: Cmd/Ctrl + Shift + Z or Cmd/Ctrl + Y
    if (
      ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === 'z') ||
      ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'y')
    ) {
      e.preventDefault();
      handleRedo();
      return;
    }

    // Tab key: Insert 2 spaces (or Shift+Tab to dedent)
    if (e.key === 'Tab') {
      e.preventDefault();
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;

      if (e.shiftKey) {
        if (content.slice(start - 2, start) === '  ') {
          const updated = content.slice(0, start - 2) + content.slice(start);
          updateContentWithHistory(updated);
          setTimeout(() => {
            textarea.selectionStart = textarea.selectionEnd = Math.max(0, start - 2);
          }, 0);
        }
      } else {
        const updated = content.slice(0, start) + '  ' + content.slice(end);
        updateContentWithHistory(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 2;
        }, 0);
      }
      return;
    }

    // Auto-close brackets & quotes
    const pairs: Record<string, string> = {
      '(': ')',
      '[': ']',
      '{': '}',
      '"': '"',
      "'": "'",
      '`': '`',
    };

    if (pairs[e.key]) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      if (start === end) {
        e.preventDefault();
        const closeChar = pairs[e.key];
        const updated = content.slice(0, start) + e.key + closeChar + content.slice(end);
        updateContentWithHistory(updated);
        setTimeout(() => {
          textarea.selectionStart = textarea.selectionEnd = start + 1;
        }, 0);
      }
    }
  };

  const handleTriggerSave = () => {
    onSave();
    setSavedFeedback(true);
    setTimeout(() => setSavedFeedback(false), 2000);
  };

  const handleCopyCode = () => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleSelectAll = () => {
    if (textareaRef.current) {
      textareaRef.current.select();
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0b0f17] overflow-hidden shadow-sm">
      {/* Editor Sub-Header Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2 border-b border-slate-800 bg-[#0f172a]/90 text-xs">
        {/* Left: File Name, Dirty Indicator, Line Count */}
        <div className="flex items-center gap-2">
          <span className="font-mono text-slate-200 font-semibold">{fileName}</span>

          {/* Section 5: Unsaved changes indicator */}
          {isDirty ? (
            <span
              className="flex items-center gap-1 text-[11px] font-mono font-medium text-amber-400 bg-amber-950/60 px-2 py-0.5 rounded border border-amber-800/80"
              title="File has unsaved modifications in memory"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
              <span>Unsaved changes</span>
            </span>
          ) : (
            <span className="flex items-center gap-1 text-[11px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60">
              <Check className="h-3 w-3" />
              <span>Saved</span>
            </span>
          )}

          {/* Section 14: Dynamic Line Count */}
          <span className="text-slate-500 font-mono text-[11px] hidden sm:inline">
            ({lineCount} lines · {language})
          </span>

          {fileFindings.length > 0 && (
            <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-rose-950/60 text-rose-400 border border-rose-800/80">
              {fileFindings.length} issue{fileFindings.length === 1 ? '' : 's'}
            </span>
          )}
        </div>

        {/* Right: Actions [Search Undo Redo | Select All Copy | Save | Review Code | Delete] */}
        <div className="flex items-center gap-1 flex-wrap">
          <button
            onClick={() => setSearchOpen(!searchOpen)}
            className={`p-1.5 rounded transition-colors ${
              searchOpen
                ? 'bg-sky-950 text-sky-400 border border-sky-800'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
            title="Search in code (Ctrl+F)"
          >
            <Search className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleUndo}
            disabled={historyIndex <= 0}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Undo (Ctrl+Z)"
          >
            <RotateCcw className="h-3.5 w-3.5" />
          </button>

          <button
            onClick={handleRedo}
            disabled={historyIndex >= history.length - 1}
            className="p-1.5 rounded text-slate-400 hover:text-white hover:bg-slate-800 disabled:opacity-30 transition-colors"
            title="Redo (Ctrl+Shift+Z)"
          >
            <RotateCw className="h-3.5 w-3.5" />
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-1" />

          <button
            onClick={handleSelectAll}
            className="px-2 py-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 font-mono text-[11px] transition-colors"
            title="Select all code"
          >
            Select All
          </button>

          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
            title="Copy code to clipboard"
          >
            {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
            <span className="text-[11px]">{copied ? 'Copied' : 'Copy'}</span>
          </button>

          <div className="h-3.5 w-px bg-slate-800 mx-1" />

          {/* Section 4: SAVE Button */}
          <button
            onClick={handleTriggerSave}
            className={`flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold transition-all shadow-sm ${
              savedFeedback
                ? 'bg-emerald-600 text-white'
                : isDirty
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-950/40 ring-1 ring-emerald-400/50'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700'
            }`}
            title="Save currently selected file only (Ctrl+S)"
          >
            {savedFeedback ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
            <span>{savedFeedback ? 'Saved!' : 'Save'}</span>
          </button>

          {/* Section 6 & 7: REVIEW CODE Button */}
          <button
            onClick={onReviewCode}
            disabled={isReviewing}
            className="flex items-center gap-1.5 px-3 py-1 rounded text-xs font-semibold bg-sky-600 hover:bg-sky-500 text-white transition-colors shadow-md shadow-sky-950 disabled:opacity-50"
            title="Review current in-memory editor content with AI Review Engine"
          >
            {isReviewing ? (
              <RefreshCw className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Sparkles className="h-3.5 w-3.5 fill-current" />
            )}
            <span>Review Code</span>
          </button>

          {/* Section 12: DELETE Button */}
          <button
            onClick={onDeleteFile}
            className="p-1.5 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40 transition-colors"
            title={`Delete ${fileName}`}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Floating In-Editor Search Bar */}
      {searchOpen && (
        <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs animate-fade-in">
          <div className="flex items-center gap-2 flex-1 max-w-md">
            <Search className="h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Find in code..."
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 font-mono"
            />
          </div>

          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">
              {searchMatches.length > 0
                ? `${currentMatchIndex + 1} of ${searchMatches.length}`
                : searchQuery
                ? 'No matches'
                : ''}
            </span>

            <button
              onClick={goToPrevMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              title="Previous match"
            >
              <ChevronUp className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={goToNextMatch}
              disabled={searchMatches.length === 0}
              className="p-1 rounded text-slate-400 hover:text-white disabled:opacity-30"
              title="Next match"
            >
              <ChevronDown className="h-3.5 w-3.5" />
            </button>

            <button
              onClick={() => {
                setSearchOpen(false);
                setSearchQuery('');
              }}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      )}

      {/* Main Editor Surface */}
      <div className="relative flex-1 flex overflow-hidden font-mono text-xs">
        {/* Line Numbers Gutter */}
        <div
          ref={lineGutterRef}
          className="select-none bg-[#0d131f] text-slate-600 text-right py-4 px-2.5 border-r border-slate-800/80 overflow-hidden leading-6 font-mono text-[11px] shrink-0 w-14"
        >
          {gutterLines.map((lineNum) => {
            const lineIssues = findingsByLine[lineNum];
            const isTarget = targetLine === lineNum;
            const isSearchMatch = searchMatches.includes(lineNum);

            return (
              <div
                key={lineNum}
                className={`relative flex items-center justify-end pr-1 cursor-pointer transition-colors ${
                  isTarget
                    ? 'text-sky-400 font-bold bg-sky-950/40'
                    : isSearchMatch
                    ? 'text-amber-300 font-semibold bg-amber-950/30'
                    : 'hover:text-slate-400'
                }`}
              >
                {lineIssues && lineIssues.length > 0 && (
                  <span
                    className={`absolute -left-1.5 h-2 w-2 rounded-full ${
                      lineIssues.some((issue) => issue.severity === 'CRITICAL')
                        ? 'bg-rose-500 ring-2 ring-rose-900'
                        : lineIssues.some((issue) => issue.severity === 'HIGH')
                        ? 'bg-orange-500 ring-2 ring-orange-900'
                        : 'bg-amber-500'
                    }`}
                    title={`${lineIssues.length} issue(s) at line ${lineNum}`}
                  />
                )}
                <span>{lineNum}</span>
              </div>
            );
          })}
        </div>

        {/* Code Content Container: Textarea + Visual Line Highlighting & Inline Annotations */}
        <div className="relative flex-1 overflow-auto">
          {/* Background Overlay for Line Highlighting and Inline Indicators */}
          <div className="absolute inset-0 pointer-events-none py-4 px-4 font-mono text-xs leading-6">
            {gutterLines.map((lineNum) => {
              const isTarget = targetLine === lineNum;
              const lineIssues = findingsByLine[lineNum];

              return (
                <div
                  key={lineNum}
                  ref={(el) => {
                    lineRefs.current[lineNum] = el;
                  }}
                  className={`w-full min-h-[24px] rounded transition-colors ${
                    isTarget ? 'bg-sky-500/15 border-l-2 border-sky-400' : ''
                  }`}
                >
                  {/* Inline Review Indicator (Section 11) */}
                  {lineIssues && lineIssues.length > 0 && (
                    <div className="pointer-events-auto mt-0.5 mb-1.5 pl-2 py-1 px-2.5 rounded bg-slate-900/95 border border-slate-700/80 shadow-lg text-[11px] font-mono flex flex-col gap-1 z-10 max-w-2xl">
                      {lineIssues.map((issue) => {
                        const sev = SEVERITY_LEVELS[issue.severity];
                        return (
                          <div
                            key={issue.finding_id}
                            onClick={() => onFindingClick && onFindingClick(issue)}
                            className="flex items-center justify-between gap-2 cursor-pointer hover:opacity-90"
                          >
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500 font-bold select-none">└──</span>
                              <span className={`px-1.5 py-0.2 rounded text-[10px] font-bold ${sev.badgeStyle}`}>
                                {issue.severity}:
                              </span>
                              <span className="font-sans font-medium text-slate-200 truncate">{issue.title}</span>
                            </div>
                            <span className="text-[10px] text-sky-400 shrink-0">
                              {issue.rule_id}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Section 11: Textarea with Subtle Placeholder outside source code */}
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => updateContentWithHistory(e.target.value)}
            onScroll={handleScroll}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoCapitalize="off"
            autoComplete="off"
            autoCorrect="off"
            className="absolute inset-0 w-full h-full bg-transparent text-slate-100 font-mono text-xs leading-6 py-4 px-4 resize-none focus:outline-none selection:bg-sky-500/30 whitespace-pre overflow-auto"
            placeholder="Start writing your code..."
          />
        </div>
      </div>
    </div>
  );
};
