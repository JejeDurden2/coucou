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
  login: (email: string, password: string) => Promise<User>;
  register: (email: string, password: string, name: string) => Promise<User>;
  loadUser: () => Promise<User | null>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async (): Promise<User | null> => {
    try {
      const userData = await apiClient.getMe();
      setUser(userData);
      return userData;
    } catch {
      // Try to refresh the token
      try {
        const userData = await apiClient.refreshToken();
        setUser(userData);
        return userData;
      } catch {
        setUser(null);
        return null;
      }
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const userData = await apiClient.login(email, password);
    setUser(userData);
    return userData;
  }, []);

  const register = useCallback(
    async (email: string, password: string, name: string): Promise<User> => {
      const userData = await apiClient.register(email, password, name);
      setUser(userData);
      return userData;
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await apiClient.logout();
    } finally {
      setUser(null);
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      isLoading,
      isAuthenticated: !!user,
      login,
      register,
      loadUser,
      logout,
    }),
    [user, isLoading, login, register, loadUser, logout],
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
