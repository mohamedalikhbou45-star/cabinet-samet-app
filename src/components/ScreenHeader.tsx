import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function ScreenHeader({
  title,
  subtitle,
}: {
  title: string;
  subtitle?: string;
}) {
  return (
    <View style={styles.wrapper}>
      <Text style={styles.title}>{title}</Text>
      {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { paddingHorizontal: 20, paddingTop: 12, paddingBottom: 16 },
  title: { fontSize: 24, fontWeight: "800", color: colors.navy },
  subtitle: { marginTop: 4, fontSize: 14, color: colors.textMuted },
});
