import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { useTheme } from "../theme/useTheme";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  const t = useTheme();
  return (
    <View style={styles.wrapper}>
      <Text style={[styles.title, { color: t.text }]}>{title}</Text>
      {subtitle && (
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          {subtitle}
        </Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 20 },
  title: { fontSize: 28, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 6, fontSize: 15 },
});
