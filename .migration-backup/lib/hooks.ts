'use client';

import { useStore } from '@/lib/store';
import { api } from '@/lib/api';
import { AuthResponse } from '@/lib/types';

/**
 * GEN ERA — Auth Hook
 * Wraps the auth API calls with Zustand state management.
 */
export const useAuth = () => {
  const user = useStore((state) => state.user);
  const token = useStore((state) => state.token);
  const setUser = useStore((state) => state.setUser);
  const setToken = useStore((state) => state.setToken);
  const logout = useStore((state) => state.logout);

  const login = async (email: string, password: string) => {
    const response = await api.post<AuthResponse>('/auth/login', { email, password });
    if (response.success) {
      setUser(response.user);
      setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('genEraToken', response.token);
      }
      return response.user;
    }
    throw new Error('Login failed');
  };

  const register = async (name: string, email: string, password: string, avatar?: string) => {
    const response = await api.post<AuthResponse>('/auth/register', { name, email, password, avatar });
    if (response.success) {
      setUser(response.user);
      setToken(response.token);
      if (typeof window !== 'undefined') {
        localStorage.setItem('genEraToken', response.token);
      }
      return response.user;
    }
    throw new Error('Registration failed');
  };

  return {
    user,
    token,
    login,
    register,
    logout,
    isAuthenticated: !!user && !!token,
    isAdmin: user?.role === 'admin',
  };
};
