/**
 * Knowledge Base Explorer Component
 * Visualizes the 8 structured datasets with source attribution, priorities, and status.
 */

import React, { useState } from 'react';
import { Search, Database, ShieldAlert, Layers, Bookmark, Cpu, History, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { KnowledgeRepository } from '../../agent/knowledge/index';
import type { BaseKnowledgeItem } from '../../agent/knowledge/knowledge.types';

export const AgentKnowledgeExplorer: React.FC = () => {
  const [selectedDataset, setSelectedDataset] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  const datasets = KnowledgeRepository.getAllDatasets();

  const datasetMeta: Record<string, { label: string; icon: any; color: string; count: number }> = {
    project_context: { label: 'Project Context', icon: Info, color: 'text-sky-400 bg-sky-950/40 border-sky-800', count: datasets.project_context.length },
    technology_stack: { label: 'Technology Stack', icon: Cpu, color: 'text-indigo-400 bg-indigo-950/40 border-indigo-800', count: datasets.technology_stack.length },
    architecture_rules: { label: 'Architecture Rules', icon: Layers, color: 'text-amber-400 bg-amber-950/40 border-amber-800', count: datasets.architecture_rules.length },
    security_rules: { label: 'Security Rules', icon: ShieldAlert, color: 'text-rose-400 bg-rose-950/40 border-rose-800', count: datasets.security_rules.length },
    coding_standards: { label: 'Coding Standards', icon: Bookmark, color: 'text-emerald-400 bg-emerald-950/40 border-emerald-800', count: datasets.coding_standards.length },
    project_patterns: { label: 'Project Patterns', icon: Database, color: 'text-purple-400 bg-purple-950/40 border-purple-800', count: datasets.project_patterns.length },
    review_history: { label: 'Review History', icon: History, color: 'text-teal-400 bg-teal-950/40 border-teal-800', count: datasets.review_history.length },
    review_exceptions: { label: 'Review Exceptions', icon: AlertCircle, color: 'text-orange-400 bg-orange-950/40 border-orange-800', count: datasets.review_exceptions.length },
  };

  // Flatten or filter items
  const allItems: Array<BaseKnowledgeItem & { datasetKey: string }> = [];
  for (const [key, items] of Object.entries(datasets)) {
    if (selectedDataset === 'all' || selectedDataset === key) {
      items.forEach((item) => allItems.push({ ...item, datasetKey: key }));
    }
  }

  const filteredItems = allItems.filter((item) => {
    const q = searchQuery.toLowerCase();
    return (
      item.id.toLowerCase().includes(q) ||
      item.name.toLowerCase().includes(q) ||
      (item.description && item.description.toLowerCase().includes(q)) ||
      item.source.toLowerCase().includes(q)
    );
  });

  return (
    <div className="space-y-5">
      {/* Top Banner */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
              <span>8 KNOWLEDGE DATASETS</span>
              <span>·</span>
              <span>STRUCTURED &amp; DATA-DRIVEN</span>
            </div>
            <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
              Project Context &amp; Knowledge Base
            </h2>
            <p className="mt-1 text-xs text-slate-400 max-w-3xl">
              The agent never invents rules. It grounds every finding in these 8 project-specific datasets,
              guaranteeing zero generic hallucinations and strict respect for team architectural decisions.
            </p>
          </div>

          <div className="relative">
            <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search knowledge items..."
              className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500 w-56"
            />
          </div>
        </div>

        {/* Dataset Pill Tabs */}
        <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-800/80">
          <button
            onClick={() => setSelectedDataset('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
              selectedDataset === 'all'
                ? 'bg-sky-600 text-white shadow-sm'
                : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
            }`}
          >
            All Datasets ({allItems.length})
          </button>

          {Object.entries(datasetMeta).map(([key, meta]) => {
            const isSelected = selectedDataset === key;
            return (
              <button
                key={key}
                onClick={() => setSelectedDataset(key)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                  isSelected
                    ? 'bg-slate-800 text-sky-400 border-sky-700'
                    : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
                }`}
              >
                <meta.icon className="h-3.5 w-3.5" />
                <span>{meta.label}</span>
                <span className="text-[10px] opacity-75 font-mono">({meta.count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Knowledge Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => {
          const meta = datasetMeta[item.datasetKey];
          const anyItem = item as any;

          return (
            <div
              key={item.id}
              className="rounded-xl border border-slate-800 bg-[#0f172a]/70 p-4 flex flex-col justify-between hover:border-slate-700 transition-colors"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold border ${meta?.color}`}>
                      {item.id}
                    </span>
                    <span className="text-xs font-medium text-slate-400 font-mono">
                      {meta?.label}
                    </span>
                  </div>

                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/60 uppercase">
                    {item.status}
                  </span>
                </div>

                <h3 className="text-sm font-semibold text-slate-100">{item.name}</h3>
                <p className="mt-1 text-xs text-slate-300 leading-relaxed">{item.description}</p>

                {/* Specific Attributes depending on type */}
                {anyItem.rule && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs font-mono text-sky-300 leading-relaxed">
                    <div className="text-[10px] text-slate-500 uppercase font-semibold mb-1">Rule Statement:</div>
                    {anyItem.rule}
                  </div>
                )}

                {anyItem.developerReason && (
                  <div className="mt-3 p-2.5 rounded-lg bg-slate-900/90 border border-slate-800/80 text-xs text-amber-300 leading-relaxed">
                    <div className="text-[10px] text-slate-500 uppercase font-mono font-semibold mb-1">
                      Developer Rationale ({anyItem.developerDecision}):
                    </div>
                    {anyItem.developerReason}
                  </div>
                )}

                {anyItem.scope && (
                  <div className="mt-2 text-xs font-mono text-slate-400">
                    <span className="text-slate-500">Exemption Scope: </span>
                    <span className="text-orange-400">{anyItem.scope}</span>
                  </div>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                <span className="truncate max-w-[240px]">Source: {item.source}</span>
                <span>{item.updatedAt.split('T')[0]}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
