import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as DocumentPicker from "expo-document-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../navigation/AppTabs";
import { Button } from "../components/Button";
import { colors, radius, shadow, spacing } from "../theme/colors";
import { useTheme } from "../theme/useTheme";
import { useLanguage } from "../i18n/LanguageContext";
import { api } from "../api/client";

type PickedFile = { uri: string; name: string; type: string };

const TYPES = [
  "BANQUE",
  "CAISSE",
  "VENTE",
  "ACHAT",
  "OD_PAIE",
  "OD_FISCALE",
  "OD",
  "AUTRES",
];

export function UploadScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const t = useTheme();
  const { t: tr } = useLanguage();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [docType, setDocType] = useState("AUTRES");
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);

  async function pickFile() {
    // "*/*" ouvre le sélecteur natif iOS complet : Photos, Fichiers
    // (iCloud Drive, Google Drive et autres fournisseurs installés), avec
    // tous les types (PDF, JPG, PNG, XLSX, DOCX, etc.).
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.name,
        type: asset.mimeType ?? "application/octet-stream",
      });
    }
  }

  async function openCamera() {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert(tr("upload.permissionTitle"), tr("upload.permissionCamera"));
        return;
      }
    }
    setShowCamera(true);
  }

  async function takePhoto() {
    const photo = await cameraRef.current?.takePictureAsync({ quality: 0.8 });
    if (photo) {
      setFile({
        uri: photo.uri,
        name: `document-${Date.now()}.jpg`,
        type: "image/jpeg",
      });
      setShowCamera(false);
    }
  }

  async function handleUpload() {
    if (!file) return;
    setUploading(true);
    try {
      await api.uploadDocument(file, docType);
      Alert.alert(tr("upload.sentTitle"), tr("upload.sentBody"));
      setFile(null);
      navigation.navigate("Dashboard");
    } catch (e) {
      Alert.alert(
        tr("upload.errorTitle"),
        e instanceof Error ? e.message : tr("upload.errorGeneric")
      );
    } finally {
      setUploading(false);
    }
  }

  if (showCamera) {
    return (
      <View style={styles.flex}>
        <CameraView ref={cameraRef} style={styles.flex} facing="back" />
        <View style={styles.cameraControls}>
          <TouchableOpacity onPress={() => setShowCamera(false)}>
            <Text style={styles.cameraCancel}>{tr("upload.cancel")}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutter} onPress={takePhoto} />
          <View style={{ width: 60 }} />
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView
      style={[styles.flex, { backgroundColor: t.background }]}
      edges={["top"]}
    >
    <ScrollView
      style={styles.flex}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <View style={styles.hero}>
        <View style={styles.heroIcon}>
          <Text style={styles.heroIconText}>📤</Text>
        </View>
        <Text style={[styles.title, { color: t.text }]}>
          {tr("upload.title")}
        </Text>
        <Text style={[styles.subtitle, { color: t.textMuted }]}>
          {tr("upload.subtitle")}
        </Text>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={[
            styles.actionCard,
            styles.actionCardGreen,
            { backgroundColor: t.card },
          ]}
          onPress={openCamera}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconWrap, styles.actionIconWrapGreen]}>
            <Text style={styles.actionIcon}>📷</Text>
          </View>
          <Text style={[styles.actionLabel, { color: t.text }]}>
            {tr("upload.takePhoto")}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.actionCard,
            styles.actionCardNavy,
            { backgroundColor: t.card },
          ]}
          onPress={pickFile}
          activeOpacity={0.85}
        >
          <View style={[styles.actionIconWrap, styles.actionIconWrapNavy]}>
            <Text style={styles.actionIcon}>📁</Text>
          </View>
          <Text style={[styles.actionLabel, { color: t.text }]}>
            {tr("upload.chooseFile")}
          </Text>
        </TouchableOpacity>
      </View>

      {file && (
        <View style={[styles.previewCard, { backgroundColor: t.card }]}>
          {file.type.startsWith("image/") ? (
            <Image source={{ uri: file.uri }} style={styles.preview} />
          ) : (
            <View style={[styles.filePreview, { backgroundColor: t.background }]}>
              <Text style={styles.filePreviewIcon}>📄</Text>
            </View>
          )}
          <Text style={[styles.fileName, { color: t.textMuted }]} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
      )}

      <Text style={[styles.label, { color: t.text }]}>{tr("upload.typeLabel")}</Text>
      <View style={styles.typeRow}>
        {TYPES.map((docTypeKey) => (
          <TouchableOpacity
            key={docTypeKey}
            onPress={() => setDocType(docTypeKey)}
            style={[
              styles.typeChip,
              { backgroundColor: t.card, borderColor: t.border },
              docType === docTypeKey && styles.typeChipActive,
            ]}
          >
            <Text
              style={[
                styles.typeChipText,
                { color: t.text },
                docType === docTypeKey && styles.typeChipTextActive,
              ]}
            >
              {tr(`documentType.${docTypeKey}`)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title={tr("upload.submit")}
        onPress={handleUpload}
        loading={uploading}
        disabled={!file}
        size="lg"
        style={styles.submit}
      />
    </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: {
    flexGrow: 1,
    justifyContent: "center",
    paddingHorizontal: spacing,
    paddingVertical: 24,
  },
  hero: { alignItems: "center", marginBottom: 24 },
  heroIcon: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: colors.green,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 16,
    ...shadow.floating,
  },
  heroIconText: { fontSize: 40 },
  title: {
    fontSize: 26,
    fontWeight: "800",
    letterSpacing: -0.4,
    textAlign: "center",
  },
  subtitle: {
    marginTop: 8,
    fontSize: 15,
    textAlign: "center",
    paddingHorizontal: 12,
  },
  actions: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 20,
  },
  actionCard: {
    flex: 1,
    borderRadius: radius,
    paddingVertical: 28,
    alignItems: "center",
    ...shadow.card,
  },
  actionCardGreen: {
    borderWidth: 1.5,
    borderColor: "#dbedb8",
  },
  actionCardNavy: {
    borderWidth: 1.5,
    borderColor: "#d7dee8",
  },
  actionIconWrap: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  actionIconWrapGreen: { backgroundColor: "#eaf6d3" },
  actionIconWrapNavy: { backgroundColor: "#e2e8f2" },
  actionIcon: { fontSize: 32 },
  actionLabel: {
    fontSize: 15,
    fontWeight: "700",
    textAlign: "center",
  },
  previewCard: {
    borderRadius: radius,
    padding: 14,
    marginBottom: 20,
    ...shadow.card,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
    marginBottom: 10,
    backgroundColor: colors.border,
  },
  filePreview: {
    width: "100%",
    height: 120,
    borderRadius: 12,
    marginBottom: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  filePreviewIcon: { fontSize: 44 },
  fileName: { fontSize: 13.5, fontWeight: "600" },
  label: {
    fontSize: 14,
    fontWeight: "700",
    marginBottom: 10,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    marginBottom: 28,
  },
  typeChip: {
    borderWidth: 1.5,
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 10,
  },
  typeChipActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  typeChipText: { fontSize: 13.5, fontWeight: "700" },
  typeChipTextActive: { color: colors.navy },
  submit: { ...shadow.floating },
  cameraControls: {
    position: "absolute",
    bottom: 40,
    left: 0,
    right: 0,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 32,
  },
  cameraCancel: { color: colors.white, fontSize: 15, fontWeight: "600" },
  shutter: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: colors.white,
    borderWidth: 4,
    borderColor: colors.green,
  },
});
