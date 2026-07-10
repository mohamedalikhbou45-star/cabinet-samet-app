import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { LoginScreen } from "../screens/LoginScreen";
import { RegisterScreen } from "../screens/RegisterScreen";
import { ForgotPasswordScreen } from "../screens/ForgotPasswordScreen";
import { TermsAcceptScreen } from "../screens/TermsAcceptScreen";
import { TermsTextScreen } from "../screens/TermsTextScreen";
import { PrivacyTextScreen } from "../screens/PrivacyTextScreen";
import { Verify2FAScreen } from "../screens/Verify2FAScreen";

export type AuthStackParamList = {
  Login: undefined;
  Register: undefined;
  ForgotPassword: undefined;
  TermsAccept: { name: string; email: string; password: string };
  TermsText: undefined;
  PrivacyText: undefined;
  Verify2FA: { userId: string; email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export function AuthStack() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Register" component={RegisterScreen} />
      <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
      <Stack.Screen name="TermsAccept" component={TermsAcceptScreen} />
      <Stack.Screen name="Verify2FA" component={Verify2FAScreen} />
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
