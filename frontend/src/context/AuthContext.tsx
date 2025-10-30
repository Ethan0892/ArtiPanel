/**
 * Authentication Context
 * 
 * Manages user authentication state, tokens, and login/logout
 */

import React, { createContext, useContext, useCallback, useEffect, useState, useMemo } from 'react';

export interface AuthUser {
  id: string;
  username: string;
  email: string;
  role: 'admin' | 'user' | 'viewer';
  createdAt: string;
  lastLogin?: string;
}

export interface AuthContextValue {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitializing: boolean;
  requiresSetup: boolean;
  login: (username: string, password: string) => Promise<{ success: boolean; error?: string }>;
  register: (username: string, email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [accessToken, setAccessToken] = useState<string | null>(null);
  const [refreshToken, setRefreshToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [requiresSetup, setRequiresSetup] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // Check system status
        const statusResponse = await fetch('/api/auth/status');
        const statusData = await statusResponse.json();
        setRequiresSetup(statusData.requiresSetup);

        // Restore session from localStorage
        const storedAccessToken = localStorage.getItem('artipanel-access-token');
        const storedRefreshToken = localStorage.getItem('artipanel-refresh-token');
        const storedUser = localStorage.getItem('artipanel-user');

        if (storedAccessToken && storedUser) {
          setAccessToken(storedAccessToken);
          setRefreshToken(storedRefreshToken);
          setUser(JSON.parse(storedUser));
        }
      } catch (err) {
        console.error('Auth initialization error', err);
      } finally {
        setIsInitializing(false);
      }
    };

    initializeAuth();
  }, []);

  const login = useCallback(
    async (username: string, password: string): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Login failed';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        localStorage.setItem('artipanel-access-token', data.accessToken);
        localStorage.setItem('artipanel-refresh-token', data.refreshToken);
        localStorage.setItem('artipanel-user', JSON.stringify(data.user));

        return { success: true };
      } catch (err: any) {
        const errorMsg = err.message || 'Login failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const register = useCallback(
    async (
      username: string,
      email: string,
      password: string
    ): Promise<{ success: boolean; error?: string }> => {
      setIsLoading(true);
      setError(null);
      try {
        const response = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ username, email, password }),
        });

        const data = await response.json();

        if (!response.ok) {
          const errorMsg = data.error || 'Registration failed';
          setError(errorMsg);
          return { success: false, error: errorMsg };
        }

        setUser(data.user);
        setAccessToken(data.accessToken);
        setRefreshToken(data.refreshToken);

        localStorage.setItem('artipanel-access-token', data.accessToken);
        localStorage.setItem('artipanel-refresh-token', data.refreshToken);
        localStorage.setItem('artipanel-user', JSON.stringify(data.user));

        // If this was first admin, setup is complete
        if (data.isFirstAdmin) {
          setRequiresSetup(false);
        }

        return { success: true };
      } catch (err: any) {
        const errorMsg = err.message || 'Registration failed';
        setError(errorMsg);
        return { success: false, error: errorMsg };
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  const logout = useCallback(() => {
    setUser(null);
    setAccessToken(null);
    setRefreshToken(null);
    setError(null);

    localStorage.removeItem('artipanel-access-token');
    localStorage.removeItem('artipanel-refresh-token');
    localStorage.removeItem('artipanel-user');

    // Optionally notify backend
    fetch('/api/auth/logout', { method: 'POST' }).catch((err) => console.error(err));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const isAuthenticated = useMemo(() => Boolean(user && accessToken), [user, accessToken]);

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      accessToken,
      refreshToken,
      isAuthenticated,
      isLoading,
      isInitializing,
      requiresSetup,
      login,
      register,
      logout,
      clearError,
      error,
    }),
    [user, accessToken, refreshToken, isAuthenticated, isLoading, isInitializing, requiresSetup, login, register, logout, clearError, error]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextValue => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
