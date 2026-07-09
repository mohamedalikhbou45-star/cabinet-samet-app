import React, { useCallback, useState } from "react";
import {
  FlatList,
  RefreshControl,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../navigation/AppTabs";
import { api, DocumentDto, MessageDto } from "../api/client";
import { StatusBadge } from "../components/StatusBadge";
import { radius, shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";

type Stats = {
  total: number;
  enAttente: number;
  enTraitement: number;
  traite: number;
};

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

export function DashboardScreen() {
  const { user } = useAuth();
  const t = useTheme();
  const { t: tr } = useLanguage();
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
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
        { label: tr("dashboard.statTotal"), value: stats.total, dot: t.navy },
        { label: tr("dashboard.statPending"), value: stats.enAttente, dot: t.warning },
        { label: tr("dashboard.statProcessing"), value: stats.enTraitement, dot: t.info },
        { label: tr("dashboard.statDone"), value: stats.traite, dot: t.success },
      ]
    : [];

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
        <View>
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={[styles.greeting, { color: t.text }]}>
                {tr("dashboard.greeting", { name: user?.name?.split(" ")[0] ?? "" })}
              </Text>
              <Text style={[styles.subtitle, { color: t.textMuted }]}>
                {tr("dashboard.subtitle")}
              </Text>
            </View>
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate("Profile")}
              style={[styles.avatar, { backgroundColor: t.green }]}
            >
              <Text style={[styles.avatarText, { color: t.navy }]}>
                {initials(user?.name)}
              </Text>
            </TouchableOpacity>
          </View>

          {messages.length > 0 && (
            <TouchableOpacity
              activeOpacity={0.75}
              onPress={() => navigation.navigate("Messages")}
              style={[styles.messagesCard, { backgroundColor: t.card }]}
            >
              <View style={styles.messagesCardHeader}>
                <Text style={[styles.sectionTitleInline, { color: t.text }]}>
                  💬 {tr("dashboard.recentMessages")}
                </Text>
                <Text style={[styles.messagesCardChevron, { color: t.textMuted }]}>
                  ›
                </Text>
              </View>
              {messages.map((m) => (
                <View
                  key={m.id}
                  style={[styles.messageRow, { borderTopColor: t.border }]}
                >
                  <Text style={[styles.messageBody, { color: t.text }]}>
                    <Text
                      style={[
                        styles.messagePrefix,
                        { color: m.sender === "CLIENT" ? t.textMuted : t.green },
                      ]}
                    >
                      {m.sender === "CLIENT"
                        ? tr("messages.mePrefix")
                        : tr("messages.csPrefix")}
                    </Text>
                    {m.body}
                  </Text>
                </View>
              ))}
            </TouchableOpacity>
          )}

          <View style={styles.grid}>
            {cards.map((c) => (
              <View
                key={c.label}
                style={[styles.card, { backgroundColor: t.card }]}
              >
                <View style={styles.cardTop}>
                  <View style={[styles.dot, { backgroundColor: c.dot }]} />
                  <Text style={[styles.cardLabel, { color: t.textMuted }]}>
                    {c.label}
                  </Text>
                </View>
                <Text style={[styles.cardValue, { color: t.text }]}>
                  {c.value}
                </Text>
              </View>
            ))}
          </View>

          <Text style={[styles.sectionTitle, { color: t.text }]}>
            {tr("dashboard.recentDocuments")}
          </Text>
        </View>
      }
      renderItem={({ item }) => (
        <View style={[styles.docRow, { backgroundColor: t.card }]}>
          <View style={styles.docInfo}>
            <Text
              style={[styles.docName, { color: t.text }]}
              numberOfLines={1}
            >
              {item.originalName}
            </Text>
            <Text style={[styles.docMeta, { color: t.textMuted }]}>
              {tr(`documentType.${item.type}`)} ·{" "}
              {new Date(item.createdAt).toLocaleDateString("fr-FR")}
            </Text>
          </View>
          <StatusBadge status={item.status} />
        </View>
      )}
      ListEmptyComponent={
        <Text style={[styles.empty, { color: t.textMuted }]}>
          {tr("dashboard.empty")}
        </Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: spacing,
    paddingTop: 16,
    paddingBottom: 20,
  },
  greeting: { fontSize: 26, fontWeight: "800", letterSpacing: -0.4 },
  subtitle: { marginTop: 6, fontSize: 14.5 },
  avatar: {
    width: 48,
    height: 48,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    marginLeft: 12,
    ...shadow.card,
  },
  avatarText: { fontSize: 17, fontWeight: "800" },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    paddingHorizontal: spacing,
    gap: 12,
    marginBottom: 12,
  },
  card: {
    borderRadius: radius,
    padding: 18,
    width: "47%",
    ...shadow.card,
  },
  cardTop: { flexDirection: "row", alignItems: "center", marginBottom: 10 },
  dot: { width: 8, height: 8, borderRadius: 4, marginRight: 6 },
  cardValue: { fontSize: 32, fontWeight: "800" },
  cardLabel: { fontSize: 13, fontWeight: "600" },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "800",
    marginHorizontal: spacing,
    marginTop: 24,
    marginBottom: 12,
  },
  messagesCardHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  sectionTitleInline: {
    fontSize: 16,
    fontWeight: "800",
    marginBottom: 6,
  },
  messagesCardChevron: {
    fontSize: 22,
    fontWeight: "700",
  },
  messagesCard: {
    marginHorizontal: spacing,
    marginBottom: 16,
    borderRadius: radius,
    padding: 18,
    ...shadow.card,
  },
  messageRow: { paddingVertical: 8, borderTopWidth: StyleSheet.hairlineWidth },
  messageBody: { fontSize: 14.5, lineHeight: 20 },
  messagePrefix: { fontWeight: "800" },
  docRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginHorizontal: spacing,
    marginBottom: 10,
    padding: 16,
    borderRadius: 14,
    ...shadow.card,
  },
  docInfo: { flex: 1, marginRight: 12 },
  docName: { fontSize: 15, fontWeight: "700" },
  docMeta: { fontSize: 12.5, marginTop: 3 },
  empty: {
    textAlign: "center",
    marginTop: 20,
    marginHorizontal: spacing,
    fontSize: 15,
  },
});
