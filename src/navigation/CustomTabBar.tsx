import React, { useEffect, useRef } from "react";
import { Animated, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";

const ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "home",
  Upload: "add-circle",
  History: "folder-open",
  Messages: "chatbubble-ellipses",
  Profile: "person-circle",
};

const OUTLINE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  Dashboard: "home-outline",
  Upload: "add-circle-outline",
  History: "folder-open-outline",
  Messages: "chatbubble-ellipses-outline",
  Profile: "person-circle-outline",
};

export const TAB_BAR_BASE_HEIGHT = 58;

const LABEL_KEYS: Record<string, string> = {
  Dashboard: "tabs.home",
  Upload: "tabs.upload",
  History: "tabs.history",
  Messages: "tabs.messages",
  Profile: "tabs.profile",
};

function TabIcon({ name, focused, color }: { name: string; focused: boolean; color: string }) {
  const scale = useRef(new Animated.Value(focused ? 1 : 0.9)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: focused ? 1 : 0.9,
      useNativeDriver: true,
      friction: 6,
      tension: 140,
    }).start();
  }, [focused, scale]);

  return (
    <Animated.View style={{ transform: [{ scale }] }}>
      <Ionicons
        name={focused ? ICONS[name] : OUTLINE_ICONS[name]}
        size={25}
        color={color}
      />
    </Animated.View>
  );
}

export function CustomTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const t = useTheme();
  const { t: tr, isRTL } = useLanguage();

  return (
    <View
      style={[
        styles.bar,
        isRTL && styles.barRTL,
        {
          backgroundColor: t.card,
          borderTopColor: t.border,
          paddingBottom: Math.max(insets.bottom, 10),
          height: TAB_BAR_BASE_HEIGHT + Math.max(insets.bottom, 10),
        },
      ]}
    >
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const focused = state.index === index;
        const color = focused ? t.green : t.textMuted;

        function onPress() {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });
          if (!focused && !event.defaultPrevented) {
            navigation.navigate(route.name);
          }
        }

        return (
          <TouchableOpacity
            key={route.key}
            onPress={onPress}
            style={styles.tab}
            activeOpacity={0.7}
          >
            <TabIcon name={route.name} focused={focused} color={color} />
            <Text
              style={[
                styles.label,
                { color },
                focused && styles.labelFocused,
              ]}
              numberOfLines={1}
            >
              {LABEL_KEYS[route.name] ? tr(LABEL_KEYS[route.name]) : options.title ?? route.name}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: "row",
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 8,
  },
  barRTL: { flexDirection: "row-reverse" },
  tab: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
  },
  label: {
    fontSize: 11,
    fontWeight: "600",
  },
  labelFocused: {
    fontWeight: "800",
  },
});
