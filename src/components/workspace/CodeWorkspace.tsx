/**
 * Code Workspace Main Component
 * Integrates:
 * 1. FileExplorer (Multi-file tree with active highlight and unsaved dirty dot)
 * 2. CodeEditor (Save button, Review Code button, Delete button, line count, unsaved dirty status)
 * 3. Dedicated ReviewPanel Section directly BELOW the code editor
 * 4. WorkspaceToolbar (Language selector, Review Project, Project Config)
 * 5. ProjectSettingsModal
 * 6. Local persistence & empty state handling
 */

import React, { useState, useEffect } from 'react';
import {
  FilePlus,
  Layers,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  FolderOpen,
  Code2,
  Check,
} from 'lucide-react';
import type {
  WorkspaceState,
  WorkspaceFile,
  SupportedLanguage,
  WorkspaceProjectConfig,
  ReReviewDiff,
  ReviewHistoryEntry,
} from './types';
import { WorkspaceStorage } from './WorkspaceStorage';
import { SUPPORTED_LANGUAGES, detectLanguageFromFilename } from './languageConfig';
import { WorkspaceReviewAdapter } from './workspaceReviewAdapter';
import { FeedbackProcessor } from '../../agent/feedback/feedbackProcessor';
import type { ReviewResponse, ReviewFinding } from '../../agent/models/reviewOutput.model';
import type { FeedbackAction } from '../../agent/feedback/feedback.model';

import { FileExplorer } from './FileExplorer';
import { CodeEditor } from './CodeEditor';
import { WorkspaceToolbar } from './WorkspaceToolbar';
import { ReviewPanel } from './ReviewPanel';
import { ProjectSettingsModal } from './ProjectSettingsModal';

export const CodeWorkspace: React.FC = () => {
  // Core Workspace State loaded from localStorage
  const [workspace, setWorkspace] = useState<WorkspaceState>(() => WorkspaceStorage.loadWorkspace());
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [isReviewing, setIsReviewing] = useState<boolean>(false);
  const [reviewResponse, setReviewResponse] = useState<ReviewResponse | null>(null);
  const [reReviewDiff, setReReviewDiff] = useState<ReReviewDiff | null>(null);
  const [previousFindings, setPreviousFindings] = useState<ReviewFinding[]>([]);
  const [targetLine, setTargetLine] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [noticeMessage, setNoticeMessage] = useState<string | null>(null);

  // Active File Reference
  const activeFile = workspace.files.find((f) => f.file_id === workspace.active_file_id) || workspace.files[0];

  // Auto-save changes to localStorage
  useEffect(() => {
    WorkspaceStorage.saveWorkspace(workspace);
  }, [workspace]);

  // Section 5: Handle in-memory code changes (preserves independent file state)
  const handleContentChange = (newContent: string) => {
    if (!activeFile) return;
    const updated = WorkspaceStorage.updateFileContent(workspace, activeFile.file_id, newContent);
    setWorkspace(updated);
  };

  // Section 4: SAVE CURRENTLY SELECTED FILE ONLY
  const handleSaveCurrentFile = () => {
    if (!activeFile) return;
    const { state, savedFile } = WorkspaceStorage.saveFile(workspace, activeFile.file_id);
    setWorkspace(state);
    setNoticeMessage(`Saved "${savedFile?.file_name || activeFile.file_name}" successfully`);
    setTimeout(() => setNoticeMessage(null), 3000);
  };

  // Section 13: Switch Active File (preserves unsaved modifications of previous file in memory)
  const handleSelectFile = (fileId: string) => {
    setWorkspace((prev) => ({ ...prev, active_file_id: fileId }));
    setTargetLine(null);
  };

  // Section 2 & 3: Create New File (starts completely empty, with chosen language)
  const handleCreateFile = (fileName: string, language?: SupportedLanguage) => {
    try {
      const { state, newFile } = WorkspaceStorage.createFile(workspace, fileName, language);
      setWorkspace(state);
      setErrorMessage(null);
      setNoticeMessage(`Created empty file "${newFile.file_name}" (${newFile.language})`);
      setTimeout(() => setNoticeMessage(null), 3000);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to create file');
    }
  };

  // Rename File
  const handleRenameFile = (fileId: string, newName: string) => {
    try {
      const updated = WorkspaceStorage.renameFile(workspace, fileId, newName);
      setWorkspace(updated);
      setErrorMessage(null);
    } catch (e: any) {
      setErrorMessage(e.message || 'Failed to rename file');
    }
  };

  // Section 12: Delete File
  const handleDeleteFile = (fileId: string) => {
    const targetFile = workspace.files.find((f) => f.file_id === fileId);
    const updated = WorkspaceStorage.deleteFile(workspace, fileId);
    setWorkspace(updated);
    setTargetLine(null);
    if (targetFile) {
      setNoticeMessage(`Deleted "${targetFile.file_name}"`);
      setTimeout(() => setNoticeMessage(null), 3000);
    }
  };

  const handleDeleteCurrentFile = () => {
    if (!activeFile) return;
    if (window.confirm(`Delete ${activeFile.file_name}?`)) {
      handleDeleteFile(activeFile.file_id);
    }
  };

  // Change Language of Current File
  const handleLanguageChange = (newLang: SupportedLanguage) => {
    if (!activeFile) return;
    const updatedFiles = workspace.files.map((f) => {
      if (f.file_id === activeFile.file_id) {
        return { ...f, language: newLang, updated_at: new Date().toISOString() };
      }
      return f;
    });
    setWorkspace({ ...workspace, files: updatedFiles });
  };

  // Section 1, 6 & 7: Comprehensive Review of Current Editor Content
  const handleReviewCurrentFile = () => {
    if (!activeFile) {
      setErrorMessage('No active file selected to review.');
      return;
    }
    // Section 17: Empty file error handling
    if (!activeFile.content.trim()) {
      setErrorMessage('Nothing to review. Add code to this file before starting a review.');
      return;
    }

    setIsReviewing(true);
    setErrorMessage(null);

    // Section 7: If unsaved changes exist, inform the user
    if (activeFile.isDirty) {
      setNoticeMessage(`Reviewing latest unsaved changes in "${activeFile.file_name}"...`);
      setTimeout(() => setNoticeMessage(null), 4000);
    }

    setTimeout(() => {
      try {
        const response = WorkspaceReviewAdapter.reviewSingleFile(
          activeFile,
          workspace.files,
          workspace.config
        );

        // Section 10: Compute Re-Review Diff if previous review exists
        if (reviewResponse && previousFindings.length > 0) {
          const diff = WorkspaceReviewAdapter.computeReReviewDiff(previousFindings, response.findings);
          setReReviewDiff(diff);
        } else {
          setReReviewDiff(null);
        }

        setPreviousFindings(response.findings);
        setReviewResponse(response);

        // Record to Review History (Section 13)
        const historyEntry: ReviewHistoryEntry = {
          review_id: response.review_id,
          timestamp: response.timestamp,
          workspace_id: workspace.workspace_id,
          scope: 'file',
          target_file: activeFile.file_path,
          language: activeFile.language,
          files_reviewed: 1,
          findings: response.findings,
          summary: response.summary,
        };
        WorkspaceStorage.saveReviewHistory(historyEntry);

        // Smooth scroll to dedicated review results section below the code editor
        setTimeout(() => {
          document.getElementById('review-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } catch (err: any) {
        setErrorMessage(`Review Engine Error: ${err.message || String(err)}`);
      } finally {
        setIsReviewing(false);
      }
    }, 120);
  };

  // Section 8: Review Entire Project (reviews all workspace files using in-memory content)
  const handleReviewEntireProject = () => {
    if (workspace.files.length === 0) {
      setErrorMessage('The workspace contains no files to review.');
      return;
    }

    setIsReviewing(true);
    setErrorMessage(null);

    const hasAnyDirty = workspace.files.some((f) => f.isDirty);
    if (hasAnyDirty) {
      setNoticeMessage('Reviewing project across all files including unsaved changes...');
      setTimeout(() => setNoticeMessage(null), 4000);
    }

    setTimeout(() => {
      try {
        const response = WorkspaceReviewAdapter.reviewFullProject(
          workspace.files,
          workspace.config
        );

        if (reviewResponse && previousFindings.length > 0) {
          const diff = WorkspaceReviewAdapter.computeReReviewDiff(previousFindings, response.findings);
          setReReviewDiff(diff);
        } else {
          setReReviewDiff(null);
        }

        setPreviousFindings(response.findings);
        setReviewResponse(response);

        // Record to Review History (Section 13)
        const historyEntry: ReviewHistoryEntry = {
          review_id: response.review_id,
          timestamp: response.timestamp,
          workspace_id: workspace.workspace_id,
          scope: 'project',
          language: workspace.config.primaryLanguage,
          files_reviewed: workspace.files.length,
          findings: response.findings,
          summary: response.summary,
        };
        WorkspaceStorage.saveReviewHistory(historyEntry);

        // Smooth scroll to dedicated review results section below the code editor
        setTimeout(() => {
          document.getElementById('review-results-section')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }, 120);
      } catch (err: any) {
        setErrorMessage(`Review Engine Error: ${err.message || String(err)}`);
      } finally {
        setIsReviewing(false);
      }
    }, 150);
  };

  // Section 8: Click-to-Code Navigation
  const handleNavigateToLine = (filePath: string, line: number) => {
    // 1. Locate file
    const target = workspace.files.find(
      (f) => f.file_path === filePath || f.file_name === filePath.split('/').pop()
    );

    if (target) {
      setWorkspace((prev) => ({ ...prev, active_file_id: target.file_id }));
    }

    // 2. Set line highlight & scroll target
    setTargetLine(line);

    // 3. Smooth scroll back up to the code editor
    document.getElementById('code-editor-container')?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Section 14: Developer Feedback Submission
  const handleSendFeedback = (
    finding: ReviewFinding,
    action: FeedbackAction,
    reason: string,
    markAsTeamRule: boolean
  ) => {
    FeedbackProcessor.recordFeedback({
      feedback_id: `FB-${Date.now().toString(36).toUpperCase()}`,
      developer_id: 'usr_workspace_developer',
      review_id: reviewResponse?.review_id || 'REV-WORKSPACE',
      finding_id: finding.finding_id,
      rule_id: finding.rule_id,
      file: finding.file,
      decision: action,
      reason,
      mark_as_team_decision: markAsTeamRule,
      timestamp: new Date().toISOString(),
    });

    if (action === 'REJECT') {
      setTimeout(() => {
        if (activeFile) {
          handleReviewCurrentFile();
        }
      }, 500);
    }
  };

  // Update Project Settings
  const handleSaveProjectConfig = (updatedConfig: WorkspaceProjectConfig) => {
    setWorkspace((prev) => ({
      ...prev,
      project_name: updatedConfig.projectName,
      config: updatedConfig,
    }));
  };

  return (
    <div className="space-y-4">
      {/* Top Workspace Toolbar */}
      <WorkspaceToolbar
        currentLanguage={activeFile ? activeFile.language : 'typescript'}
        onLanguageChange={handleLanguageChange}
        onReviewCurrentFile={handleReviewCurrentFile}
        onReviewEntireProject={handleReviewEntireProject}
        isReviewing={isReviewing}
        activeFileName={activeFile?.file_name}
        projectConfig={workspace.config}
        onOpenProjectSettings={() => setIsSettingsOpen(true)}
      />

      {/* Notice Notification Banner */}
      {noticeMessage && (
        <div className="flex items-center justify-between p-2.5 rounded-lg bg-sky-950/80 border border-sky-800 text-xs text-sky-200 animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="h-4 w-4 shrink-0 text-sky-400" />
            <span>{noticeMessage}</span>
          </div>
          <button
            onClick={() => setNoticeMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Error Banner */}
      {errorMessage && (
        <div className="flex items-center justify-between p-3 rounded-lg bg-rose-950/60 border border-rose-800 text-xs text-rose-300 animate-fade-in font-mono">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
          <button
            onClick={() => setErrorMessage(null)}
            className="text-slate-400 hover:text-white"
          >
            &times;
          </button>
        </div>
      )}

      {/* Section 15: Empty Workspace State */}
      {workspace.files.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-800 bg-[#0f172a]/40 p-12 text-center space-y-4">
          <Code2 className="h-12 w-12 text-sky-400/50 mx-auto" />
          <div>
            <h3 className="text-base font-semibold text-white">Start your code review</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              Create a file or paste your code to begin context-aware code reviews.
            </p>
          </div>

          <button
            onClick={() => handleCreateFile('main.py', 'python')}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md transition-colors"
          >
            <FilePlus className="h-4 w-4" />
            <span>Create File</span>
          </button>

          <div className="pt-4 text-slate-500 text-xs font-mono">
            Supported languages: Python · JavaScript · TypeScript · Java · C · C++ · C# · HTML · CSS · SQL · Go · Rust · PHP
          </div>
        </div>
      ) : (
        /* Upper Region: Files Sidebar (left) + Wide Code Editor (right) */
        <div className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
            {/* Left Pane: Files Sidebar (3 cols) */}
            <div className="lg:col-span-3 h-[520px]">
              <FileExplorer
                files={workspace.files}
                activeFileId={workspace.active_file_id}
                onSelectFile={handleSelectFile}
                onCreateFile={handleCreateFile}
                onRenameFile={handleRenameFile}
                onDeleteFile={handleDeleteFile}
              />
            </div>

            {/* Right Pane: Code Editor (9 cols - wide & spacious) */}
            <div id="code-editor-container" className="lg:col-span-9 h-[520px]">
              {activeFile ? (
                <CodeEditor
                  key={activeFile.file_id}
                  content={activeFile.content}
                  language={activeFile.language}
                  fileName={activeFile.file_name}
                  filePath={activeFile.file_path}
                  isDirty={activeFile.isDirty}
                  onChange={handleContentChange}
                  onSave={handleSaveCurrentFile}
                  onReviewCode={handleReviewCurrentFile}
                  onDeleteFile={handleDeleteCurrentFile}
                  isReviewing={isReviewing}
                  findings={reviewResponse?.findings || []}
                  targetLine={targetLine}
                  onClearTargetLine={() => setTargetLine(null)}
                  onFindingClick={(finding) => handleNavigateToLine(finding.file, finding.line)}
                />
              ) : (
                <div className="flex items-center justify-center h-full rounded-xl border border-slate-800 bg-[#0b0f17] text-xs text-slate-500">
                  Select a file from the sidebar to edit
                </div>
              )}
            </div>
          </div>

          {/* Dedicated Section BELOW Code Editor: Comprehensive Review Results */}
          <div id="review-results-section" className="scroll-mt-4">
            <ReviewPanel
              isReviewing={isReviewing}
              reviewResponse={reviewResponse}
              reReviewDiff={reReviewDiff}
              onNavigateToLine={handleNavigateToLine}
              onSendFeedback={handleSendFeedback}
              activeFilePath={activeFile?.file_path}
              activeFileName={activeFile?.file_name}
              activeFileLineCount={activeFile ? (activeFile.content.length === 0 ? 0 : activeFile.content.split('\n').length) : 0}
            />
          </div>
        </div>
      )}

      {/* Project Settings Modal */}
      <ProjectSettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        config={workspace.config}
        onSave={handleSaveProjectConfig}
      />
    </div>
  );
};
