/**
 * AI Code Review Agent - Phase 2 Web Application Shell
 * Features:
 * - Application flow: Landing -> Login/Signup -> Dashboard -> Repositories -> PRs -> Code Review -> Knowledge -> Settings
 * - Seamless client-side routing & deep linking
 * - Complete preservation of Phase 1 engine, workspace, and 12 acceptance test suites
 */

import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NavigationService, type AppRoute } from './router/Navigation';

// Layout & Pages
import { AppLayout } from './components/layout/AppLayout';
import { LandingPage } from './components/pages/LandingPage';
import { LoginPage } from './components/pages/LoginPage';
import { SignUpPage } from './components/pages/SignUpPage';
import { DashboardPage } from './components/pages/DashboardPage';
import { RepositoriesPage } from './components/pages/RepositoriesPage';
import { PullRequestsPage } from './components/pages/PullRequestsPage';
import { CodeReviewPage } from './components/pages/CodeReviewPage';
import { KnowledgePage } from './components/pages/KnowledgePage';
import { SettingsPage } from './components/pages/SettingsPage';
import { StudioPage } from './components/pages/StudioPage';

function AppRouter() {
  const [currentRoute, setCurrentRoute] = useState<AppRoute>(() => NavigationService.getInitialRoute());
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const nextRoute = NavigationService.getInitialRoute();
      setCurrentRoute(nextRoute);
      window.scrollTo(0, 0);
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  const handleNavigate = (route: AppRoute) => {
    NavigationService.navigate(route);
    setCurrentRoute(route);
    window.scrollTo(0, 0);
  };

  // 1. Unauthenticated Standalone Pages: Landing, Login, SignUp
  if (currentRoute === '/') {
    return <LandingPage onNavigate={handleNavigate} />;
  }

  if (currentRoute === '/login') {
    return <LoginPage onNavigate={handleNavigate} />;
  }

  if (currentRoute === '/signup') {
    return <SignUpPage onNavigate={handleNavigate} />;
  }

  // 2. Authenticated Application Shell Pages
  return (
    <AppLayout currentRoute={currentRoute} onNavigate={handleNavigate}>
      {currentRoute === '/dashboard' && <DashboardPage onNavigate={handleNavigate} />}
      {currentRoute === '/repositories' && <RepositoriesPage onNavigate={handleNavigate} />}
      {currentRoute === '/pull-requests' && <PullRequestsPage onNavigate={handleNavigate} />}
      {currentRoute === '/code-review' && <CodeReviewPage onNavigate={handleNavigate} />}
      {currentRoute === '/knowledge' && <KnowledgePage onNavigate={handleNavigate} />}
      {currentRoute === '/settings' && <SettingsPage onNavigate={handleNavigate} />}
      {currentRoute === '/studio' && <StudioPage />}
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}
