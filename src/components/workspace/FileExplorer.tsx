/**
 * Workspace File Explorer Component
 * Multi-file management: create with language selection, rename, delete, switch files.
 * Guarantees visual highlight on active file.
 */

import React, { useState } from 'react';
import {
  FilePlus,
  FileCode,
  Trash2,
  Edit2,
  Check,
  X,
  FolderOpen,
} from 'lucide-react';
import type { WorkspaceFile, SupportedLanguage } from './types';
import { SUPPORTED_LANGUAGES, detectLanguageFromFilename } from './languageConfig';

interface FileExplorerProps {
  files: WorkspaceFile[];
  activeFileId: string;
  onSelectFile: (fileId: string) => void;
  onCreateFile: (fileName: string, language?: SupportedLanguage) => void;
  onRenameFile: (fileId: string, newName: string) => void;
  onDeleteFile: (fileId: string) => void;
}

export const FileExplorer: React.FC<FileExplorerProps> = ({
  files,
  activeFileId,
  onSelectFile,
  onCreateFile,
  onRenameFile,
  onDeleteFile,
}) => {
  const [isCreating, setIsCreating] = useState<boolean>(false);
  const [newFileName, setNewFileName] = useState<string>('');
  const [selectedLanguage, setSelectedLanguage] = useState<SupportedLanguage>('python');
  const [editingFileId, setEditingFileId] = useState<string | null>(null);
  const [editingFileName, setEditingFileName] = useState<string>('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleStartCreate = () => {
    setIsCreating(true);
    setNewFileName('');
    setSelectedLanguage('python');
    setErrorMsg(null);
  };

  const handleFileNameChange = (val: string) => {
    setNewFileName(val);
    if (val.includes('.')) {
      const detected = detectLanguageFromFilename(val);
      setSelectedLanguage(detected);
    }
  };

  const handleConfirmCreate = () => {
    try {
      if (!newFileName.trim()) {
        setErrorMsg('File name cannot be empty');
        return;
      }
      onCreateFile(newFileName.trim(), selectedLanguage);
      setIsCreating(false);
      setNewFileName('');
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to create file');
    }
  };

  const handleStartRename = (file: WorkspaceFile, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingFileId(file.file_id);
    setEditingFileName(file.file_name);
    setErrorMsg(null);
  };

  const handleConfirmRename = (fileId: string) => {
    try {
      if (!editingFileName.trim()) {
        setErrorMsg('Name cannot be empty');
        return;
      }
      onRenameFile(fileId, editingFileName.trim());
      setEditingFileId(null);
      setErrorMsg(null);
    } catch (e: any) {
      setErrorMsg(e.message || 'Failed to rename file');
    }
  };

  const handleDelete = (fileId: string, fileName: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(`Delete ${fileName}?`)) {
      onDeleteFile(fileId);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-xl border border-slate-800 bg-[#0f172a]/70 p-3.5 select-none shadow-sm">
      {/* Header & New File Trigger */}
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FolderOpen className="h-4 w-4 text-sky-400" />
          <span className="text-xs font-semibold text-white tracking-tight">Workspace Files</span>
          <span className="text-[10px] font-mono text-slate-500">({files.length})</span>
        </div>

        <button
          onClick={handleStartCreate}
          className="flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-medium bg-slate-800 hover:bg-slate-700 text-sky-300 border border-slate-700 transition-colors shadow-sm"
          title="Create new file"
        >
          <FilePlus className="h-3.5 w-3.5 text-sky-400" />
          <span>New File</span>
        </button>
      </div>

      {/* Error alert if any */}
      {errorMsg && (
        <div className="mb-2 p-2 rounded bg-rose-950/60 border border-rose-900 text-[11px] font-mono text-rose-300">
          {errorMsg}
        </div>
      )}

      {/* Section 2 & 3: New File Flow with File Name & Language Selection */}
      {isCreating && (
        <div className="mb-3 p-3 rounded-lg bg-slate-900/95 border border-sky-500/80 shadow-lg space-y-2.5 animate-fade-in">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-200">
            <span className="flex items-center gap-1.5 text-sky-400">
              <FilePlus className="h-3.5 w-3.5" />
              <span>Create New File</span>
            </span>
            <button
              onClick={() => setIsCreating(false)}
              className="p-1 rounded text-slate-400 hover:text-white"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1 uppercase">
              File Name:
            </label>
            <input
              type="text"
              value={newFileName}
              onChange={(e) => handleFileNameChange(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleConfirmCreate();
                if (e.key === 'Escape') setIsCreating(false);
              }}
              placeholder="e.g. auth.py, task.service.ts"
              autoFocus
              className="w-full bg-slate-950 border border-slate-700 rounded px-2.5 py-1 text-xs font-mono text-white focus:outline-none focus:border-sky-500"
            />
          </div>

          <div>
            <label className="block text-[10px] text-slate-400 font-mono mb-1 uppercase">
              Programming Language:
            </label>
            <select
              value={selectedLanguage}
              onChange={(e) => setSelectedLanguage(e.target.value as SupportedLanguage)}
              className="w-full bg-slate-950 border border-slate-700 rounded px-2 py-1 text-xs font-mono text-sky-300 focus:outline-none focus:border-sky-500 cursor-pointer"
            >
              {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                <option key={lang.id} value={lang.id}>
                  {lang.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-end gap-1.5 pt-1">
            <button
              onClick={() => setIsCreating(false)}
              className="px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200 bg-slate-800 hover:bg-slate-700 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmCreate}
              className="flex items-center gap-1 px-3 py-1 rounded text-xs font-semibold text-white bg-sky-600 hover:bg-sky-500 transition-colors shadow-sm"
            >
              <Check className="h-3.5 w-3.5" />
              <span>Create</span>
            </button>
          </div>
        </div>
      )}

      {/* Section 1: File List with Visually Highlighted Selection */}
      <div className="flex-1 overflow-y-auto space-y-1 pr-1">
        {files.length > 0 ? (
          files.map((file) => {
            const isActive = file.file_id === activeFileId;
            const isEditing = editingFileId === file.file_id;

            return (
              <div
                key={file.file_id}
                onClick={() => onSelectFile(file.file_id)}
                className={`group relative flex items-center justify-between p-2 rounded-lg text-xs cursor-pointer transition-all border ${
                  isActive
                    ? 'bg-sky-950/90 text-sky-200 border-sky-500 font-semibold shadow-sm ring-1 ring-sky-500/50'
                    : 'bg-slate-900/30 text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border-transparent'
                }`}
              >
                {isEditing ? (
                  <div
                    onClick={(e) => e.stopPropagation()}
                    className="flex items-center gap-1.5 flex-1 mr-1"
                  >
                    <input
                      type="text"
                      value={editingFileName}
                      onChange={(e) => setEditingFileName(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleConfirmRename(file.file_id);
                        if (e.key === 'Escape') setEditingFileId(null);
                      }}
                      autoFocus
                      className="flex-1 bg-slate-950 border border-slate-700 rounded px-1.5 py-0.5 text-xs font-mono text-white focus:outline-none"
                    />
                    <button
                      onClick={() => handleConfirmRename(file.file_id)}
                      className="p-1 text-emerald-400 hover:text-emerald-300"
                    >
                      <Check className="h-3 w-3" />
                    </button>
                    <button
                      onClick={() => setEditingFileId(null)}
                      className="p-1 text-slate-400 hover:text-white"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ) : (
                  <>
                    <div className="flex items-center gap-2 truncate">
                      {/* Active indicator bullet */}
                      {isActive ? (
                        <span className="w-1.5 h-1.5 rounded-full bg-sky-400 shrink-0 shadow-sm shadow-sky-400" />
                      ) : (
                        <FileCode className="h-3.5 w-3.5 text-slate-500 shrink-0" />
                      )}
                      <span className="font-mono text-xs truncate">{file.file_name}</span>
                      {file.isDirty && (
                        <span className="text-amber-400 font-bold text-xs shrink-0" title="Unsaved changes in memory">
                          •
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0">
                      <span
                        className={`text-[10px] font-mono uppercase px-1.5 py-0.2 rounded border ${
                          isActive
                            ? 'bg-sky-900/60 text-sky-300 border-sky-700'
                            : 'bg-slate-800/60 text-slate-500 border-slate-800'
                        }`}
                      >
                        {file.language.slice(0, 3)}
                      </span>

                      {/* Action buttons (rename, delete) */}
                      <div className="hidden group-hover:flex items-center gap-1">
                        <button
                          onClick={(e) => handleStartRename(file, e)}
                          className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                          title="Rename file"
                        >
                          <Edit2 className="h-3 w-3" />
                        </button>
                        <button
                          onClick={(e) => handleDelete(file.file_id, file.file_name, e)}
                          className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-rose-950/40"
                          title="Delete file"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            );
          })
        ) : (
          <div className="p-4 text-center text-xs text-slate-500">
            No files in workspace. Click &quot;New File&quot; above to create one.
          </div>
        )}
      </div>

      {/* Bottom Hint */}
      <div className="pt-3 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between font-mono">
        <span>Auto-saved locally</span>
        <span className="text-sky-400/80">LocalStorage</span>
      </div>
    </div>
  );
};
