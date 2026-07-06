import React from "react";
import { ActivityIndicator, StyleSheet, Text, View } from "react-native";
import { Logo } from "../components/Logo";
import { colors } from "../theme/colors";

export function SplashScreen() {
  return (
    <View style={styles.container}>
      <Logo size={88} />
      <Text style={styles.title}>Cabinet Samet</Text>
      <Text style={styles.subtitle}>Comptabilité digitale</Text>
      <ActivityIndicator color={colors.green} style={{ marginTop: 32 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.navy,
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    marginTop: 20,
    fontSize: 24,
    fontWeight: "800",
    color: colors.white,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 14,
    color: colors.green,
    fontWeight: "600",
    letterSpacing: 1,
    textTransform: "uppercase",
  },
});
