/**
 * Main Application Layout
 * Wraps authenticated pages with the Global AppNavbar, main content container, and AppFooter.
 */

import React from 'react';
import { AppNavbar } from './AppNavbar';
import { AppFooter } from './AppFooter';
import type { AppRoute } from '../../router/Navigation';

interface AppLayoutProps {
  currentRoute: AppRoute;
  onNavigate: (route: AppRoute) => void;
  children: React.ReactNode;
}

export const AppLayout: React.FC<AppLayoutProps> = ({ currentRoute, onNavigate, children }) => {
  return (
    <div className="min-h-screen flex flex-col bg-[#0b0f17] text-slate-200">
      <AppNavbar currentRoute={currentRoute} onNavigate={onNavigate} />
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-6 animate-fade-in">
        {children}
      </main>
      <AppFooter onNavigate={onNavigate} />
    </div>
  );
};
