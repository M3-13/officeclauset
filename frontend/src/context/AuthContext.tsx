import { createContext, useCallback, useMemo, useState } from "react";
import type { ReactNode } from "react";
import type { AuthContextType, User } from "../types";

export const AuthContext = createContext<AuthContextType>({
  user: null,
  token: null,
  isAuthenticated: false,
  login: async () => {},
  register: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);

  const login = useCallback(async (_email: string, _password: string) => {
    // Stub – wird in Ticket #1 implementiert
  }, []);

  const register = useCallback(
    async (_email: string, _password: string, _privacyConsent: boolean) => {
      // Stub – wird in Ticket #1 implementiert
    },
    [],
  );

  const logout = useCallback(() => {
    setUser(null);
    setToken(null);
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
