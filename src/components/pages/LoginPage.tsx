/**
 * Login Page Component
 * Clean developer login screen with mock authentication.
 */

import React, { useState } from 'react';
import { Bot, Lock, Mail, ArrowRight, ArrowLeft, Sparkles, UserCheck } from 'lucide-react';
import type { AppRoute } from '../../router/Navigation';
import { useAuth } from '../../context/AuthContext';

interface LoginPageProps {
  onNavigate: (route: AppRoute) => void;
}

export const LoginPage: React.FC<LoginPageProps> = ({ onNavigate }) => {
  const { login } = useAuth();
  const [email, setEmail] = useState('pavan@example.com');
  const [password, setPassword] = useState('••••••••••••');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => {
      login(email, password);
      onNavigate('/dashboard');
    }, 200);
  };

  const handleQuickDemoLogin = () => {
    setIsLoading(true);
    setTimeout(() => {
      login('pavan@example.com');
      onNavigate('/dashboard');
    }, 150);
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
          <h2 className="text-xl font-bold text-white tracking-tight">Sign in to your account</h2>
          <p className="text-xs text-slate-400">
            Enter your credentials to access the Context-Aware Code Review Agent.
          </p>
        </div>

        {/* 1-Click Demo Login Banner */}
        <button
          onClick={handleQuickDemoLogin}
          type="button"
          className="w-full flex items-center justify-center gap-2 p-2.5 rounded-xl bg-sky-950/70 border border-sky-800 hover:bg-sky-900/80 text-sky-200 text-xs font-semibold transition-colors shadow-sm"
        >
          <Sparkles className="h-3.5 w-3.5 text-sky-400" />
          <span>Quick Sign In as Staff Engineer (Demo)</span>
        </button>

        <div className="relative flex items-center justify-center">
          <div className="w-full border-t border-slate-800" />
          <span className="bg-[#0f172a] px-2 text-[10px] uppercase font-mono text-slate-500 absolute">
            or with email
          </span>
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
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
            <div className="flex items-center justify-between">
              <label className="text-slate-300 font-medium">Password</label>
              <span className="text-[11px] text-slate-500 hover:text-sky-400 cursor-pointer">
                Forgot password?
              </span>
            </div>
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

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-md shadow-sky-950 transition-colors disabled:opacity-50"
          >
            <span>{isLoading ? 'Signing in...' : 'Sign In'}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        </form>

        {/* Link to Sign Up */}
        <div className="pt-2 text-center text-xs text-slate-400">
          <span>Don&apos;t have an account yet? </span>
          <button
            onClick={() => onNavigate('/signup')}
            className="text-sky-400 hover:underline font-medium"
          >
            Create account
          </button>
        </div>
      </div>
    </div>
  );
};
