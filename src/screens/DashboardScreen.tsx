import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api, DocumentDto, MessageDto } from "../api/client";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatusBadge } from "../components/StatusBadge";
import { colors, documentTypeLabels } from "../theme/colors";
import { useAuth } from "../context/AuthContext";

type Stats = {
  total: number;
  enAttente: number;
  enTraitement: number;
  traite: number;
};

export function DashboardScreen() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.dashboard();
      setStats(data.stats);
      setDocuments(data.recentDocuments);
      setMessages(data.recentMessages);
    } catch {
      // silencieux : l'utilisateur peut tirer pour rafraîchir
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  async function onRefresh() {
    setRefreshing(true);
    await load();
    setRefreshing(false);
  }

  const cards = stats
    ? [
        { label: "Documents déposés", value: stats.total },
        { label: "En attente", value: stats.enAttente },
        { label: "En traitement", value: stats.enTraitement },
        { label: "Traités", value: stats.traite },
      ]
    : [];

  return (
    <FlatList
      style={styles.flex}
      data={documents}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <View>
          <ScreenHeader
            title={`Bonjour ${user?.name?.split(" ")[0] ?? ""}`}
            subtitle="Vue d'ensemble de vos documents comptables."
          />

          {messages.length > 0 && (
            <View style={styles.messagesCard}>
              <Text style={styles.sectionTitle}>Messages du cabinet</Text>
              {messages.map((m) => (
                <View key={m.id} style={styles.messageRow}>
                  <Text style={styles.messageBody}>{m.body}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={styles.grid}>
            {cards.map((c) => (
              <View key={c.label} style={styles.card}>
                <Text style={styles.cardValue}>{c.value}</Text>
                <Text style={styles.cardLabel}>{c.label}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.sectionTitle}>Documents récents</Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={styles.docRow}>
          <View style={styles.docInfo}>
            <Text style={styles.docName} numberOfLines={1}>
              {item.originalName}
            </Text>
            <Text style={styles.docMeta}>
              {documentTypeLabels[item.type] ?? item.type} ·{" "}
              {new Date(item.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>
          Vous n'avez encore déposé aucun document.
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: 16,
    gap: 12,
    marginBottom: 8,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    padding: 16,
    width: "47%",
    borderWidth: 1,
    borderColor: colors.border,
  },
  cardValue: { fontSize: 28, fontWeight: "800", color: colors.navy },
  cardLabel: { marginTop: 4, fontSize: 13, color: colors.textMuted },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: colors.navy,
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 8,
  },
  messagesCard: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: colors.border,
  },
  messageRow: { paddingVertical: 6 },
  messageBody: { fontSize: 14, color: colors.ink },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  docInfo: { flex: 1, marginRight: 12 },
  docName: { fontSize: 14, fontWeight: "600", color: colors.ink },
  docMeta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 20,
    marginHorizontal: 20,
  },
});
