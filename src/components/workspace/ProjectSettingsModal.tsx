/**
 * Project Information & Context Configuration Modal
 * Configures project name, description, primary language, framework, database, and architecture.
 */

import React, { useState } from 'react';
import { X, Settings, Check, Layers, Database, Cpu, Compass } from 'lucide-react';
import type { WorkspaceProjectConfig, SupportedLanguage } from './types';
import { SUPPORTED_LANGUAGES } from './languageConfig';

interface ProjectSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  config: WorkspaceProjectConfig;
  onSave: (updated: WorkspaceProjectConfig) => void;
}

export const ProjectSettingsModal: React.FC<ProjectSettingsModalProps> = ({
  isOpen,
  onClose,
  config,
  onSave,
}) => {
  const [form, setForm] = useState<WorkspaceProjectConfig>({ ...config });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(form);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fade-in">
      <div className="w-full max-w-xl rounded-xl border border-slate-800 bg-[#0f172a] shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/60">
          <div className="flex items-center gap-2">
            <Settings className="h-4 w-4 text-sky-400" />
            <h3 className="text-sm font-semibold text-white">Project Context &amp; Architecture Configuration</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto text-xs">
          <div>
            <label className="block font-medium text-slate-300 mb-1">Project Name:</label>
            <input
              type="text"
              value={form.projectName}
              onChange={(e) => setForm({ ...form, projectName: e.target.value })}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-medium"
              placeholder="e.g. Task Management API"
              required
            />
          </div>

          <div>
            <label className="block font-medium text-slate-300 mb-1">Project Description:</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={2}
              className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 leading-relaxed"
              placeholder="Overview of business goals and domain..."
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Primary Language:</label>
              <select
                value={form.primaryLanguage}
                onChange={(e) => setForm({ ...form, primaryLanguage: e.target.value as SupportedLanguage })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
              >
                {Object.values(SUPPORTED_LANGUAGES).map((lang) => (
                  <option key={lang.id} value={lang.id}>
                    {lang.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Web Framework:</label>
              <input
                type="text"
                value={form.framework}
                onChange={(e) => setForm({ ...form, framework: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                placeholder="e.g. Express, FastAPI, Spring"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium text-slate-300 mb-1">Database Engine:</label>
              <input
                type="text"
                value={form.database}
                onChange={(e) => setForm({ ...form, database: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                placeholder="e.g. PostgreSQL, MySQL"
              />
            </div>

            <div>
              <label className="block font-medium text-slate-300 mb-1">Target Architecture:</label>
              <input
                type="text"
                value={form.architecture}
                onChange={(e) => setForm({ ...form, architecture: e.target.value })}
                className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-slate-200 focus:outline-none focus:border-sky-500 font-mono"
                placeholder="e.g. Controller → Service → Repository"
              />
            </div>
          </div>

          <div className="p-3 rounded-lg bg-sky-950/20 border border-sky-900/40 text-[11px] text-sky-300 leading-relaxed">
            This configuration feeds the agent&apos;s project context dataset to accurately enforce architecture layering and technology stack boundaries during reviews.
          </div>

          {/* Footer Actions */}
          <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
            >
              Cancel
            </button>

            <button
              type="submit"
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-sky-600 hover:bg-sky-500 text-white font-semibold transition-colors shadow-sm"
            >
              <Check className="h-4 w-4" />
              <span>Save Configuration</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
