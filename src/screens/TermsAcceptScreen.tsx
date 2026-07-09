import React, { useState } from "react";
import { Alert, ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useRoute } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import type { RouteProp } from "@react-navigation/native";
import { AnimatedLogo } from "../components/AnimatedLogo";
import { Checkbox } from "../components/Checkbox";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { markTermsAccepted } from "../lib/terms";
import { useLanguage } from "../i18n/LanguageContext";
import { colors, shadow } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

type TermsRouteProp = RouteProp<AuthStackParamList, "TermsAccept">;

export function TermsAcceptScreen() {
  const { login } = useAuth();
  const { t } = useLanguage();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const { params } = useRoute<TermsRouteProp>();
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptedPrivacy, setAcceptedPrivacy] = useState(false);
  const [loading, setLoading] = useState(false);

  const canContinue = acceptedTerms && acceptedPrivacy;

  async function handleContinue() {
    if (!canContinue) return;
    setLoading(true);
    try {
      await markTermsAccepted();
      await login(params.email, params.password);
    } catch (e) {
      Alert.alert(
        t("changePassword.errorTitle"),
        e instanceof Error ? e.message : t("termsAccept.errorGeneric")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={styles.flex}>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <AnimatedLogo size={48} />
          <Text style={styles.title}>{t("termsAccept.title")}</Text>
          <Text style={styles.subtitle}>{t("termsAccept.subtitle")}</Text>
        </View>

        <View style={styles.card}>
          <Checkbox checked={acceptedTerms} onPress={() => setAcceptedTerms((v) => !v)}>
            <Text style={styles.checkboxLabel}>
              {t("termsAccept.acceptTerms")}{" "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("TermsText")}
              >
                {t("termsAccept.termsLink")}
              </Text>
            </Text>
          </Checkbox>

          <Checkbox
            checked={acceptedPrivacy}
            onPress={() => setAcceptedPrivacy((v) => !v)}
          >
            <Text style={styles.checkboxLabel}>
              {t("termsAccept.acceptPrivacy")}{" "}
              <Text
                style={styles.link}
                onPress={() => navigation.navigate("PrivacyText")}
              >
                {t("termsAccept.privacyLink")}
              </Text>
            </Text>
          </Checkbox>

          <Button
            title={t("termsAccept.continue")}
            onPress={handleContinue}
            loading={loading}
            disabled={!canContinue}
            size="lg"
            style={{ marginTop: 8 }}
          />
        </View>
      </ScrollView>
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
  checkboxLabel: { fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  link: { color: colors.green, fontWeight: "700", textDecorationLine: "underline" },
});
