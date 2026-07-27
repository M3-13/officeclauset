import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types";
import { post, setAuthToken } from "../api/client";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

interface AuthResponse {
  access_token: string;
  token_type: string;
  user: User;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (email: string, password: string) => {
    const data = await post<AuthResponse>("/auth/login", {
      email,
      password,
    });
    setToken(data.access_token);
    setAuthToken(data.access_token);
    setUser(data.user);
  }, []);

  const register = useCallback(
    async (email: string, password: string, privacyConsent: boolean) => {
      const data = await post<AuthResponse>("/auth/register", {
        email,
        password,
        privacy_consent: privacyConsent,
      });
      setToken(data.access_token);
      setAuthToken(data.access_token);
      setUser(data.user);
    },
    [],
  );

  const logout = useCallback(async () => {
    try {
      await post("/auth/logout", {});
    } catch {
      // Logout should always succeed client-side
    }
    setUser(null);
    setToken(null);
    setAuthToken(null);
  }, []);

  const value = useMemo<AuthContextType>(
    () => ({
      user,
      token,
      isAuthenticated: !!token,
      login,
      register,
      logout,
    }),
    [user, token, login, register, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
