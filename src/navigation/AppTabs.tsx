import React, { useState } from "react";
import { View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { DashboardScreen } from "../screens/DashboardScreen";
import { UploadScreen } from "../screens/UploadScreen";
import { HistoryScreen } from "../screens/HistoryScreen";
import { MessagesScreen } from "../screens/MessagesScreen";
import { ProfileScreen } from "../screens/ProfileScreen";
import { Chatbot } from "../components/Chatbot";
import { CustomTabBar } from "./CustomTabBar";

export type AppTabsParamList = {
  Dashboard: undefined;
  Upload: undefined;
  History: undefined;
  Messages: undefined;
  Profile: undefined;
};

const Tab = createBottomTabNavigator<AppTabsParamList>();

export function AppTabs() {
  const [activeTab, setActiveTab] = useState<keyof AppTabsParamList>("Dashboard");

  return (
    <View style={{ flex: 1 }}>
      <Tab.Navigator
        screenOptions={{ headerShown: false }}
        tabBar={(props) => <CustomTabBar {...props} />}
        screenListeners={{
          state: (e) => {
            const state = e.data.state as {
              index: number;
              routeNames: (keyof AppTabsParamList)[];
            };
            setActiveTab(state.routeNames[state.index]);
          },
        }}
      >
        <Tab.Screen name="Dashboard" component={DashboardScreen} />
        <Tab.Screen name="Upload" component={UploadScreen} />
        <Tab.Screen name="History" component={HistoryScreen} />
        <Tab.Screen name="Messages" component={MessagesScreen} />
        <Tab.Screen name="Profile" component={ProfileScreen} />
      </Tab.Navigator>
      {activeTab !== "Messages" && <Chatbot />}
    </View>
  );
}
