'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { User } from '@coucou-ia/shared';
import { apiClient } from './api-client';

interface AuthContextValue {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string, name: string) => Promise<void>;
  setTokens: (accessToken: string, refreshToken: string) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const ACCESS_TOKEN_KEY = 'coucou_access_token';
const REFRESH_TOKEN_KEY = 'coucou_refresh_token';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    const accessToken = localStorage.getItem(ACCESS_TOKEN_KEY);
    if (!accessToken) {
      setIsLoading(false);
      return;
    }

    apiClient.setAccessToken(accessToken);

    try {
      const userData = await apiClient.getMe();
      setUser(userData);
    } catch {
      // Try to refresh
      const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
      if (refreshToken) {
        try {
          const response = await apiClient.refreshToken(refreshToken);
          localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
          localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
          apiClient.setAccessToken(response.accessToken);
          setUser(response.user);
        } catch {
          localStorage.removeItem(ACCESS_TOKEN_KEY);
          localStorage.removeItem(REFRESH_TOKEN_KEY);
          apiClient.setAccessToken(null);
        }
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string) => {
    const response = await apiClient.login(email, password);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    apiClient.setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const register = useCallback(async (email: string, password: string, name: string) => {
    const response = await apiClient.register(email, password, name);
    localStorage.setItem(ACCESS_TOKEN_KEY, response.accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, response.refreshToken);
    apiClient.setAccessToken(response.accessToken);
    setUser(response.user);
  }, []);

  const setTokens = useCallback(async (accessToken: string, refreshToken: string) => {
    localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    apiClient.setAccessToken(accessToken);
    const userData = await apiClient.getMe();
    setUser(userData);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(ACCESS_TOKEN_KEY);
    localStorage.removeItem(REFRESH_TOKEN_KEY);
    apiClient.setAccessToken(null);
    setUser(null);
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      setTokens,
      logout,
    }),
    [user, isLoading, login, register, setTokens, logout],
  );

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
