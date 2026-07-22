import React, { useEffect, useRef, useState } from "react";
import { AppState, AppStateStatus, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { AnimatedLogo } from "./AnimatedLogo";
import { Button } from "./Button";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import {
  authenticateWithBiometrics,
  consumeSkipLockCheck,
  isBiometricEnabled,
} from "../lib/biometric";
import { colors, shadow } from "../theme/colors";

const BACKGROUND_LOCK_MS = 5 * 60 * 1000; // 5 minutes

export function BiometricGate({ children }: { children: React.ReactNode }) {
  const { logout } = useAuth();
  const { t } = useLanguage();
  const [ready, setReady] = useState(false);
  const [locked, setLocked] = useState(false);
  const [failed, setFailed] = useState(false);
  const backgroundedAt = useRef<number | null>(null);
  const appState = useRef<AppStateStatus>(AppState.currentState);

  async function attemptUnlock() {
    setFailed(false);
    const ok = await authenticateWithBiometrics(t("biometric.authPrompt"));
    if (ok) {
      setLocked(false);
    } else {
      setFailed(true);
    }
  }

  useEffect(() => {
    (async () => {
      // Une connexion interactive qui vient tout juste d'avoir lieu (login,
      // vérification 2FA) n'a pas besoin d'un verrou Face ID immédiat.
      if (consumeSkipLockCheck()) {
        setReady(true);
        return;
      }

      const enabled = await isBiometricEnabled();
      if (!enabled) {
        setReady(true);
        return;
      }

      setLocked(true);
      setReady(true);
      await attemptUnlock();
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const sub = AppState.addEventListener("change", async (nextState) => {
      const prevState = appState.current;
      appState.current = nextState;

      if (prevState === "active" && nextState.match(/inactive|background/)) {
        backgroundedAt.current = Date.now();
        return;
      }

      if (prevState.match(/inactive|background/) && nextState === "active") {
        const elapsed = backgroundedAt.current
          ? Date.now() - backgroundedAt.current
          : 0;
        backgroundedAt.current = null;

        if (elapsed <= BACKGROUND_LOCK_MS) return;

        const enabled = await isBiometricEnabled();
        if (!enabled) return;

        setLocked(true);
        await attemptUnlock();
      }
    });
    return () => sub.remove();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) return null;
  if (!locked) return <>{children}</>;

  return (
    <SafeAreaView style={styles.flex}>
      <View style={styles.container}>
        <AnimatedLogo size={64} />
        <Text style={styles.title}>{t("lock.title")}</Text>
        <Text style={styles.subtitle}>{t("lock.subtitle")}</Text>

        {failed && <Text style={styles.error}>{t("lock.failed")}</Text>}

        <Button
          title={failed ? t("lock.retry") : t("lock.unlock")}
          onPress={attemptUnlock}
          size="lg"
          style={styles.unlockButton}
        />

        <TouchableOpacity onPress={() => logout()}>
          <Text style={styles.usePassword}>{t("lock.usePassword")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.navy },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 32,
  },
  title: {
    marginTop: 20,
    fontSize: 20,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 14,
    color: "#c9d3e0",
    textAlign: "center",
  },
  error: {
    marginTop: 16,
    fontSize: 13,
    fontWeight: "600",
    color: "#f87171",
  },
  unlockButton: { marginTop: 28, width: "100%", ...shadow.floating },
  usePassword: {
    marginTop: 20,
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.green,
  },
});
