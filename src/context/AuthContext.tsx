/**
 * Simple Authentication Context
 * Manages local session state for Phase 2 UI:
 * - Current user credentials
 * - Login / Signup mock handlers
 * - Logout & redirection
 */

import React, { createContext, useContext, useState, useEffect } from 'react';
import { CURRENT_USER, type MockUser } from '../mock/mockData';
import { NavigationService, type AppRoute } from '../router/Navigation';

interface AuthContextType {
  user: MockUser | null;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => boolean;
  signup: (name: string, email: string, password?: string) => boolean;
  logout: () => void;
}

const AUTH_STORAGE_KEY = 'ai_code_review_auth_session';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<MockUser | null>(() => {
    try {
      const stored = localStorage.getItem(AUTH_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to parse auth from localStorage', e);
    }
    // Default to mock user for developer ease of testing
    return CURRENT_USER;
  });

  const login = (email: string, _password?: string): boolean => {
    const newUser: MockUser = {
      ...CURRENT_USER,
      email: email.trim() || CURRENT_USER.email,
      name: email.split('@')[0] || CURRENT_USER.name,
    };
    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to store auth', e);
    }
    NavigationService.navigate('/dashboard');
    return true;
  };

  const signup = (name: string, email: string, _password?: string): boolean => {
    const newUser: MockUser = {
      id: `usr_${Date.now().toString(36)}`,
      name: name.trim() || 'Developer',
      email: email.trim() || 'dev@example.com',
      role: 'Software Engineer',
      team: 'Engineering',
    };
    setUser(newUser);
    try {
      localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newUser));
    } catch (e) {
      console.warn('Failed to store auth', e);
    }
    NavigationService.navigate('/dashboard');
    return true;
  };

  const logout = () => {
    setUser(null);
    try {
      localStorage.removeItem(AUTH_STORAGE_KEY);
    } catch (e) {
      console.warn('Failed to remove auth', e);
    }
    NavigationService.navigate('/');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
