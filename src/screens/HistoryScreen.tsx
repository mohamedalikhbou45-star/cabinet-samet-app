import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { api, DocumentDto } from "../api/client";
import { ScreenHeader } from "../components/ScreenHeader";
import { StatusBadge } from "../components/StatusBadge";
import { radius, shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";

function formatBytes(bytes: number) {
  if (bytes === 0) return "0 o";
  const units = ["o", "Ko", "Mo", "Go"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
}

export function HistoryScreen() {
  const t = useTheme();
  const { t: tr } = useLanguage();
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
    <SafeAreaView
      style={[styles.flex, { backgroundColor: t.background }]}
      edges={["top"]}
    >
    <FlatList
      style={styles.flex}
      data={documents}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
          tintColor={t.green}
        />
      }
      ListHeaderComponent={
        <ScreenHeader
          title={tr("history.title")}
          subtitle={tr("history.subtitle")}
        />
      }
      renderItem={({ item }) => (
        <View style={[styles.row, { backgroundColor: t.card }]}>
          <View style={styles.iconWrap}>
            <Text style={styles.icon}>📄</Text>
          </View>
          <View style={styles.info}>
            <Text style={[styles.name, { color: t.text }]} numberOfLines={1}>
              {item.originalName}
            </Text>
            <Text style={[styles.meta, { color: t.textMuted }]}>
              {tr(`documentType.${item.type}`)} ·{" "}
              {formatBytes(item.size)} ·{" "}
              {new Date(item.createdAt).toLocaleDateString("fr-FR")}
            </Text>
            {item.note && (
              <Text style={[styles.note, { color: t.navy }]}>
                {tr("history.note")}{item.note}
              </Text>
            )}
          </View>
          <StatusBadge status={item.status} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: t.textMuted }]}>
          {tr("history.empty")}
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing,
    marginBottom: 10,
    padding: 16,
    borderRadius: radius,
    ...shadow.card,
  },
  iconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: "#eaf6d3",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  icon: { fontSize: 20 },
  info: { flex: 1, marginRight: 12 },
  name: { fontSize: 15, fontWeight: "700" },
  meta: { fontSize: 12.5, marginTop: 3 },
  note: { fontSize: 12.5, marginTop: 4, fontStyle: "italic" },
  empty: {
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: spacing,
    fontSize: 15,
  },
});
