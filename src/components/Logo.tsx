import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { colors } from "../theme/colors";

export function Logo({ size = 56 }: { size?: number }) {
  return (
    <View
      style={[
        styles.box,
        { width: size, height: size, borderRadius: size * 0.22 },
      ]}
    >
      <Text style={[styles.text, { fontSize: size * 0.38 }]}>CS</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  box: {
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  text: {
    color: colors.navy,
    fontWeight: "800",
  },
});
