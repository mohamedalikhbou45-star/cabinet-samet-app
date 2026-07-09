import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";

export function StatusBadge({ status }: { status: string }) {
  const t = useTheme();
  const { t: tr } = useLanguage();
  const style =
    status === "EN_ATTENTE"
      ? { bg: t.warningBg, text: t.isDark ? "#fbbf24" : "#92400e" }
      : status === "EN_TRAITEMENT"
        ? { bg: t.infoBg, text: t.isDark ? "#60a5fa" : "#1e40af" }
        : { bg: t.successBg, text: t.isDark ? "#34d399" : "#065f46" };

  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>
        {tr(`status.${status}`)}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 999,
  },
  text: {
    fontSize: 12.5,
    fontWeight: "800",
  },
});
