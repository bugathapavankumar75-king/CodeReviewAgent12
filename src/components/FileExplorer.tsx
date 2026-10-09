/**
 * Code & Architecture Explorer
 * Interactive project tree viewer matching user's architecture specification.
 */

import React, { useState } from 'react';
import {
  Folder,
  FolderOpen,
  FileCode,
  Copy,
  Check,
  Download,
  Info,
  ChevronRight,
  ChevronDown,
  Layers,
  Sparkles,
} from 'lucide-react';
import { PROJECT_TREE, LAYER_DEFINITIONS, type ProjectFileNode } from '../data/projectFiles';
import { FILE_CONTENTS } from '../data/fileContents';

export const FileExplorer: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<string>('src/services/user.service.ts');
  const [openFolders, setOpenFolders] = useState<Record<string, boolean>>({
    'project': true,
    'src': true,
    'src/controllers': true,
    'src/services': true,
    'src/models': true,
    'src/routes': true,
    'src/utils': true,
    'tests': true,
    'config': true,
  });
  const [copied, setCopied] = useState<boolean>(false);

  const toggleFolder = (path: string) => {
    setOpenFolders((prev) => ({ ...prev, [path]: !prev[path] }));
  };

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  // Determine current active file details
  const findNode = (node: ProjectFileNode, targetPath: string): ProjectFileNode | null => {
    if (node.path === targetPath) return node;
    if (node.children) {
      for (const child of node.children) {
        const found = findNode(child, targetPath);
        if (found) return found;
      }
    }
    return null;
  };

  const activeNode = findNode(PROJECT_TREE, selectedFile);
  const layerInfo = activeNode && activeNode.layer !== 'root' ? LAYER_DEFINITIONS[activeNode.layer] : null;
  const currentCode = FILE_CONTENTS[selectedFile] || `// Source code for ${selectedFile}\n// Production-ready implementation active in runtime.`;

  // Render tree item recursively
  const renderTree = (node: ProjectFileNode, depth = 0) => {
    const isDir = node.type === 'directory';
    const isOpen = openFolders[node.path] ?? false;
    const isSelected = selectedFile === node.path;

    return (
      <div key={node.path} className="select-none">
        <div
          onClick={() => {
            if (isDir) {
              toggleFolder(node.path);
            } else {
              setSelectedFile(node.path);
            }
          }}
          style={{ paddingLeft: `${depth * 14 + 8}px` }}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer text-xs transition-colors ${
            isSelected
              ? 'bg-sky-950/80 text-sky-300 font-medium border border-sky-800/60'
              : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
          }`}
        >
          {isDir ? (
            <>
              {isOpen ? (
                <ChevronDown className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              ) : (
                <ChevronRight className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              )}
              {isOpen ? (
                <FolderOpen className="h-3.5 w-3.5 text-sky-400/90 shrink-0" />
              ) : (
                <Folder className="h-3.5 w-3.5 text-slate-400 shrink-0" />
              )}
              <span className="font-mono text-slate-200">{node.name}/</span>
            </>
          ) : (
            <>
              <span className="w-3.5 shrink-0" />
              <FileCode className="h-3.5 w-3.5 text-slate-500 shrink-0" />
              <span className="font-mono">{node.name}</span>
            </>
          )}
        </div>

        {isDir && isOpen && node.children && (
          <div>
            {node.children.map((child) => renderTree(child, depth + 1))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
      {/* Left Sidebar: Tree Navigation */}
      <div className="lg:col-span-4 rounded-xl border border-slate-800 bg-[#0f172a]/60 p-4 flex flex-col justify-between h-[640px]">
        <div>
          <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-semibold text-slate-200">
              <Layers className="h-3.5 w-3.5 text-sky-400" />
              <span>Project Architecture Tree</span>
            </div>
            <span className="text-[10px] font-mono text-slate-500">24 files · 3 tiers</span>
          </div>

          <div className="overflow-y-auto max-h-[540px] pr-1 space-y-0.5">
            {renderTree(PROJECT_TREE)}
          </div>
        </div>

        <div className="pt-3 border-t border-slate-800 text-[11px] text-slate-500 flex items-center justify-between">
          <span>Click any file to inspect code</span>
          <span className="font-mono text-sky-400/80">TypeScript</span>
        </div>
      </div>

      {/* Right Column: Code Viewer & Architectural Role */}
      <div className="lg:col-span-8 flex flex-col gap-4">
        {/* Layer Role Card */}
        {layerInfo && (
          <div className="rounded-xl border border-slate-800 bg-[#0f172a]/80 p-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
              <div className="flex items-center gap-2">
                <span className={`px-2 py-0.5 rounded text-xs font-mono font-semibold border ${layerInfo.color}`}>
                  {layerInfo.badge}
                </span>
                <span className="text-sm font-semibold text-white">{layerInfo.title}</span>
              </div>
              <span className="text-xs text-slate-400 font-mono">{selectedFile}</span>
            </div>

            <p className="text-xs text-slate-300 mb-3">{activeNode?.description || layerInfo.description}</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2 border-t border-slate-800/80">
              <div>
                <div className="text-[11px] font-medium text-emerald-400 flex items-center gap-1 mb-1">
                  <Check className="h-3 w-3" />
                  <span>Mandatory Rules in this Layer:</span>
                </div>
                <ul className="text-[11px] text-slate-400 list-disc list-inside space-y-0.5">
                  {layerInfo.rules.slice(0, 2).map((rule, idx) => (
                    <li key={idx} className="leading-tight">{rule}</li>
                  ))}
                </ul>
              </div>

              <div>
                <div className="text-[11px] font-medium text-sky-400 flex items-center gap-1 mb-1">
                  <Sparkles className="h-3 w-3" />
                  <span>Key Architectural Benefit:</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-tight">
                  Ensures high testability, zero tight coupling to Express HTTP details, and clean maintainability.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Code Editor Frame */}
        <div className="rounded-xl border border-slate-800 bg-[#0b0f17] flex-1 flex flex-col overflow-hidden h-[460px]">
          {/* Editor Header */}
          <div className="flex items-center justify-between px-4 py-2.5 bg-[#0f172a]/90 border-b border-slate-800">
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <FileCode className="h-4 w-4 text-sky-400" />
              <span>{selectedFile}</span>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handleCopyCode(currentCode)}
                className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                title="Copy code to clipboard"
              >
                {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          {/* Editor Code with Line Numbers */}
          <div className="flex-1 overflow-auto p-4 font-mono text-xs leading-relaxed flex gap-4">
            {/* Line numbers */}
            <div className="select-none text-slate-600 text-right pr-2 border-r border-slate-800/80 font-mono">
              {currentCode.split('\n').map((_, i) => (
                <div key={i}>{i + 1}</div>
              ))}
            </div>

            {/* Code content */}
            <pre className="text-slate-200 flex-1 overflow-x-auto whitespace-pre font-mono">
              {currentCode}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
};
