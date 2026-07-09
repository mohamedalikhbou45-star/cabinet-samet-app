import React, { useRef, useState } from "react";
import {
  Animated,
  StyleSheet,
  TextInput,
  TextInputProps,
  View,
} from "react-native";
import { colors } from "../theme/colors";

type Props = TextInputProps & {
  label: string;
};

export function TextField({ label, style, value, onFocus, onBlur, ...props }: Props) {
  const [focused, setFocused] = useState(false);
  const anim = useRef(new Animated.Value(value ? 1 : 0)).current;

  function animateTo(toValue: number) {
    Animated.timing(anim, {
      toValue,
      duration: 160,
      useNativeDriver: false,
    }).start();
  }

  const floated = focused || !!value;

  return (
    <View style={styles.wrapper}>
      <Animated.Text
        pointerEvents="none"
        style={[
          styles.label,
          {
            top: anim.interpolate({ inputRange: [0, 1], outputRange: [18, 6] }),
            fontSize: anim.interpolate({ inputRange: [0, 1], outputRange: [16, 12.5] }),
            color: focused ? colors.green : colors.textMuted,
          },
        ]}
      >
        {label}
      </Animated.Text>
      <TextInput
        value={value}
        style={[styles.input, floated && styles.inputFloated, style]}
        placeholderTextColor={colors.textMuted}
        onFocus={(e) => {
          setFocused(true);
          animateTo(1);
          onFocus?.(e);
        }}
        onBlur={(e) => {
          setFocused(false);
          if (!value) animateTo(0);
          onBlur?.(e);
        }}
        {...props}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { marginBottom: 18 },
  label: {
    position: "absolute",
    left: 16,
    fontWeight: "700",
    zIndex: 1,
  },
  input: {
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingTop: 18,
    paddingBottom: 10,
    fontSize: 16,
    backgroundColor: colors.white,
    color: colors.ink,
  },
  inputFloated: {
    borderColor: colors.green,
  },
});
