import React, { useEffect, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { Checkbox } from "../components/Checkbox";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { colors, shadow } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

const CODE_LENGTH = 6;
const CODE_DURATION_S = 10 * 60;
const RESEND_COOLDOWN_S = 60;

type Verify2FARouteProp = RouteProp<AuthStackParamList, "Verify2FA">;

function formatTime(totalSeconds: number) {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export function Verify2FAScreen() {
  const { verify2FA } = useAuth();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { params } = useRoute<Verify2FARouteProp>();
  const [digits, setDigits] = useState<string[]>(Array(CODE_LENGTH).fill(""));
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(CODE_DURATION_S);
  const [resendCooldown, setResendCooldown] = useState(RESEND_COOLDOWN_S);
  const inputRefs = useRef<(TextInput | null)[]>([]);

  useEffect(() => {
    if (secondsLeft <= 0) return;
    const id = setInterval(() => setSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [secondsLeft]);

  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setInterval(() => setResendCooldown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [resendCooldown]);

  const expired = secondsLeft <= 0;

  function handleChange(index: number, value: string) {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    if (digit && index < CODE_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  }

  function handleKeyPress(index: number, key: string) {
    if (key === "Backspace" && !digits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  }

  async function handleSubmit() {
    const code = digits.join("");
    if (code.length !== CODE_LENGTH || expired) return;

    setError("");
    setLoading(true);
    try {
      await verify2FA(params.userId, code, remember, params.keepSignedIn);
    } catch (e) {
      const message = e instanceof Error ? e.message : t("verify2fa.errorGeneric");
      setError(message);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setLoading(false);
    }
  }

  async function handleResend() {
    if (resendCooldown > 0) return;
    setError("");
    setResending(true);
    try {
      await api.resend2FA(params.userId);
      setSecondsLeft(CODE_DURATION_S);
      setResendCooldown(RESEND_COOLDOWN_S);
      setDigits(Array(CODE_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("verify2fa.errorResendGeneric"));
    } finally {
      setResending(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.container}>
          <View style={styles.header}>
            <AnimatedLogo size={48} />
            <Text style={styles.title}>{t("verify2fa.title")}</Text>
            <Text style={styles.subtitle}>
              {t("verify2fa.subtitle", { email: params.email })}
            </Text>
          </View>

          <View style={styles.card}>
            {error && <Text style={styles.error}>{error}</Text>}

            <View style={styles.digitsRow}>
              {digits.map((digit, i) => (
                <TextInput
                  key={i}
                  ref={(el) => {
                    inputRefs.current[i] = el;
                  }}
                  value={digit}
                  editable={!expired}
                  onChangeText={(v) => handleChange(i, v)}
                  onKeyPress={(e) => handleKeyPress(i, e.nativeEvent.key)}
                  keyboardType="number-pad"
                  maxLength={1}
                  autoFocus={i === 0}
                  style={[styles.digitInput, expired && styles.digitInputDisabled]}
                />
              ))}
            </View>

            <View style={styles.timerRow}>
              <Text style={[styles.timerText, expired && styles.timerExpired]}>
                {expired
                  ? t("verify2fa.expired")
                  : t("verify2fa.expiresIn", { time: formatTime(secondsLeft) })}
              </Text>
              <TouchableOpacity onPress={handleResend} disabled={resendCooldown > 0 || resending}>
                <Text
                  style={[
                    styles.resendLink,
                    (resendCooldown > 0 || resending) && styles.resendLinkDisabled,
                  ]}
                >
                  {resending
                    ? t("verify2fa.resending")
                    : resendCooldown > 0
                      ? t("verify2fa.resendCooldown", { time: String(resendCooldown) })
                      : t("verify2fa.resend")}
                </Text>
              </TouchableOpacity>
            </View>

            <Checkbox checked={remember} onPress={() => setRemember((v) => !v)}>
              <Text style={styles.rememberLabel}>{t("verify2fa.remember")}</Text>
            </Checkbox>

            <Button
              title={loading ? t("verify2fa.verifying") : t("verify2fa.submit")}
              onPress={handleSubmit}
              loading={loading}
              disabled={expired || digits.join("").length !== CODE_LENGTH}
              size="lg"
              style={{ marginTop: 4 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.navy },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 28 },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#c9d3e0",
    textAlign: "center",
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 26,
    ...shadow.floating,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  digitsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  digitInput: {
    width: 44,
    height: 54,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 10,
    textAlign: "center",
    fontSize: 22,
    fontWeight: "800",
    color: colors.ink,
  },
  digitInputDisabled: {
    backgroundColor: colors.background,
    color: colors.textMuted,
  },
  timerRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 16,
  },
  timerText: { fontSize: 13, color: colors.textMuted },
  timerExpired: { color: colors.danger, fontWeight: "700" },
  resendLink: { fontSize: 13, fontWeight: "700", color: colors.green },
  resendLinkDisabled: { color: colors.textMuted },
  rememberLabel: { fontSize: 13.5, color: colors.ink },
});
