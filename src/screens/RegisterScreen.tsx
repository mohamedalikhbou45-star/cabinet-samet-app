import React, { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { Logo } from "../components/Logo";
import { TextField } from "../components/TextField";
import { Button } from "../components/Button";
import { useAuth } from "../context/AuthContext";
import { api } from "../api/client";
import { colors } from "../theme/colors";
import type { AuthStackParamList } from "../navigation/AuthStack";

export function RegisterScreen() {
  const { login } = useAuth();
  const navigation =
    useNavigation<NativeStackNavigationProp<AuthStackParamList>>();
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleSubmit() {
    setError(null);
    if (!name || !email || !password) {
      setError("Merci de renseigner tous les champs requis.");
      return;
    }
    setLoading(true);
    try {
      await api.register({ name, email, company, password });
      await login(email, password);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Échec de l'inscription.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Logo />
          <Text style={styles.title}>Créer un compte</Text>
        </View>

        <View style={styles.card}>
          {error && <Text style={styles.error}>{error}</Text>}

          <TextField label="Nom complet" value={name} onChangeText={setName} />
          <TextField
            label="Société (optionnel)"
            value={company}
            onChangeText={setCompany}
          />
          <TextField
            label="Adresse email"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
          />
          <TextField
            label="Mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />

          <Button title="Créer mon compte" onPress={handleSubmit} loading={loading} />
        </View>

        <Text style={styles.footer}>
          Déjà un compte ?{" "}
          <Text style={styles.link} onPress={() => navigation.navigate("Login")}>
            Se connecter
          </Text>
        </Text>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.navy },
  container: { flexGrow: 1, padding: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  title: {
    marginTop: 16,
    fontSize: 22,
    fontWeight: "800",
    color: colors.white,
  },
  card: { backgroundColor: colors.white, borderRadius: 16, padding: 24 },
  error: {
    color: colors.danger,
    marginBottom: 12,
    fontSize: 13,
    fontWeight: "600",
  },
  footer: {
    textAlign: "center",
    marginTop: 24,
    color: "#c9d3e0",
    fontSize: 14,
  },
  link: { color: colors.green, fontWeight: "700" },
});
