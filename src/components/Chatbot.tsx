import React, { useEffect, useRef, useState } from "react";
import {
  Animated,
  FlatList,
  KeyboardAvoidingView,
  Linking,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { colors, shadow } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";
import { getDemoResponseKey } from "../lib/chatbot";

const CABINET_EMAIL = "contact@cabinet-samet.fr";

type ChatMessage = { id: string; role: "bot" | "user"; text: string };

function uid() {
  return Math.random().toString(36).slice(2);
}

function TypingDots() {
  const values = useRef([
    new Animated.Value(0.3),
    new Animated.Value(0.3),
    new Animated.Value(0.3),
  ]).current;

  useEffect(() => {
    const anims = values.map((v, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 150),
          Animated.timing(v, {
            toValue: 1,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(v, {
            toValue: 0.3,
            duration: 350,
            useNativeDriver: true,
          }),
        ])
      )
    );
    anims.forEach((a) => a.start());
    return () => anims.forEach((a) => a.stop());
  }, [values]);

  return (
    <View style={styles.typingRow}>
      {values.map((v, i) => (
        <Animated.View
          key={i}
          style={[styles.typingDot, { opacity: v }]}
        />
      ))}
    </View>
  );
}

function PulseRing() {
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    const anim = Animated.loop(
      Animated.parallel([
        Animated.timing(scale, {
          toValue: 1.6,
          duration: 1400,
          useNativeDriver: true,
        }),
        Animated.timing(opacity, {
          toValue: 0,
          duration: 1400,
          useNativeDriver: true,
        }),
      ])
    );
    anim.start();
    return () => {
      anim.stop();
      scale.setValue(1);
      opacity.setValue(0.5);
    };
  }, [scale, opacity]);

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        styles.pulseRing,
        { transform: [{ scale }], opacity },
      ]}
    />
  );
}

export function Chatbot() {
  const t = useTheme();
  const { t: tr, lang } = useLanguage();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const listRef = useRef<FlatList>(null);

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages([{ id: uid(), role: "bot", text: tr("chatbot.greeting") }]);
    }
  }, [open, messages.length, tr]);

  function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setMessages((prev) => [...prev, { id: uid(), role: "user", text }]);
    setInput("");
    setTyping(true);

    // Mode démo : réponse locale préprogrammée. À remplacer par un appel
    // API (Claude) une fois ANTHROPIC_API_KEY configurée côté serveur.
    setTimeout(() => {
      const reply = tr(getDemoResponseKey(text, lang));
      setMessages((prev) => [...prev, { id: uid(), role: "bot", text: reply }]);
      setTyping(false);
      setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
    }, 600);

    setTimeout(() => listRef.current?.scrollToEnd({ animated: true }), 50);
  }

  return (
    <>
      <View style={styles.fabWrap}>
        <PulseRing />
        <TouchableOpacity
          style={[styles.fab, shadow.floating]}
          onPress={() => setOpen(true)}
          activeOpacity={0.85}
        >
          <Text style={styles.fabIcon}>💬</Text>
        </TouchableOpacity>
      </View>

      <Modal
        visible={open}
        transparent
        animationType="slide"
        onRequestClose={() => setOpen(false)}
      >
        <View style={styles.backdrop}>
          <TouchableOpacity
            style={StyleSheet.absoluteFill}
            activeOpacity={1}
            onPress={() => setOpen(false)}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.sheetWrap}
          >
            <View style={[styles.sheet, { backgroundColor: t.card }]}>
              <View style={[styles.header, { backgroundColor: t.navy }]}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>CS</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.headerTitle}>
                    {tr("chatbot.headerTitle")}
                  </Text>
                  <View style={styles.demoRow}>
                    <View style={styles.demoDot} />
                    <Text style={styles.demoText}>{tr("chatbot.demoMode")}</Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={() => setOpen(false)}
                  accessibilityLabel={tr("chatbot.headerTitle")}
                  style={styles.closeBtn}
                >
                  <Text style={styles.closeText}>✕</Text>
                </TouchableOpacity>
              </View>

              <FlatList
                ref={listRef}
                data={messages}
                keyExtractor={(m) => m.id}
                style={[styles.list, { backgroundColor: t.background }]}
                contentContainerStyle={{ padding: 16 }}
                onContentSizeChange={() =>
                  listRef.current?.scrollToEnd({ animated: true })
                }
                renderItem={({ item }) => (
                  <View
                    style={[
                      styles.bubbleRow,
                      item.role === "user" && styles.bubbleRowUser,
                    ]}
                  >
                    <View
                      style={[
                        styles.bubble,
                        item.role === "user"
                          ? styles.bubbleUser
                          : [
                              styles.bubbleBot,
                              { backgroundColor: t.card, borderColor: t.border },
                            ],
                      ]}
                    >
                      <Text
                        style={[
                          styles.bubbleText,
                          { color: t.text },
                          item.role === "user" && styles.bubbleTextUser,
                        ]}
                      >
                        {item.text}
                      </Text>
                    </View>
                  </View>
                )}
                ListFooterComponent={
                  typing ? (
                    <View style={styles.bubbleRow}>
                      <View
                        style={[
                          styles.bubble,
                          styles.bubbleBot,
                          { backgroundColor: t.card, borderColor: t.border },
                        ]}
                      >
                        <TypingDots />
                      </View>
                    </View>
                  ) : null
                }
              />

              <TouchableOpacity
                style={styles.cta}
                onPress={() => Linking.openURL(`mailto:${CABINET_EMAIL}`)}
              >
                <Text style={styles.ctaIcon}>📞</Text>
                <Text style={styles.ctaText}>{tr("chatbot.contactAccountant")}</Text>
              </TouchableOpacity>

              <View style={styles.inputRow}>
                <TextInput
                  style={[
                    styles.input,
                    { backgroundColor: t.card, borderColor: t.border, color: t.text },
                  ]}
                  placeholder={tr("chatbot.placeholder")}
                  placeholderTextColor={t.textMuted}
                  value={input}
                  onChangeText={setInput}
                  onSubmitEditing={sendMessage}
                  returnKeyType="send"
                />
                <TouchableOpacity
                  style={styles.sendBtn}
                  onPress={sendMessage}
                  accessibilityLabel={tr("common.send")}
                >
                  <Text style={styles.sendIcon}>➤</Text>
                </TouchableOpacity>
              </View>

              <View style={[styles.disclaimer, { backgroundColor: t.warningBg }]}>
                <Text style={styles.disclaimerText}>
                  {tr("chatbot.disclaimer")}
                </Text>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  fabWrap: {
    position: "absolute",
    bottom: 90,
    right: 20,
    width: 60,
    height: 60,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 999,
    elevation: 999,
  },
  pulseRing: {
    position: "absolute",
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.green,
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  fabIcon: { fontSize: 26 },
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11,37,69,0.45)",
    justifyContent: "flex-end",
  },
  sheetWrap: { width: "100%" },
  sheet: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    height: "78%",
    overflow: "hidden",
    ...shadow.floating,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 16,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  avatarText: { fontSize: 14, fontWeight: "800", color: colors.navy },
  headerTitle: { fontSize: 16, fontWeight: "800", color: colors.white },
  demoRow: { flexDirection: "row", alignItems: "center", marginTop: 4 },
  demoDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.green,
    marginRight: 6,
  },
  demoText: { fontSize: 12, color: "#c9d3e0", fontWeight: "700" },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(255,255,255,0.12)",
  },
  closeText: { color: colors.white, fontSize: 15, fontWeight: "700" },
  list: { flex: 1, backgroundColor: colors.background },
  bubbleRow: { marginBottom: 10, alignItems: "flex-start" },
  bubbleRowUser: { alignItems: "flex-end" },
  bubble: {
    maxWidth: "82%",
    paddingHorizontal: 14,
    paddingVertical: 11,
    borderRadius: 16,
  },
  bubbleBot: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderBottomLeftRadius: 4,
  },
  bubbleUser: {
    backgroundColor: colors.green,
    borderBottomRightRadius: 4,
  },
  bubbleText: { fontSize: 14.5, color: colors.ink, lineHeight: 20 },
  bubbleTextUser: { color: colors.navy, fontWeight: "600" },
  typingRow: { flexDirection: "row", gap: 4, paddingVertical: 2 },
  typingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: colors.textMuted,
  },
  cta: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 16,
    marginTop: 10,
    paddingVertical: 11,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: colors.green,
  },
  ctaIcon: { fontSize: 15, marginRight: 8 },
  ctaText: { fontSize: 14, fontWeight: "700", color: colors.navy },
  inputRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 10,
  },
  input: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: 14.5,
    color: colors.ink,
    backgroundColor: colors.white,
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
  },
  sendIcon: { fontSize: 16, color: colors.navy },
  disclaimer: {
    backgroundColor: colors.warningBg,
    paddingVertical: 8,
    paddingHorizontal: 16,
    marginTop: 12,
  },
  disclaimerText: {
    fontSize: 11.5,
    color: "#92400e",
    fontWeight: "700",
    textAlign: "center",
  },
});
