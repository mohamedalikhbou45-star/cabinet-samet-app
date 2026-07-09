import React, { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";
import Constants from "expo-constants";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { ScreenHeader } from "../components/ScreenHeader";
import { Button } from "../components/Button";
import { LanguagePickerModal } from "../components/LanguagePickerModal";
import { api, DocumentDto } from "../api/client";
import { radius, shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useAuth } from "../context/AuthContext";
import { useLanguage } from "../i18n/LanguageContext";
import { LANGUAGES } from "../i18n/translations";
import type { AppTabsParamList } from "../navigation/AppTabs";
import type { AppStackParamList } from "../navigation/AppStack";

const NOTIFICATIONS_KEY = "cabinet-samet:notificationsEnabled";
const AVATAR_COLORS = ["#86BC25", "#2563eb", "#dc2626", "#7c3aed", "#0891b2", "#ea580c"];

function initials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join("");
}

function avatarColorFor(id?: string) {
  if (!id) return AVATAR_COLORS[0];
  const hash = [...id].reduce((acc, c) => acc + c.charCodeAt(0), 0);
  return AVATAR_COLORS[hash % AVATAR_COLORS.length];
}

function SectionTitle({ children, color }: { children: string; color: string }) {
  return <Text style={[styles.sectionTitle, { color }]}>{children}</Text>;
}

function Row({
  icon,
  label,
  value,
  onPress,
  danger,
  isFirst,
  borderColor,
  textColor,
  mutedColor,
  right,
}: {
  icon?: string;
  label: string;
  value?: string;
  onPress?: () => void;
  danger?: boolean;
  isFirst?: boolean;
  borderColor: string;
  textColor: string;
  mutedColor: string;
  right?: React.ReactNode;
}) {
  const Wrapper = onPress ? TouchableOpacity : View;
  return (
    <Wrapper
      onPress={onPress}
      activeOpacity={0.7}
      style={[
        styles.row,
        !isFirst && { borderTopWidth: StyleSheet.hairlineWidth, borderTopColor: borderColor },
      ]}
    >
      {icon && <Text style={styles.rowIcon}>{icon}</Text>}
      <Text
        style={[
          styles.rowLabel,
          { color: danger ? "#dc2626" : textColor, marginLeft: icon ? 10 : 0 },
        ]}
      >
        {label}
      </Text>
      {right}
      {value !== undefined && (
        <Text style={[styles.rowValue, { color: mutedColor }]} numberOfLines={1}>
          {value}
        </Text>
      )}
      {onPress && !right && <Text style={[styles.chevron, { color: mutedColor }]}>›</Text>}
    </Wrapper>
  );
}

export function ProfileScreen() {
  const { user, logout } = useAuth();
  const t = useTheme();
  const { t: tr, lang } = useLanguage();
  const tabNavigation =
    useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const stackNavigation =
    tabNavigation.getParent<NativeStackNavigationProp<AppStackParamList>>();

  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [documents, setDocuments] = useState<DocumentDto[]>([]);
  const [langPickerOpen, setLangPickerOpen] = useState(false);

  useEffect(() => {
    AsyncStorage.getItem(NOTIFICATIONS_KEY).then((v) => {
      if (v !== null) setNotificationsEnabled(v === "true");
    });
  }, []);

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

  async function toggleNotifications(value: boolean) {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem(NOTIFICATIONS_KEY, String(value));
  }

  const lastDocument = documents[0];
  const avatarColor = avatarColorFor(user?.id);
  const appVersion = Constants.expoConfig?.version ?? "1.0.0";

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: t.background }]}
      edges={["top"]}
    >
      <ScrollView
        style={styles.flex}
        contentContainerStyle={{ paddingBottom: 40 }}
      >
        <ScreenHeader title={tr("profile.title")} subtitle={tr("profile.subtitle")} />

        <View style={styles.avatarSection}>
          <View style={[styles.avatarBig, { backgroundColor: avatarColor }]}>
            <Text style={styles.avatarBigText}>{initials(user?.name)}</Text>
          </View>
          <Text style={[styles.name, { color: t.text }]}>{user?.name}</Text>
          <Text style={[styles.email, { color: t.textMuted }]}>{user?.email}</Text>
          <View
            style={[
              styles.roleBadge,
              { backgroundColor: user?.role === "ADMIN" ? t.navy : "#eaf6d3" },
            ]}
          >
            <Text
              style={[
                styles.roleBadgeText,
                { color: user?.role === "ADMIN" ? "#fff" : "#3f5e0f" },
              ]}
            >
              {user?.role === "ADMIN" ? tr("profile.roleAdmin") : tr("profile.roleClient")}
            </Text>
          </View>
        </View>

        <SectionTitle color={t.textMuted}>{tr("profile.sectionAccount")}</SectionTitle>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          {user?.company && (
            <Row
              isFirst
              icon="🏢"
              label={tr("profile.company")}
              value={user.company}
              borderColor={t.border}
              textColor={t.text}
              mutedColor={t.textMuted}
            />
          )}
          <Row
            isFirst={!user?.company}
            icon="🔒"
            label={tr("profile.changePassword")}
            onPress={() => stackNavigation?.navigate("ChangePassword")}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
          <Row
            icon="🔔"
            label={tr("profile.notifications")}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
            right={
              <Switch
                value={notificationsEnabled}
                onValueChange={toggleNotifications}
                trackColor={{ true: t.green }}
              />
            }
          />
          <Row
            icon="🌐"
            label={tr("profile.language")}
            value={`${LANGUAGES.find((l) => l.code === lang)?.flag} ${LANGUAGES.find((l) => l.code === lang)?.label}`}
            onPress={() => setLangPickerOpen(true)}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
        </View>

        <SectionTitle color={t.textMuted}>{tr("profile.sectionDocuments")}</SectionTitle>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Row
            isFirst
            icon="🗂️"
            label={tr("profile.totalDocuments")}
            value={String(documents.length)}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
          <Row
            icon="📄"
            label={tr("profile.lastDocument")}
            value={
              lastDocument
                ? `${tr(`documentType.${lastDocument.type}`)} · ${new Date(
                    lastDocument.createdAt
                  ).toLocaleDateString("fr-FR")}`
                : tr("profile.none")
            }
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
        </View>

        <SectionTitle color={t.textMuted}>{tr("profile.sectionSupport")}</SectionTitle>
        <View style={[styles.card, { backgroundColor: t.card }]}>
          <Row
            isFirst
            icon="📞"
            label={tr("profile.contactCabinet")}
            onPress={() => tabNavigation.navigate("Messages")}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
          <Row
            icon="📃"
            label={tr("profile.terms")}
            onPress={() => stackNavigation?.navigate("TermsText")}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
          <Row
            icon="🛡️"
            label={tr("profile.privacy")}
            onPress={() => stackNavigation?.navigate("PrivacyText")}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
          <Row
            icon="ℹ️"
            label={tr("profile.appVersion")}
            value={appVersion}
            borderColor={t.border}
            textColor={t.text}
            mutedColor={t.textMuted}
          />
        </View>

        <Button
          title={tr("profile.logout")}
          variant="danger"
          onPress={logout}
          size="lg"
          style={styles.logout}
        />
      </ScrollView>

      <LanguagePickerModal
        visible={langPickerOpen}
        onClose={() => setLangPickerOpen(false)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  avatarSection: { alignItems: "center", marginBottom: 24 },
  avatarBig: {
    width: 92,
    height: 92,
    borderRadius: 28,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 14,
    ...shadow.floating,
  },
  avatarBigText: { fontSize: 32, fontWeight: "800", color: "#fff" },
  name: { fontSize: 19, fontWeight: "800" },
  email: { fontSize: 14, marginTop: 3 },
  roleBadge: {
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 999,
  },
  roleBadgeText: { fontSize: 12, fontWeight: "800" },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "800",
    letterSpacing: 0.6,
    marginHorizontal: spacing + 4,
    marginBottom: 8,
    marginTop: 8,
  },
  card: {
    marginHorizontal: spacing,
    marginBottom: 20,
    borderRadius: radius,
    paddingHorizontal: 16,
    ...shadow.card,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 14,
  },
  rowIcon: { fontSize: 17 },
  rowLabel: { flex: 1, fontSize: 14.5, fontWeight: "600" },
  rowValue: { fontSize: 13.5, marginLeft: 8, maxWidth: 140 },
  chevron: { fontSize: 20, marginLeft: 6, fontWeight: "700" },
  logout: { marginHorizontal: spacing, marginTop: 8 },
});
