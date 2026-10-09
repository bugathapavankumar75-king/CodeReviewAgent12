/**
 * Sign Up Page Component
 * Developer registration screen with mock local account provisioning.
 */

import React, { useState } from 'react';
import { Bot, User, Mail, Lock, ArrowRight, ArrowLeft, CheckCircle2 } from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { useAuth } from '../../context/AuthContext';

interface SignUpPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = ({ onNavigate }) => {
  const { signup } = useAuth();
  const [name, setName] = useState('Pavan Kumar');
  const [email, setEmail] = useState('pavan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      signup(name, email, password);
      onNavigate('/dashboard');
    }, 200);
  };

  return (
    <div className="min-h-screen bg-[#0b0f17] flex flex-col justify-center items-center px-4 py-12 text-slate-100">
      {/* Return to Landing Link */}
      <button
        onClick={() => onNavigate('/')}
        className="mb-8 flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
      >
        <ArrowLeft className="h-3.5 w-3.5" />
        <span>Back to Home</span>
      </button>

      <div className="w-full max-w-md p-8 rounded-2xl border border-slate-800 bg-[#0f172a]/90 shadow-2xl space-y-6">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-tr from-sky-600 to-indigo-600 text-white shadow-lg shadow-sky-950">
            <Bot className="h-6 w-6" />
          </div>
          <h2 className="text-xl font-bold text-white tracking-tight">Create your developer account</h2>
          <p className="text-xs text-slate-400">
            Start reviewing pull requests with full architecture and standards context.
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-medium">Full Name</label>
            <div className="relative flex items-center">
              <User className="absolute left-3 h-4 w-4 text-slate-500" />
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Pavan Kumar"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-medium">Work Email</label>
            <div className="relative flex items-center">
              <Mail className="absolute left-3 h-4 w-4 text-slate-500" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@company.com"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-1 text-xs">
            <label className="text-slate-300 font-medium">Password</label>
            <div className="relative flex items-center">
              <Lock className="absolute left-3 h-4 w-4 text-slate-500" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-slate-600 focus:outline-none focus:border-sky-500 font-mono"
              />
            </div>
          </div>

          <div className="space-y-2 pt-1 text-[11px] text-slate-400">
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>Full access to Phase 1 &amp; Phase 2 workspace</span>
            </div>
            <div className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <CheckCircle2 className="h-3.5 w-3.5" />
              <span>12 comprehensive acceptance test suites included</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors disabled:opacity-50"
          >
            <span>{isLoading ? 'Creating account...' : 'Create Account'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Link to Login */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Already have an account? </span>
          <button
            onClick={() => onNavigate('/login')}
            className="text-sky-400 hover:underline font-medium"
          >
            Sign in
          </button>
        </div>
      </div>
    </div>
  );
};
