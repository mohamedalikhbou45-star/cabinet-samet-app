import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { api } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { colors, shadow } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

export function ForgotPasswordScreen() {
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit() {
    setError(null);
    if (!email.trim()) {
      setError(t("forgotPassword.errorMissing"));
      return;
    }
    setLoading(true);
    try {
      await api.forgotPassword(email.trim());
      setSent(true);
    } catch (e) {
      setError(
        e instanceof Error ? e.message : t("forgotPassword.errorGeneric")
      );
    } finally {
      setLoading(false);
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
            <AnimatedLogo />
            <Text style={styles.title}>{t("forgotPassword.title")}</Text>
            <Text style={styles.subtitle}>{t("forgotPassword.subtitle")}</Text>
          </View>

          <View style={styles.card}>
            {sent ? (
              <View>
                <Text style={styles.confirmIcon}>📩</Text>
                <Text style={styles.confirmTitle}>
                  {t("forgotPassword.sentTitle")}
                </Text>
                <Text style={styles.confirmBody}>
                  {t("forgotPassword.sentBody", { email: email.trim() })}
                </Text>
                <Button
                  title={t("forgotPassword.backToLogin")}
                  onPress={() => navigation.navigate("Login")}
                  size="lg"
                  style={{ marginTop: 20 }}
                />
              </View>
            ) : (
              <View>
                {error && <Text style={styles.error}>{error}</Text>}
                <TextField
                  label={t("forgotPassword.emailLabel")}
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <Button
                  title={t("forgotPassword.submit")}
                  onPress={handleSubmit}
                  loading={loading}
                  size="lg"
                />
              </View>
            )}
          </View>

          <Text style={styles.footer}>
            <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
              {t("forgotPassword.backLink")}
            </Text>
          </Text>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.navy },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    marginTop: 18,
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 6,
    fontSize: 14,
    color: "#c9d3e0",
    textAlign: "center",
    paddingHorizontal: 12,
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
  confirmIcon: { fontSize: 40, textAlign: "center", marginBottom: 12 },
  confirmTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: colors.navy,
    textAlign: "center",
  },
  confirmBody: {
    marginTop: 8,
    fontSize: 14,
    color: "#6b7280",
    textAlign: "center",
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    fontSize: 14,
  },
  link: { color: colors.green, fontWeight: "700" },
});
