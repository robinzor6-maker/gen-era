import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";
import { api } from "@/lib/api";
import { AuthResponse, User } from "@/lib/types";

interface AuthContextType {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => Promise<User>;
  register: (name: string, email: string, password: string) => Promise<User>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    (async () => {
      try {
        const storedToken = await AsyncStorage.getItem("genEraToken");
        const storedUser = await AsyncStorage.getItem("genEraUser");
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
        }
      } catch {}
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<User> => {
    const res = await api.post<AuthResponse>("/auth/login", { email, password });
    if (res.success) {
      await AsyncStorage.setItem("genEraToken", res.token);
      await AsyncStorage.setItem("genEraUser", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error("Login failed");
  }, []);

  const register = useCallback(async (name: string, email: string, password: string): Promise<User> => {
    const res = await api.post<AuthResponse>("/auth/register", { name, email, password });
    if (res.success) {
      await AsyncStorage.setItem("genEraToken", res.token);
      await AsyncStorage.setItem("genEraUser", JSON.stringify(res.user));
      setToken(res.token);
      setUser(res.user);
      return res.user;
    }
    throw new Error("Registration failed");
  }, []);

  const logout = useCallback(() => {
    AsyncStorage.removeItem("genEraToken");
    AsyncStorage.removeItem("genEraUser");
    setToken(null);
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, token, isAuthenticated: !!user && !!token, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
