import React from "react";
import { StyleSheet, Text, View } from "react-native";
import { ScreenHeader } from "../components/ScreenHeader";
import { Button } from "../components/Button";
import { Logo } from "../components/Logo";
import { colors } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

export function ProfileScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.flex}>
      <ScreenHeader title="Profil" subtitle="Vos informations de compte." />

      <View style={styles.card}>
        <View style={styles.identity}>
          <Logo size={48} />
          <View style={{ marginLeft: 14 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        {user?.company && (
          <View style={styles.row}>
            <Text style={styles.label}>Société</Text>
            <Text style={styles.value}>{user.company}</Text>
          </View>
        )}
        <View style={styles.row}>
          <Text style={styles.label}>Rôle</Text>
          <Text style={styles.value}>
            {user?.role === "ADMIN" ? "Administrateur" : "Client"}
          </Text>
        </View>
      </View>

      <Button
        title="Se déconnecter"
        variant="outline"
        onPress={logout}
        style={{ marginHorizontal: 20, marginTop: 24 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  card: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 20,
  },
  identity: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  name: { fontSize: 17, fontWeight: "700", color: colors.navy },
  email: { fontSize: 13, color: colors.textMuted, marginTop: 2 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  label: { fontSize: 13, color: colors.textMuted },
  value: { fontSize: 13, fontWeight: "600", color: colors.ink },
});
