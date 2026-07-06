import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { statusLabels, statusStyles } from "../theme/colors";

export function StatusBadge({ status }: { status: string }) {
  const style = statusStyles[status] ?? statusStyles.EN_ATTENTE;
  return (
    <View style={[styles.badge, { backgroundColor: style.bg }]}>
      <Text style={[styles.text, { color: style.text }]}>
        {statusLabels[status] ?? status}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 999,
  },
  text: {
    fontSize: 12,
    fontWeight: "700",
  },
});
