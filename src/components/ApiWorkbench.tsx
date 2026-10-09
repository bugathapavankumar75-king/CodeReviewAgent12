/**
 * API Workbench
 * Interactive REST client for testing live Clean Architecture endpoints.
 */

import React, { useState } from 'react';
import { Send, CheckCircle2, AlertTriangle, RefreshCw, Copy, Check } from 'lucide-react';
import { ArchitectureEngine, type RequestTraceResult } from '../services/architectureEngine';

export const ApiWorkbench: React.FC = () => {
  const [method, setMethod] = useState<'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE'>('GET');
  const [endpoint, setEndpoint] = useState<string>('/api/v1/users');
  const [requestBody, setRequestBody] = useState<string>('{\n  "role": "developer"\n}');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<RequestTraceResult | null>(null);
  const [copied, setCopied] = useState<boolean>(false);

  const presets = [
    {
      label: 'GET /users (List Users)',
      method: 'GET' as const,
      endpoint: '/api/v1/users',
      body: '',
    },
    {
      label: 'POST /users (Create User)',
      method: 'POST' as const,
      endpoint: '/api/v1/users',
      body: JSON.stringify(
        {
          name: 'David Kim',
          email: `david.kim.${Math.floor(Math.random() * 900 + 100)}@example.com`,
          role: 'developer',
          department: 'Cloud Infrastructure',
        },
        null,
        2
      ),
    },
    {
      label: 'GET /projects (List Projects)',
      method: 'GET' as const,
      endpoint: '/api/v1/projects',
      body: '',
    },
    {
      label: 'POST /projects (Create Project)',
      method: 'POST' as const,
      endpoint: '/api/v1/projects',
      body: JSON.stringify(
        {
          name: 'Zero-Copy Serialization',
          code: `ENG-${Math.floor(Math.random() * 800 + 100)}`,
          description: 'High-throughput binary protocol encoder using shared memory.',
          ownerId: 'usr_1000',
          priority: 'critical',
          budget: 110000,
        },
        null,
        2
      ),
    },
    {
      label: 'GET /projects/:id/metrics (Metrics)',
      method: 'GET' as const,
      endpoint: '/api/v1/projects/prj_2000/metrics',
      body: '',
    },
    {
      label: 'PATCH /tasks/:id/status (Transition)',
      method: 'PATCH' as const,
      endpoint: '/api/v1/tasks/tsk_3000/status',
      body: JSON.stringify({ status: 'done' }, null, 2),
    },
    {
      label: 'GET /health (System Status)',
      method: 'GET' as const,
      endpoint: '/api/v1/health',
      body: '',
    },
  ];

  const handleApplyPreset = (preset: typeof presets[0]) => {
    setMethod(preset.method);
    setEndpoint(preset.endpoint);
    setRequestBody(preset.body || '');
    setResponse(null);
  };

  const handleSendRequest = async () => {
    setIsLoading(true);
    let parsedBody: unknown = undefined;

    if (['POST', 'PUT', 'PATCH'].includes(method) && requestBody.trim()) {
      try {
        parsedBody = JSON.parse(requestBody);
      } catch (e: any) {
        alert('Invalid JSON in request body');
        setIsLoading(false);
        return;
      }
    }

    // Extract ID from endpoint if parameterized
    const parts = endpoint.split('/');
    const params: Record<string, string> = {};
    if (endpoint.includes('projects/prj_')) {
      const idx = parts.findIndex((p) => p.startsWith('prj_'));
      if (idx !== -1) params.id = parts[idx];
    } else if (endpoint.includes('users/usr_')) {
      const idx = parts.findIndex((p) => p.startsWith('usr_'));
      if (idx !== -1) params.id = parts[idx];
    } else if (endpoint.includes('tasks/tsk_')) {
      const idx = parts.findIndex((p) => p.startsWith('tsk_'));
      if (idx !== -1) params.id = parts[idx];
    }

    const res = await ArchitectureEngine.traceRequest(method, endpoint, parsedBody, params);
    setResponse(res);
    setIsLoading(false);
  };

  const copyResponse = () => {
    if (!response) return;
    navigator.clipboard.writeText(JSON.stringify(response.responsePayload, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="space-y-5">
      {/* Top Presets Bar */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-4">
        <div className="text-xs font-semibold text-slate-300 mb-2.5">Quick Request Presets:</div>
        <div className="flex flex-wrap gap-2">
          {presets.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleApplyPreset(preset)}
              className={`px-3 py-1.5 rounded-lg text-xs font-mono font-medium transition-colors border ${
                endpoint === preset.endpoint && method === preset.method
                  ? 'bg-sky-950/80 text-sky-300 border-sky-700'
                  : 'bg-slate-900/60 text-slate-400 hover:text-slate-200 border-slate-800 hover:border-slate-700'
              }`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>

      {/* Main Request & Response Workbench */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
        {/* Request Builder */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <span className="text-sm font-semibold text-white">HTTP Request Builder</span>
              <span className="text-xs text-slate-500 font-mono">Live Express Dispatcher</span>
            </div>

            {/* Method & URL Input */}
            <div className="flex gap-2">
              <select
                value={method}
                onChange={(e) => setMethod(e.target.value as any)}
                className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono font-semibold text-sky-400 focus:outline-none focus:border-sky-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="PATCH">PATCH</option>
                <option value="DELETE">DELETE</option>
              </select>

              <input
                type="text"
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
                className="flex-1 bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-sky-500"
                placeholder="/api/v1/users"
              />

              <button
                onClick={handleSendRequest}
                disabled={isLoading}
                className="flex items-center gap-1.5 px-4 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
              >
                {isLoading ? <RefreshCw className="h-3.5 w-3.5 animate-spin" /> : <Send className="h-3.5 w-3.5" />}
                <span>Send</span>
              </button>
            </div>

            {/* Request Body (for POST/PUT/PATCH) */}
            {['POST', 'PUT', 'PATCH'].includes(method) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>JSON Payload Body:</span>
                  <span className="text-[10px] text-slate-500">application/json</span>
                </div>
                <textarea
                  value={requestBody}
                  onChange={(e) => setRequestBody(e.target.value)}
                  rows={8}
                  className="w-full bg-[#0b0f17] border border-slate-800 rounded-lg p-3 text-xs font-mono text-emerald-300 focus:outline-none focus:border-sky-500 leading-relaxed"
                  placeholder="{}"
                />
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Dispatches through Route &rarr; Validator &rarr; Controller &rarr; Service &rarr; Model</span>
            <span className="font-mono text-sky-400">Node.js Clean Architecture</span>
          </div>
        </div>

        {/* Response Viewer */}
        <div className="lg:col-span-6 rounded-xl border border-slate-800 bg-[#0f172a]/70 p-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-2 border-b border-slate-800 mb-3">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-white">HTTP Response</span>
                {response && (
                  <span
                    className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                      response.statusCode < 400
                        ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                        : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {response.statusCode}
                  </span>
                )}
              </div>

              {response && (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-slate-400 tabular-nums">
                    {response.durationMs}ms
                  </span>
                  <button
                    onClick={copyResponse}
                    className="p-1 rounded text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 transition-colors"
                    title="Copy response JSON"
                  >
                    {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                  </button>
                </div>
              )}
            </div>

            {response ? (
              <div className="space-y-3">
                <pre className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto max-h-[340px] leading-relaxed">
                  {JSON.stringify(response.responsePayload, null, 2)}
                </pre>

                <div className="p-2.5 rounded-lg bg-slate-900/60 border border-slate-800/80 text-xs text-slate-400">
                  <div className="text-[11px] font-medium text-slate-300 mb-1">Architecture Trace Summary:</div>
                  <div className="flex flex-wrap gap-2 text-[11px] font-mono">
                    {response.hops.map((h, i) => (
                      <span key={i} className="text-slate-400">
                        {h.layer} ({h.durationMs}ms) {i < response.hops.length - 1 ? '→' : ''}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-slate-500 rounded-lg border border-dashed border-slate-800 bg-[#0b0f17]/40">
                <p className="text-xs">Select a preset or click &quot;Send&quot; to test the live API.</p>
              </div>
            )}
          </div>

          <div className="pt-4 border-t border-slate-800/80 text-[11px] text-slate-500">
            Enforces strict standardized envelope: <code className="text-slate-400">{'{ success, statusCode, message, data, meta, timestamp }'}</code>
          </div>
        </div>
      </div>
    </div>
  );
};
