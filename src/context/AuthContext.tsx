import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
} from "react";
import { Alert } from "react-native";
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
import { useLanguage } from "../i18n/LanguageContext";
import {
  authenticateWithBiometrics,
  hasBeenAskedAboutBiometric,
  isBiometricAvailable,
  markBiometricAsked,
  markJustAuthenticated,
  setBiometricEnabled,
} from "../lib/biometric";

type LoginResult = { requires2FA: true; userId: string } | { requires2FA: false };

type AuthContextValue = {
  user: ApiUser | null;
  loading: boolean;
  login: (
    email: string,
    password: string,
    keepSignedIn: boolean
  ) => Promise<LoginResult>;
  verify2FA: (
    userId: string,
    code: string,
    remember: boolean,
    keepSignedIn: boolean
  ) => Promise<void>;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { t } = useLanguage();
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

  const maybePromptBiometricEnrollment = useCallback(async () => {
    if (await hasBeenAskedAboutBiometric()) return;
    if (!(await isBiometricAvailable())) return;

    await markBiometricAsked();
    Alert.alert(t("biometric.promptTitle"), t("biometric.promptMessage"), [
      { text: t("biometric.later"), style: "cancel" },
      {
        text: t("biometric.enable"),
        onPress: async () => {
          const ok = await authenticateWithBiometrics(t("biometric.authPrompt"));
          if (ok) await setBiometricEnabled(true);
        },
      },
    ]);
  }, [t]);

  const login = useCallback(
    async (
      email: string,
      password: string,
      keepSignedIn: boolean
    ): Promise<LoginResult> => {
      const result = await api.login(email, password);
      if ("requires2FA" in result && result.requires2FA) {
        return { requires2FA: true, userId: result.userId };
      }
      const { token, user: loggedUser } = result as {
        token: string;
        user: ApiUser;
      };
      await saveSession(token, loggedUser, keepSignedIn);
      markJustAuthenticated();
      setUser(loggedUser);
      registerForPushNotifications().catch(() => {});
      maybePromptBiometricEnrollment().catch(() => {});
      return { requires2FA: false };
    },
    [maybePromptBiometricEnrollment]
  );

  const verify2FA = useCallback(
    async (
      userId: string,
      code: string,
      remember: boolean,
      keepSignedIn: boolean
    ) => {
      const { token, user: loggedUser, deviceToken } = await api.verify2FA(
        userId,
        code,
        remember
      );
      await saveSession(token, loggedUser, keepSignedIn);
      if (deviceToken) await saveDeviceToken(deviceToken);
      markJustAuthenticated();
      setUser(loggedUser);
      registerForPushNotifications().catch(() => {});
      maybePromptBiometricEnrollment().catch(() => {});
    },
    [maybePromptBiometricEnrollment]
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
