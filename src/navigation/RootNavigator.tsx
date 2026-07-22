import React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { useAuth } from "../context/AuthContext";
import { SplashScreen } from "../screens/SplashScreen";
import { AuthStack } from "./AuthStack";
import { AppStack } from "./AppStack";
import { BiometricGate } from "../components/BiometricGate";

export function RootNavigator() {
  const { user, loading } = useAuth();

  if (loading) return <SplashScreen />;

  return (
    <NavigationContainer>
      {user ? (
        <BiometricGate>
          <AppStack />
        </BiometricGate>
      ) : (
        <AuthStack />
      )}
    </NavigationContainer>
  );
}
