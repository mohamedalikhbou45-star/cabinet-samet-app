import React, { useCallback, useState } from "react";
import { FlatList, RefreshControl, StyleSheet, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { api, MessageDto } from "../api/client";
import { ScreenHeader } from "../components/ScreenHeader";
import { colors } from "../theme/colors";

export function MessagesScreen() {
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      const data = await api.messages();
      setMessages(data.messages);
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
      data={messages}
      keyExtractor={(item) => item.id}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      ListHeaderComponent={
        <ScreenHeader
          title="Messages"
          subtitle="Échanges avec votre cabinet comptable."
        />
      }
      renderItem={({ item }) => (
        <View style={styles.row}>
          <Text style={styles.body}>{item.body}</Text>
          <Text style={styles.date}>
            {new Date(item.createdAt).toLocaleString("fr-FR")}
          </Text>
        </View>
      )}
      ListEmptyComponent={
        <Text style={styles.empty}>Aucun message pour le moment.</Text>
      }
      contentContainerStyle={{ paddingBottom: 40 }}
    />
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  row: {
    backgroundColor: colors.white,
    marginHorizontal: 20,
    marginBottom: 8,
    padding: 14,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: colors.border,
  },
  body: { fontSize: 14, color: colors.ink },
  date: { fontSize: 12, color: colors.textMuted, marginTop: 6 },
  empty: {
    textAlign: "center",
    color: colors.textMuted,
    marginTop: 20,
    marginHorizontal: 20,
  },
});
