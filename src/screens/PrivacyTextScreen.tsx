import React from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { ScreenHeader } from "../components/ScreenHeader";
import { useLanguage } from "../i18n/LanguageContext";
import { spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";

export function PrivacyTextScreen() {
  const t = useTheme();
  const { t: tr } = useLanguage();

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <ScreenHeader title={tr("privacyText.title")} />
      <ScrollView contentContainerStyle={styles.content}>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Text style={[styles.paragraph, { color: t.text }]}>
            {tr("privacyText.p1")}
          </Text>
          <Text style={[styles.paragraph, { color: t.text }]}>
            {tr("privacyText.p2")}
          </Text>
          <Text style={[styles.paragraph, { color: t.text }]}>
            {tr("privacyText.p3")}
          </Text>
          <Text style={[styles.paragraph, { color: t.text }]}>
            {tr("privacyText.p4")}
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing, paddingBottom: 40 },
  card: { borderRadius: 16, padding: 20 },
  paragraph: { fontSize: 14.5, lineHeight: 22, marginBottom: 16 },
});
