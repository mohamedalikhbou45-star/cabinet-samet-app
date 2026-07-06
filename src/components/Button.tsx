import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { colors } from "../theme/colors";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline";
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  style,
}: Props) {
  const isOutline = variant === "outline";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled || loading}
      activeOpacity={0.8}
      style={[
        styles.base,
        isOutline ? styles.outline : styles.primary,
        (disabled || loading) && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isOutline ? colors.navy : colors.navy} />
      ) : (
        <Text style={[styles.text, isOutline && styles.outlineText]}>
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 8,
    paddingVertical: 14,
    alignItems: "center",
    justifyContent: "center",
  },
  primary: {
    backgroundColor: colors.green,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  disabled: {
    opacity: 0.6,
  },
  text: {
    color: colors.navy,
    fontWeight: "700",
    fontSize: 15,
  },
  outlineText: {
    color: colors.green,
  },
});
