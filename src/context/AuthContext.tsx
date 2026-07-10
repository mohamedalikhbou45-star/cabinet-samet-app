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
  saveDeviceToken,
  saveSession,
} from "../api/client";
import { registerForPushNotifications } from "../api/push";

type LoginResult = { requires2FA: true; userId: string } | { requires2FA: false };

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<LoginResult>;
  verify2FA: (userId: string, code: string, remember: boolean) => Promise<void>;
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

  const login = useCallback(
    async (email: string, password: string): Promise<LoginResult> => {
      const result = await api.login(email, password);
      if ("requires2FA" in result && result.requires2FA) {
        return { requires2FA: true, userId: result.userId };
      }
      const { token, user: loggedUser } = result as {
        token: string;
        user: ApiUser;
      };
      await saveSession(token, loggedUser);
      setUser(loggedUser);
      registerForPushNotifications().catch(() => {});
      return { requires2FA: false };
    },
    []
  );

  const verify2FA = useCallback(
    async (userId: string, code: string, remember: boolean) => {
      const { token, user: loggedUser, deviceToken } = await api.verify2FA(
        userId,
        code,
        remember
      );
      await saveSession(token, loggedUser);
      if (deviceToken) await saveDeviceToken(deviceToken);
      setUser(loggedUser);
      registerForPushNotifications().catch(() => {});
    },
    []
  );

  const logout = useCallback(async () => {
    await clearSession();
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, verify2FA, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth doit être utilisé dans AuthProvider");
  return ctx;
}
