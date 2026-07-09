import React, { useState } from "react";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { ScreenHeader } from "../components/ScreenHeader";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { api } from "../api/client";
import { useLanguage } from "../i18n/LanguageContext";
import { shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";

export function ChangePasswordScreen() {
  const t = useTheme();
  const { t: tr } = useLanguage();
  const navigation = useNavigation();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    if (!currentPassword || !newPassword) {
      Alert.alert(
        tr("changePassword.missingFieldsTitle"),
        tr("changePassword.missingFieldsBody")
      );
      return;
    }
    setLoading(true);
    try {
      await api.changePassword(currentPassword, newPassword);
      Alert.alert(
        tr("changePassword.successTitle"),
        tr("changePassword.successBody"),
        [{ text: tr("common.ok"), onPress: () => navigation.goBack() }]
      );
    } catch (e) {
      Alert.alert(
        tr("changePassword.errorTitle"),
        e instanceof Error ? e.message : tr("changePassword.errorGeneric")
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <SafeAreaView style={[styles.flex, { backgroundColor: t.background }]}>
      <ScreenHeader
        title={tr("changePassword.title")}
        subtitle={tr("changePassword.subtitle")}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView contentContainerStyle={styles.content}>
          <TextField
            label={tr("changePassword.currentLabel")}
            value={currentPassword}
            onChangeText={setCurrentPassword}
            secureTextEntry
          />
          <TextField
            label={tr("changePassword.newLabel")}
            value={newPassword}
            onChangeText={setNewPassword}
            secureTextEntry
          />
          <Button
            title={tr("changePassword.submit")}
            onPress={handleSubmit}
            loading={loading}
            size="lg"
            style={{ ...shadow.card, marginTop: 8 }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { paddingHorizontal: spacing, paddingTop: 8 },
});
