/**
 * Architecture Flow Visualizer
 * Interactive diagram demonstrating 3-tier request flow:
 * Client -> Route -> Middleware/Utils -> Controller -> Service -> Model -> Store
 */

import React, { useState } from 'react';
import { ArrowRight, CheckCircle2, AlertCircle, Play, Layers, ShieldCheck, Database, Cpu, Compass } from 'lucide-react';
import { ArchitectureEngine, type RequestTraceResult, type LayerHop } from '../services/architectureEngine';

export const ArchitectureVisualizer: React.FC = () => {
  const [activeScenario, setActiveScenario] = useState<string>('create-project');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [activeHopIndex, setActiveHopIndex] = useState<number>(-1);
  const [traceResult, setTraceResult] = useState<RequestTraceResult | null>(null);

  const scenarios = [
    {
      id: 'create-project',
      title: 'Create Project (Happy Path)',
      method: 'POST' as const,
      endpoint: '/api/v1/projects',
      desc: 'Flows through all 5 tiers: routes -> validator -> controller -> service -> model -> store',
      body: {
        name: 'Realtime WebSocket Mesh',
        code: `NET-${Math.floor(Math.random() * 800 + 100)}`,
        description: 'Global distributed mesh with automatic partition healing.',
        ownerId: 'usr_1000',
        priority: 'high',
        budget: 85000,
      },
    },
    {
      id: 'list-users',
      title: 'List Users (Pagination)',
      method: 'GET' as const,
      endpoint: '/api/v1/users',
      desc: 'Retrieves user collection with offset pagination and role filtering',
      query: { page: '1', limit: '10' },
    },
    {
      id: 'conflict-error',
      title: 'Email Conflict (Operational Error)',
      method: 'POST' as const,
      endpoint: '/api/v1/users',
      desc: 'Shows Service layer asserting domain invariant & ApiError 409 mapped by Middleware',
      body: {
        name: 'Alex Rivera Duplicate',
        email: 'alex.rivera@example.com', // Already registered
        role: 'developer',
      },
    },
    {
      id: 'project-metrics',
      title: 'Project Metrics Aggregation',
      method: 'GET' as const,
      endpoint: '/api/v1/projects/prj_2000/metrics',
      desc: 'Service layer joins project & task repositories to compute completion rates',
      params: { id: 'prj_2000' },
    },
    {
      id: 'task-status',
      title: 'Task State Transition',
      method: 'PATCH' as const,
      endpoint: '/api/v1/tasks/tsk_3000/status',
      desc: 'Granular status update: model transitions task and stamps completion timestamp',
      params: { id: 'tsk_3000' },
      body: { status: 'done' },
    },
  ];

  const currentScenario = scenarios.find((s) => s.id === activeScenario) || scenarios[0];

  const handleRunTrace = async () => {
    setIsExecuting(true);
    setActiveHopIndex(0);

    const result = await ArchitectureEngine.traceRequest(
      currentScenario.method,
      currentScenario.endpoint,
      currentScenario.body,
      currentScenario.params,
      currentScenario.query
    );

    // Simulate animated step-by-step pulse across layers
    for (let i = 0; i < result.hops.length; i++) {
      setActiveHopIndex(i);
      await new Promise((res) => setTimeout(res, 220));
    }

    setTraceResult(result);
    setIsExecuting(false);
  };

  const layersList = [
    {
      id: 'ROUTE',
      label: 'Route Layer',
      path: 'src/routes/',
      icon: Compass,
      color: 'border-sky-500/50 text-sky-400 bg-sky-950/20',
      description: 'Matches URL & method, applies middleware',
    },
    {
      id: 'MIDDLEWARE',
      label: 'Utils / Middleware',
      path: 'src/utils/',
      icon: ShieldCheck,
      color: 'border-indigo-500/50 text-indigo-400 bg-indigo-950/20',
      description: 'AsyncHandler, Schema Validator, ApiError mapper',
    },
    {
      id: 'CONTROLLER',
      label: 'Controller Layer',
      path: 'src/controllers/',
      icon: Layers,
      color: 'border-emerald-500/50 text-emerald-400 bg-emerald-950/20',
      description: 'Extracts params/body, formats ApiResponse',
    },
    {
      id: 'SERVICE',
      label: 'Service Layer',
      path: 'src/services/',
      icon: Cpu,
      color: 'border-amber-500/50 text-amber-400 bg-amber-950/20',
      description: 'Domain invariants, business logic, calculations',
    },
    {
      id: 'MODEL',
      label: 'Model / Repository',
      path: 'src/models/',
      icon: Database,
      color: 'border-purple-500/50 text-purple-400 bg-purple-950/20',
      description: 'Persistence contracts, database queries, indexes',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Top Banner / Concept Overview */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5 shadow-sm">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs text-sky-400 font-mono">
              <span>PATTERN: 3-TIER LAYERED ARCHITECTURE</span>
              <span>·</span>
              <span>STRICT DOWNWARD FLOW</span>
            </div>
            <h1 className="mt-1 text-xl font-semibold text-white tracking-tight">
              Request Lifecycle & Layer Execution Tracer
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-400 max-w-3xl">
              Each layer maintains a single distinct responsibility. Routes map endpoints, Controllers format HTTP responses,
              Services execute pure business logic, and Models encapsulate storage.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={handleRunTrace}
              disabled={isExecuting}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-all disabled:opacity-50"
            >
              <Play className="h-4 w-4 fill-current" />
              <span>{isExecuting ? 'Tracing Execution...' : 'Execute Trace'}</span>
            </button>
          </div>
        </div>

        {/* Scenario Selector */}
        <div className="mt-4 pt-4 border-t border-slate-800/80">
          <div className="text-xs font-medium text-slate-400 mb-2">Select Execution Scenario:</div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2">
            {scenarios.map((s) => {
              const isSelected = activeScenario === s.id;
              return (
                <button
                  key={s.id}
                  onClick={() => {
                    setActiveScenario(s.id);
                    setTraceResult(null);
                    setActiveHopIndex(-1);
                  }}
                  className={`p-2.5 rounded-lg text-left transition-all border ${
                    isSelected
                      ? 'bg-slate-800/90 border-sky-500/80 shadow-sm'
                      : 'bg-slate-900/40 border-slate-800 hover:border-slate-700 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span
                      className={`font-semibold ${
                        s.method === 'GET'
                          ? 'text-sky-400'
                          : s.method === 'POST'
                          ? 'text-emerald-400'
                          : 'text-amber-400'
                      }`}
                    >
                      {s.method}
                    </span>
                    <span className="text-[10px] text-slate-500 truncate max-w-[100px]">{s.endpoint}</span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 truncate">{s.title}</div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Visual Pipeline Graph */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/40 p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">
            Active Request Flow Pipeline
          </div>
          {traceResult && (
            <div className="flex items-center gap-2 text-xs font-mono">
              <span className="text-slate-400">Total Pipeline Duration:</span>
              <span className="text-sky-400 font-semibold tabular-nums">{traceResult.durationMs}ms</span>
              <span className="text-slate-600">·</span>
              <span className={traceResult.statusCode < 400 ? 'text-emerald-400' : 'text-amber-400'}>
                HTTP {traceResult.statusCode}
              </span>
            </div>
          )}
        </div>

        {/* The 5 Layers Grid */}
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
          {layersList.map((layer, idx) => {
            const isHopActive = isExecuting && traceResult?.hops[activeHopIndex]?.layer === layer.id;
            const wasVisited = traceResult?.hops.some((h) => h.layer === layer.id);

            return (
              <div
                key={layer.id}
                className={`relative flex flex-col justify-between p-4 rounded-xl border transition-all duration-300 ${
                  isHopActive
                    ? 'border-sky-400 bg-sky-950/40 ring-2 ring-sky-500/40 scale-[1.02]'
                    : wasVisited
                    ? `${layer.color} shadow-sm`
                    : 'border-slate-800/80 bg-slate-900/30 text-slate-500'
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[11px] font-mono opacity-80">{layer.path}</span>
                    <layer.icon className="h-4 w-4" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-100">{layer.label}</h3>
                  <p className="mt-1 text-xs text-slate-400 line-clamp-2">{layer.description}</p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-[11px] font-mono">
                  <span className="text-slate-400">Layer {idx + 1}</span>
                  {wasVisited ? (
                    <span className="flex items-center gap-1 text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      <span>Executed</span>
                    </span>
                  ) : (
                    <span className="text-slate-600">Standby</span>
                  )}
                </div>

                {/* Arrow connector for desktop */}
                {idx < 4 && (
                  <div className="hidden md:flex absolute -right-3 top-1/2 -translate-y-1/2 z-10 text-slate-700">
                    <ArrowRight className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Trace Log and Step Inspector */}
      {traceResult ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-5">
          {/* Step Timeline */}
          <div className="lg:col-span-7 rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5">
            <h3 className="text-sm font-semibold text-white mb-3 flex items-center justify-between">
              <span>Step-by-Step Layer Execution</span>
              <span className="text-xs font-mono text-slate-400">
                {traceResult.hops.length} layer hops recorded
              </span>
            </h3>

            <div className="space-y-3">
              {traceResult.hops.map((hop, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-lg border border-slate-800/80 bg-slate-900/50 flex flex-col gap-2"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-medium uppercase bg-slate-800 text-sky-400 border border-slate-700">
                        {hop.layer}
                      </span>
                      <span className="text-xs font-medium text-slate-200">{hop.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-400 tabular-nums">{hop.durationMs}ms</span>
                  </div>

                  <p className="text-xs text-slate-400">{hop.action}</p>

                  {hop.input !== undefined && hop.input !== null && (
                    <div className="text-[11px] font-mono text-slate-500 bg-slate-950/60 p-2 rounded border border-slate-900 overflow-x-auto">
                      <span className="text-slate-400 font-semibold">Input: </span>
                      {JSON.stringify(hop.input)}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Final Response Inspector */}
          <div className="lg:col-span-5 rounded-xl border border-slate-800 bg-[#0f172a]/60 p-5 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-white">HTTP Response Envelope</h3>
                <span
                  className={`px-2 py-0.5 rounded text-xs font-mono font-semibold ${
                    traceResult.statusCode < 400
                      ? 'bg-emerald-950/60 text-emerald-400 border border-emerald-800'
                      : 'bg-rose-950/60 text-rose-400 border border-rose-800'
                  }`}
                >
                  Status {traceResult.statusCode}
                </span>
              </div>

              <div className="text-xs text-slate-400 mb-2 font-mono flex items-center justify-between">
                <span>{traceResult.method} {traceResult.endpoint}</span>
                <span className="tabular-nums">{traceResult.durationMs}ms</span>
              </div>

              <pre className="p-3 rounded-lg bg-[#0b0f17] border border-slate-800 text-xs font-mono text-sky-300 overflow-x-auto max-h-[380px] leading-relaxed">
                {JSON.stringify(traceResult.responsePayload, null, 2)}
              </pre>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800/80 text-[11px] text-slate-400">
              Formatted using <code className="text-sky-400">src/utils/apiResponse.ts</code> and error handling via{' '}
              <code className="text-sky-400">src/utils/apiError.ts</code>.
            </div>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-dashed border-slate-800 p-8 text-center bg-slate-900/20">
          <Play className="h-8 w-8 text-sky-500/60 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-slate-300">Ready to trace request execution</h4>
          <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
            Click &quot;Execute Trace&quot; above to watch simulated execution pass through Route, Middleware, Controller,
            Service, and Model layers with real-time latency inspection.
          </p>
        </div>
      )}
    </div>
  );
};
