import React from "react";
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  ViewStyle,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { colors, shadow } from "../theme/colors";

type Props = {
  title: string;
  onPress: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "danger";
  size?: "md" | "lg";
  style?: ViewStyle;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  size = "md",
  style,
}: Props) {
  const isOutline = variant === "outline";
  const isDanger = variant === "danger";
  const isLarge = size === "lg";
  const isDisabled = disabled || loading;

  if (variant === "primary") {
    return (
      <TouchableOpacity
        onPress={onPress}
        disabled={isDisabled}
        activeOpacity={0.85}
        style={[
          styles.gradientWrap,
          isLarge && styles.large,
          !isDisabled && shadow.card,
          isDisabled && styles.disabled,
          style,
        ]}
      >
        <LinearGradient
          colors={[colors.green, colors.greenHover]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[styles.gradient, isLarge && styles.gradientLarge]}
        >
          {loading ? (
            <ActivityIndicator color={colors.navy} />
          ) : (
            <Text style={[styles.text, isLarge && styles.largeText]}>
              {title}
            </Text>
          )}
        </LinearGradient>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={isDisabled}
      activeOpacity={0.85}
      style={[
        styles.base,
        isLarge && styles.large,
        isOutline && styles.outline,
        isDanger && styles.danger,
        isDisabled && styles.disabled,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={isDanger ? colors.white : colors.navy} />
      ) : (
        <Text
          style={[
            styles.text,
            isLarge && styles.largeText,
            isOutline && styles.outlineText,
            isDanger && styles.dangerText,
          ]}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientWrap: {
    borderRadius: 12,
    overflow: "hidden",
  },
  gradient: {
    paddingVertical: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  gradientLarge: {
    paddingVertical: 19,
  },
  large: {
    borderRadius: 14,
  },
  outline: {
    backgroundColor: "transparent",
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  danger: {
    backgroundColor: colors.danger,
  },
  disabled: {
    opacity: 0.55,
  },
  text: {
    color: colors.navy,
    fontWeight: "800",
    fontSize: 16,
  },
  largeText: {
    fontSize: 17,
  },
  outlineText: {
    color: colors.green,
  },
  dangerText: {
    color: colors.white,
  },
});
