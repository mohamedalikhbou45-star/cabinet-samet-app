import React, { useCallback, useRef, useState } from "react";
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";
import { useFocusEffect } from "@react-navigation/native";
import { api, MessageDto } from "../api/client";
import { ScreenHeader } from "../components/ScreenHeader";
import { radius, shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";
import { TAB_BAR_BASE_HEIGHT } from "../navigation/CustomTabBar";

export function MessagesScreen() {
  const t = useTheme();
  const { t: tr } = useLanguage();
  const insets = useSafeAreaInsets();
  const [messages, setMessages] = useState<MessageDto[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const listRef = useRef<FlatList>(null);

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

  async function handleSend() {
    const text = input.trim();
    if (!text) return;
    setInput("");
    setSending(true);
    try {
      const { message } = await api.sendMessage(text);
      setMessages((prev) => [message, ...prev]);
    } catch {
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: t.background }]}
      edges={["top"]}
    >
      <ScreenHeader
        title={tr("messagesScreen.title")}
        subtitle={tr("messagesScreen.subtitle")}
      />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        keyboardVerticalOffset={TAB_BAR_BASE_HEIGHT + insets.bottom}
      >
        <FlatList
          ref={listRef}
          style={styles.flex}
          data={messages}
          inverted
          keyExtractor={(item) => item.id}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              tintColor={t.green}
            />
          }
          renderItem={({ item }) => {
            const isClient = item.sender === "CLIENT";
            return (
              <View
                style={[styles.row, isClient && styles.rowClient]}
              >
                {!isClient && (
                  <View style={[styles.avatar, { backgroundColor: t.green }]}>
                    <Text style={[styles.avatarText, { color: t.navy }]}>
                      CS
                    </Text>
                  </View>
                )}
                <View
                  style={[
                    styles.bubble,
                    isClient
                      ? [styles.bubbleClient, { backgroundColor: t.green }]
                      : [
                          styles.bubbleAdmin,
                          { backgroundColor: t.card, borderColor: t.border },
                        ],
                  ]}
                >
                  <Text
                    style={[
                      styles.body,
                      { color: isClient ? t.navy : t.text },
                    ]}
                  >
                    <Text
                      style={[
                        styles.prefix,
                        { color: isClient ? "#2e3d20" : t.green },
                      ]}
                    >
                      {isClient ? tr("messages.mePrefix") : tr("messages.csPrefix")}
                    </Text>
                    {item.body}
                  </Text>
                  <Text
                    style={[
                      styles.date,
                      { color: isClient ? "#2e3d20" : t.textMuted },
                    ]}
                  >
                    {new Date(item.createdAt).toLocaleString("fr-FR")}
                  </Text>
                </View>
              </View>
            );
          }}
          ListEmptyComponent={
            <Text style={[styles.empty, { color: t.textMuted }]}>
              {tr("messagesScreen.empty")}
            </Text>
          }
          contentContainerStyle={styles.listContent}
        />

        <View
          style={[
            styles.composeRow,
            { backgroundColor: t.card, borderTopColor: t.border },
          ]}
        >
          <TextInput
            style={[
              styles.input,
              { backgroundColor: t.background, borderColor: t.border, color: t.text },
            ]}
            placeholder={tr("messagesScreen.placeholder")}
            placeholderTextColor={t.textMuted}
            value={input}
            onChangeText={setInput}
            onSubmitEditing={handleSend}
            returnKeyType="send"
            multiline
          />
          <TouchableOpacity
            style={[styles.sendBtn, !input.trim() && styles.sendBtnDisabled]}
            onPress={handleSend}
            disabled={!input.trim() || sending}
            accessibilityLabel={tr("common.send")}
          >
            <Text style={styles.sendIcon}>➤</Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  listContent: { paddingHorizontal: spacing, paddingVertical: 12, flexGrow: 1 },
  row: {
    flexDirection: "row",
    alignItems: "flex-end",
    marginBottom: 12,
    maxWidth: "85%",
  },
  rowClient: {
    alignSelf: "flex-end",
    flexDirection: "row-reverse",
  },
  avatar: {
    width: 32,
    height: 32,
    borderRadius: 9,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 8,
    ...shadow.card,
  },
  avatarText: { fontSize: 11.5, fontWeight: "800" },
  bubble: {
    padding: 13,
    borderRadius: radius,
  },
  bubbleAdmin: {
    borderWidth: 1,
    borderTopLeftRadius: 4,
    ...shadow.card,
  },
  bubbleClient: {
    borderTopRightRadius: 4,
    ...shadow.card,
  },
  body: { fontSize: 15, lineHeight: 21 },
  prefix: { fontWeight: "800" },
  date: { fontSize: 11, marginTop: 6 },
  empty: {
    textAlign: "center",
    marginTop: 20,
    fontSize: 15,
    transform: [{ scaleY: -1 }],
  },
  composeRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    paddingHorizontal: spacing,
    paddingVertical: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 15,
    maxHeight: 100,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: "#86BC25",
    alignItems: "center",
    justifyContent: "center",
  },
  sendBtnDisabled: { opacity: 0.4 },
  sendIcon: { fontSize: 16, color: "#1a2744" },
});
