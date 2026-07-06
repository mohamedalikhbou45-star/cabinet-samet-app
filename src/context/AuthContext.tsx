import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import {
  api,
  ApiUser,
  clearSession,
  getStoredUser,
  getToken,
  saveSession,
} from "../api/client";
import { registerForPushNotifications } from "../api/push";

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<ApiUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const token = await getToken();
      const stored = await getStoredUser();
      if (token && stored) setUser(stored);
      setLoading(false);
    })();
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const { token, user: loggedUser } = await api.login(email, password);
    await saveSession(token, loggedUser);
    setUser(loggedUser);
    registerForPushNotifications().catch(() => {});
  }, []);

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
