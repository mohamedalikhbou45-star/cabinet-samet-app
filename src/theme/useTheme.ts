import { useColorScheme } from "react-native";
import { colors } from "./colors";

const lightNeutrals = {
  background: colors.background,
  card: colors.white,
  text: colors.ink,
  textMuted: colors.textMuted,
  border: colors.border,
};

const darkNeutrals = {
  background: "#0b0f16",
  card: "#171c26",
  text: "#f2f4f7",
  textMuted: "#9aa4b2",
  border: "#2a2f3b",
};

export function useTheme() {
  const scheme = useColorScheme();
  const isDark = scheme === "dark";
  const neutrals = isDark ? darkNeutrals : lightNeutrals;

  return {
    isDark,
    green: colors.green,
    greenHover: colors.greenHover,
    navy: colors.navy,
    navySoft: colors.navySoft,
    danger: colors.danger,
    warning: colors.warning,
    warningBg: isDark ? "#3a2c0f" : colors.warningBg,
    info: colors.info,
    infoBg: isDark ? "#152238" : colors.infoBg,
    success: colors.success,
    successBg: isDark ? "#0f2b20" : colors.successBg,
    ...neutrals,
  };
}
