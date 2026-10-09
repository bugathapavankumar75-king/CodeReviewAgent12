/**
 * Live Data Store & Repository Viewer
 * Displays current state of entities persisted in model repositories.
 */

import React, { useEffect, useState } from 'react';
import { Database, RefreshCw, Users, Briefcase, CheckSquare, Search } from 'lucide-react';
import { ArchitectureEngine } from '../services/architectureEngine';
import type { User } from '../models/user.model';
import type { Project } from '../models/project.model';
import type { Task } from '../models/task.model';

export const DataStoreViewer: React.FC = () => {
  const [data, setData] = useState<{ users: User[]; projects: Project[]; tasks: Task[] }>({
    users: [],
    projects: [],
    tasks: [],
  });
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'users' | 'projects' | 'tasks'>('projects');
  const [search, setSearch] = useState<string>('');

  const loadData = async () => {
    setLoading(true);
    const res = await ArchitectureEngine.fetchStoredData();
    setData(res);
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl border border-slate-800 bg-[#0f172a]/60">
        <div>
          <div className="flex items-center gap-2 text-xs text-purple-400 font-mono">
            <span>REPOSITORY LAYER PERSISTENCE</span>
            <span>·</span>
            <span>SRC/MODELS/</span>
          </div>
          <h2 className="mt-1 text-xl font-semibold text-white tracking-tight">
            Live Model Repositories
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Real-time inspection of entity records stored across in-memory repository tables.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadData}
            disabled={loading}
            className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium border border-slate-700 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh State</span>
          </button>
        </div>
      </div>

      {/* Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('projects')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'projects'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="h-3.5 w-3.5" />
            <span>Projects ({data.projects.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('users')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'users'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Users className="h-3.5 w-3.5" />
            <span>Users ({data.users.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('tasks')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
              activeTab === 'tasks'
                ? 'bg-slate-800 text-sky-400 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CheckSquare className="h-3.5 w-3.5" />
            <span>Tasks ({data.tasks.length})</span>
          </button>
        </div>

        <div className="relative">
          <Search className="h-3.5 w-3.5 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search records..."
            className="pl-8 pr-3 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-sky-500"
          />
        </div>
      </div>

      {/* Tables */}
      <div className="rounded-xl border border-slate-800 bg-[#0f172a]/60 overflow-hidden">
        {activeTab === 'projects' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID / Code</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Owner</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Budget</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.projects.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sky-400 font-semibold">{p.code}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans">{p.name}</td>
                    <td className="px-4 py-3 text-slate-400">{p.ownerId}</td>
                    <td className="px-4 py-3">
                      <span className="text-amber-400">{p.priority}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-300">{p.status}</td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      ${p.budget.toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'users' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Name</th>
                  <th className="px-4 py-3">Email</th>
                  <th className="px-4 py-3">Role</th>
                  <th className="px-4 py-3">Department</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sky-400">{u.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans font-medium">{u.name}</td>
                    <td className="px-4 py-3 text-slate-400">{u.email}</td>
                    <td className="px-4 py-3 text-amber-300">{u.role}</td>
                    <td className="px-4 py-3 text-slate-300 font-sans">{u.department}</td>
                    <td className="px-4 py-3 text-emerald-400">{u.status}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {activeTab === 'tasks' && (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-[#0f172a] text-slate-400 font-mono uppercase text-[10px] border-b border-slate-800">
                <tr>
                  <th className="px-4 py-3">ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Project</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Estimate</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {data.tasks.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/30">
                    <td className="px-4 py-3 text-sky-400">{t.id}</td>
                    <td className="px-4 py-3 text-slate-200 font-sans">{t.title}</td>
                    <td className="px-4 py-3 text-slate-400">{t.projectId}</td>
                    <td className="px-4 py-3 text-slate-400">{t.assigneeId || 'Unassigned'}</td>
                    <td className="px-4 py-3 text-sky-300">{t.status}</td>
                    <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                      {t.estimateHours} hrs
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
