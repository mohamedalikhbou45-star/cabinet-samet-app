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
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { hasAcceptedTerms } from "../lib/terms";
import { useLanguage } from "../i18n/LanguageContext";
import { colors, shadow } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

export function RegisterScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!name || !email || !password) {
      setError(t("register.errorMissing"));
      return;
    }
    setLoading(true);
    try {
      await api.register({ name, email, company, password });
      if (await hasAcceptedTerms()) {
        await login(email, password);
      } else {
        navigation.navigate("TermsAccept", { name, email, password });
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : t("register.errorGeneric"));
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
          <Text style={styles.title}>{t("register.title")}</Text>
        </View>

        <View style={styles.card}>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextField
            label={t("register.nameLabel")}
            value={name}
            onChangeText={setName}
          />
          <TextField
            label={t("register.companyLabel")}
            value={company}
            onChangeText={setCompany}
          />
          <TextField
            label={t("register.emailLabel")}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label={t("register.passwordLabel")}
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button
            title={t("register.submit")}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
          />
        </View>

        <Text style={styles.footer}>
          {t("register.hasAccount")}{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            {t("register.login")}
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
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#c9d3e0",
    fontSize: 14,
  },
  link: { color: colors.green, fontWeight: "700" },
});
