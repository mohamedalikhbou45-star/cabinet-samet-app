import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api, DocumentDto } from "../api/client";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatusBadge } from "../components/StatusBadge";
import { colors, documentTypeLabels } from "../theme/colors";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function HistoryScreen() {
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.documents();
      setDocuments(data.documents);
    } catch {
      // silencieux
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

  return (
    <FlatList
      style={styles.flex}
      data={documents}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <ScreenHeader
          title="Historique"
          subtitle="Tous vos documents déposés et leur statut."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <View style={styles.info}>
            <Text style={styles.name} numberOfLines={1}>
              {item.originalName}
            </Text>
            <Text style={styles.meta}>
              {documentTypeLabels[item.type] ?? item.type} ·{" "}
              {formatBytes(item.size)} ·{" "}
              {new Date(item.createdAt).toLocaleDateString("fr-FR")}
            </Text>
            {item.note && <Text style={styles.note}>Note : {item.note}</Text>}
          </View>
          <StatusBadge status={item.status} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Aucun document déposé pour le moment.</Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  row: {
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
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 14, fontWeight: "600", color: colors.ink },
  meta: { fontSize: 12, color: colors.textMuted, marginTop: 2 },
  note: { fontSize: 12, color: colors.navy, marginTop: 4, fontStyle: "italic" },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 20,
    marginHorizontal: 20,
  },
});
