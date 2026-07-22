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
import { Checkbox } from "../components/Checkbox";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { colors, shadow } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

export function LoginScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [keepSignedIn, setKeepSignedIn] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!email || !password) {
      setError(t("login.errorMissing"));
      return;
    }
    setLoading(true);
    try {
      const result = await login(email, password, keepSignedIn);
      if (result.requires2FA) {
        navigation.navigate("Verify2FA", {
          userId: result.userId,
          email,
          keepSignedIn,
        });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("login.errorGeneric"));
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
          <Text style={styles.title}>{t("login.headerTitle")}</Text>
          <Text style={styles.subtitle}>{t("login.headerSubtitle")}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>{t("login.cardTitle")}</Text>

          {error && <Text style={styles.error}>{error}</Text>}

          <TextField
            label={t("login.emailLabel")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label={t("login.passwordLabel")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Checkbox
            checked={keepSignedIn}
            onPress={() => setKeepSignedIn((v) => !v)}
          >
            <Text style={styles.checkboxLabel}>{t("login.keepSignedIn")}</Text>
          </Checkbox>

          <Button
            title={t("login.submit")}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />

          <Text
            style={styles.forgotLink}
            onPress={() => navigation.navigate("ForgotPassword")}
          >
            {t("login.forgot")}
          </Text>
        </View>

        <Text style={styles.footer}>
          {t("login.noAccount")}{" "}
          <Text
            style={styles.link}
            onPress={() => navigation.navigate("Register")}
          >
            {t("login.createAccount")}
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
  header: { alignItems: "center", marginBottom: 36 },
  title: {
    marginTop: 18,
    fontSize: 26,
    fontWeight: "800",
    color: colors.white,
    letterSpacing: -0.4,
  },
  subtitle: { marginTop: 4, fontSize: 14, color: colors.green, fontWeight: "700" },
  card: {
    backgroundColor: colors.white,
    borderRadius: 20,
    padding: 26,
    ...shadow.floating,
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: "800",
    color: colors.navy,
    marginBottom: 20,
  },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  checkboxLabel: { fontSize: 13.5, color: colors.ink },
  forgotLink: {
    textAlign: "center",
    marginTop: 16,
    fontSize: 13.5,
    fontWeight: "700",
    color: colors.navy,
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#c9d3e0",
    fontSize: 14,
  },
  link: { color: colors.green, fontWeight: "700" },
});
