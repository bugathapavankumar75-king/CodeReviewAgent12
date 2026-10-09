/**
 * Workspace Toolbar Component
 * Hosts Language Selector, Review File / Review Project triggers, and Project Config modal toggle.
 */

import React from 'react';
import {
  Play,
  Layers,
  Settings,
  Sparkles,
  FileCheck,
  FolderGit2,
  CheckCircle2,
  RefreshCw,
} from 'lucide-react';
import type { SupportedLanguage, WorkspaceProjectConfig } from './types';
import { SUPPORTED_LANGUAGES } from './languageConfig';

interface WorkspaceToolbarProps {
  currentLanguage: SupportedLanguage;
  onLanguageChange: (newLang: SupportedLanguage) => void;
  onReviewCurrentFile: () => void;
  onReviewEntireProject: () => void;
  isReviewing: boolean;
  activeFileName?: string;
  projectConfig: WorkspaceProjectConfig;
  onOpenProjectSettings: () => void;
}

export const WorkspaceToolbar: React.FC<WorkspaceToolbarProps> = ({
  currentLanguage,
  onLanguageChange,
  onReviewCurrentFile,
  onReviewEntireProject,
  isReviewing,
  activeFileName,
  projectConfig,
  onOpenProjectSettings,
}) => {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-xl border border-slate-800 bg-[#0f172a]/80 shadow-sm">
      {/* Left Zone: Language Selector & Project Breadcrumb */}
      <div className="flex items-center gap-3">
        <div className="flex items-center gap-1.5 text-xs text-slate-300">
          <span className="text-slate-500 font-mono text-[11px]">Language:</span>
          <select
            value={currentLanguage}
            onChange={(e) => onLanguageChange(e.target.value as SupportedLanguage)}
            className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs font-mono font-semibold text-sky-400 focus:outline-none focus:border-sky-500 cursor-pointer"
          >
            {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
              <option key={lang.id} value={lang.id}>
                {lang.name}
              </option>
            ))}
          </select>
        </div>

        <div className="hidden md:flex items-center gap-2 text-xs text-slate-400 border-l border-slate-800 pl-3">
          <span className="text-slate-500 font-mono">Project:</span>
          <button
            onClick={onOpenProjectSettings}
            className="font-medium text-slate-200 hover:text-sky-300 hover:underline transition-colors flex items-center gap-1"
            title="Configure project context & architecture rules"
          >
            <span>{projectConfig.projectName}</span>
            <Settings className="h-3 w-3 text-slate-500" />
          </button>
        </div>
      </div>

      {/* Right Zone: Primary Review Actions */}
      <div className="flex items-center gap-2">
        <button
          onClick={onOpenProjectSettings}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 transition-colors md:hidden"
          title="Project settings"
        >
          <Settings className="h-3.5 w-3.5" />
        </button>

        {/* Review File Button */}
        <button
          onClick={onReviewCurrentFile}
          disabled={isReviewing || !activeFileName}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 hover:border-slate-600 transition-colors disabled:opacity-50 whitespace-nowrap shadow-sm"
          title={`Review only ${activeFileName || 'current file'}`}
        >
          {isReviewing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin text-sky-400" />
          ) : (
            <FileCheck className="h-3.5 w-3.5 text-sky-400" />
          )}
          <span>Review File</span>
        </button>

        {/* Review Project Button */}
        <button
          onClick={onReviewEntireProject}
          disabled={isReviewing}
          className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-md shadow-sky-950 disabled:opacity-50 whitespace-nowrap"
          title="Review all files across the complete workspace"
        >
          {isReviewing ? (
            <RefreshCw className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <FolderGit2 className="h-3.5 w-3.5 fill-current" />
          )}
          <span>Review Project</span>
        </button>
      </div>
    </div>
  );
};
