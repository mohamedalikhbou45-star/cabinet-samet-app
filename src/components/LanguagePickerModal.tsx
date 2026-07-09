import React from "react";
import { Alert, Modal, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { LANGUAGES } from "../i18n/translations";
import { useLanguage } from "../i18n/LanguageContext";
import { useTheme } from "../theme/useTheme";
import { shadow } from "../theme/colors";

export function LanguagePickerModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const { lang, setLang, t } = useLanguage();
  const theme = useTheme();

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <TouchableOpacity
        style={styles.backdrop}
        activeOpacity={1}
        onPress={onClose}
      >
        <View style={[styles.sheet, { backgroundColor: theme.card }, shadow.floating]}>
          <Text style={[styles.title, { color: theme.text }]}>
            {t("profile.languagePickerTitle")}
          </Text>
          {LANGUAGES.map((l) => (
            <TouchableOpacity
              key={l.code}
              style={[
                styles.option,
                { borderColor: theme.border },
                lang === l.code && { borderColor: theme.green, backgroundColor: theme.background },
              ]}
              onPress={async () => {
                const needsRestart = await setLang(l.code);
                onClose();
                if (needsRestart) {
                  Alert.alert(
                    t("profile.rtlRestartTitle"),
                    t("profile.rtlRestartBody")
                  );
                }
              }}
            >
              <Text style={styles.flag}>{l.flag}</Text>
              <Text style={[styles.label, { color: theme.text }]}>{l.label}</Text>
              {lang === l.code && (
                <Text style={[styles.check, { color: theme.green }]}>✓</Text>
              )}
            </TouchableOpacity>
          ))}
        </View>
      </TouchableOpacity>
    </Modal>
  );
}

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(11,37,69,0.45)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  sheet: {
    width: "100%",
    borderRadius: 20,
    padding: 20,
  },
  title: { fontSize: 17, fontWeight: "800", marginBottom: 14, textAlign: "center" },
  option: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1.5,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  flag: { fontSize: 22, marginRight: 12 },
  label: { flex: 1, fontSize: 15, fontWeight: "700" },
  check: { fontSize: 17, fontWeight: "800" },
});
