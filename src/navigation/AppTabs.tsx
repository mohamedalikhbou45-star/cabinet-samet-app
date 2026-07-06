import React from "react";
import { Text } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/DashboardScreen";
import { UploadScreen } from "../screens/UploadScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { colors } from "../theme/colors";

export type AppTabsParamList = {
  Dashboard: undefined;
  Upload: undefined;
  History: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

const ICONS: Record<keyof AppTabsParamList, string> = {
  Dashboard: "🏠",
  Upload: "➕",
  History: "🗂️",
  Messages: "💬",
  Profile: "👤",
};

const LABELS: Record<keyof AppTabsParamList, string> = {
  Dashboard: "Accueil",
  Upload: "Déposer",
  History: "Historique",
  Messages: "Messages",
  Profile: "Profil",
};

export function AppTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: colors.green,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarIcon: () => (
          <Text style={{ fontSize: 18 }}>
            {ICONS[route.name as keyof AppTabsParamList]}
          </Text>
        ),
        tabBarLabel: LABELS[route.name as keyof AppTabsParamList],
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Upload" component={UploadScreen} />
      <Tab.Screen name="History" component={HistoryScreen} />
      <Tab.Screen name="Messages" component={MessagesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}
