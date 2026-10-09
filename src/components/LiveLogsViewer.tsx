/**
 * Live Architecture Event Traces & Logs Viewer
 * Visualizes structured events across all tiers.
 */

import React, { useEffect, useState } from 'react';
import { Terminal, Trash2, Filter, RefreshCw, Layers } from 'lucide-react';
import { logger, type LogEntry, type LayerTag } from '../utils/logger';

export const LiveLogsViewer: React.FC = () => {
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedLayer, setSelectedLayer] = useState<string>('ALL');

  const refreshLogs = () => {
    setLogs(logger.getRecentLogs(100));
  };

  useEffect(() => {
    refreshLogs();
    const unsubscribe = logger.subscribe(() => {
      refreshLogs();
    });
    return () => unsubscribe();
  }, []);

  const clearAllLogs = () => {
    logger.clearLogs();
    refreshLogs();
  };

  const filteredLogs = logs.filter((log) => {
    if (selectedLayer === 'ALL') return true;
    return log.layer === selectedLayer;
  });

  const layerBadges: Record<string, string> = {
    ROUTE: 'text-sky-400 bg-sky-950/60 border-sky-800',
    MIDDLEWARE: 'text-indigo-400 bg-indigo-950/60 border-indigo-800',
    CONTROLLER: 'text-emerald-400 bg-emerald-950/60 border-emerald-800',
    SERVICE: 'text-amber-400 bg-amber-950/60 border-amber-800',
    MODEL: 'text-purple-400 bg-purple-950/60 border-purple-800',
    CONFIG: 'text-rose-400 bg-rose-950/60 border-rose-800',
    TEST: 'text-teal-400 bg-teal-950/60 border-teal-800',
  };

  return (
    <div className="space-y-4">
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-xl border border-slate-800 bg-[#0f172a]/60">
        <div className="flex items-center gap-2">
          <Terminal className="h-4 w-4 text-sky-400" />
          <span className="text-sm font-semibold text-white">Live Architecture Event Stream</span>
          <span className="text-xs font-mono text-slate-500 tabular-nums">({logs.length} entries)</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Layer Filter */}
          <div className="flex items-center gap-1 text-xs">
            <span className="text-slate-400 hidden sm:inline">Filter Layer:</span>
            <select
              value={selectedLayer}
              onChange={(e) => setSelectedLayer(e.target.value)}
              className="bg-slate-900 border border-slate-700 rounded-md px-2.5 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
            >
              <option value="ALL">All Layers</option>
              <option value="ROUTE">ROUTE</option>
              <option value="CONTROLLER">CONTROLLER</option>
              <option value="SERVICE">SERVICE</option>
              <option value="MODEL">MODEL</option>
              <option value="MIDDLEWARE">MIDDLEWARE</option>
              <option value="TEST">TEST</option>
            </select>
          </div>

          <button
            onClick={clearAllLogs}
            className="flex items-center gap-1 px-2.5 py-1 rounded text-xs text-slate-400 hover:text-slate-200 bg-slate-800/80 hover:bg-slate-700 transition-colors"
          >
            <Trash2 className="h-3 w-3" />
            <span>Clear</span>
          </button>
        </div>
      </div>

      {/* Log Console Frame */}
      <div className="rounded-xl border border-slate-800 bg-[#0b0f17] p-4 font-mono text-xs max-h-[560px] overflow-y-auto space-y-2">
        {filteredLogs.length > 0 ? (
          filteredLogs.map((log) => (
            <div
              key={log.id}
              className="flex items-start gap-3 py-1.5 px-2 rounded hover:bg-slate-900/60 transition-colors border border-transparent hover:border-slate-800/60"
            >
              <span className="text-slate-500 text-[11px] tabular-nums shrink-0">
                {log.timestamp.split('T')[1].slice(0, 12)}
              </span>

              <span
                className={`px-1.5 py-0.2 rounded text-[10px] font-semibold border shrink-0 ${
                  layerBadges[log.layer] || 'text-slate-400 border-slate-700'
                }`}
              >
                {log.layer}
              </span>

              <span
                className={`flex-1 break-all ${
                  log.level === 'error'
                    ? 'text-rose-400'
                    : log.level === 'warn'
                    ? 'text-amber-400'
                    : 'text-slate-300'
                }`}
              >
                {log.message}
              </span>

              {log.meta && Object.keys(log.meta).length > 0 && (
                <span className="text-slate-500 text-[10px] shrink-0 max-w-[200px] truncate">
                  {JSON.stringify(log.meta)}
                </span>
              )}
            </div>
          ))
        ) : (
          <div className="p-8 text-center text-slate-500">
            No events recorded yet. Trigger requests in the Architecture Flow or API Workbench to generate logs.
          </div>
        )}
      </div>
    </div>
  );
};
