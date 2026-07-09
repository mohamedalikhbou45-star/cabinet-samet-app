import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { AppTabs } from "./AppTabs";
import { ChangePasswordScreen } from "../screens/ChangePasswordScreen";
import { TermsTextScreen } from "../screens/TermsTextScreen";
import { PrivacyTextScreen } from "../screens/PrivacyTextScreen";

export type AppStackParamList = {
  Tabs: undefined;
  ChangePassword: undefined;
  TermsText: undefined;
  PrivacyText: undefined;
};

const Stack = createNativeStackNavigator<AppStackParamList>();

export function AppStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Tabs" component={AppTabs} />
      <Stack.Screen
        name="ChangePassword"
        component={ChangePasswordScreen}
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="TermsText"
        component={TermsTextScreen}
        options={{ headerShown: true, title: "" }}
      />
      <Stack.Screen
        name="PrivacyText"
        component={PrivacyTextScreen}
        options={{ headerShown: true, title: "" }}
      />
    </Stack.Navigator>
  );
}
