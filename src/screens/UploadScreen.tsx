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
import * as ImagePicker from "expo-image-picker";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useNavigation } from "@react-navigation/native";
import type { BottomTabNavigationProp } from "@react-navigation/bottom-tabs";
import type { AppTabsParamList } from "../navigation/AppTabs";
import { ScreenHeader } from "../components/ScreenHeader";
import { Button } from "../components/Button";
import { colors, documentTypeLabels } from "../theme/colors";
import { api } from "../api/client";

type PickedFile = { uri: string; name: string; type: string };

const TYPES = Object.keys(documentTypeLabels);

export function UploadScreen() {
  const navigation =
    useNavigation<BottomTabNavigationProp<AppTabsParamList>>();
  const [file, setFile] = useState<PickedFile | null>(null);
  const [docType, setDocType] = useState("AUTRE");
  const [showCamera, setShowCamera] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const cameraRef = React.useRef<CameraView>(null);

  async function pickFromGallery() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert("Permission requise", "Autorisez l'accès à vos photos.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      setFile({
        uri: asset.uri,
        name: asset.fileName ?? `document-${Date.now()}.jpg`,
        type: asset.mimeType ?? "image/jpeg",
      });
    }
  }

  async function openCamera() {
    if (!cameraPermission?.granted) {
      const res = await requestCameraPermission();
      if (!res.granted) {
        Alert.alert("Permission requise", "Autorisez l'accès à la caméra.");
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
      Alert.alert("Envoyé", "Votre document a bien été déposé.");
      setFile(null);
      navigation.navigate("Dashboard");
    } catch (e) {
      Alert.alert(
        "Erreur",
        e instanceof Error ? e.message : "Échec de l'envoi du document."
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
            <Text style={styles.cameraCancel}>Annuler</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.shutter} onPress={takePhoto} />
          <View style={{ width: 60 }} />
        </View>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex} contentContainerStyle={{ paddingBottom: 40 }}>
      <ScreenHeader
        title="Déposer un document"
        subtitle="Prenez une photo ou choisissez un fichier dans votre galerie."
      />

      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionCard} onPress={openCamera}>
          <Text style={styles.actionIcon}>📷</Text>
          <Text style={styles.actionLabel}>Prendre une photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionCard} onPress={pickFromGallery}>
          <Text style={styles.actionIcon}>🖼️</Text>
          <Text style={styles.actionLabel}>Choisir un fichier</Text>
        </TouchableOpacity>
      </View>

      {file && (
        <View style={styles.previewCard}>
          <Image source={{ uri: file.uri }} style={styles.preview} />
          <Text style={styles.fileName} numberOfLines={1}>
            {file.name}
          </Text>
        </View>
      )}

      <Text style={styles.label}>Type de document</Text>
      <View style={styles.typeRow}>
        {TYPES.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => setDocType(t)}
            style={[styles.typeChip, docType === t && styles.typeChipActive]}
          >
            <Text
              style={[
                styles.typeChipText,
                docType === t && styles.typeChipTextActive,
              ]}
            >
              {documentTypeLabels[t]}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <Button
        title="Envoyer le document"
        onPress={handleUpload}
        loading={uploading}
        disabled={!file}
        style={{ marginHorizontal: 20, marginTop: 24 }}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.background },
  actions: {
    flexDirection: "row",
    gap: 12,
    paddingHorizontal: 20,
  },
  actionCard: {
    flex: 1,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 24,
    alignItems: "center",
  },
  actionIcon: { fontSize: 28, marginBottom: 8 },
  actionLabel: { fontSize: 13, fontWeight: "600", color: colors.navy },
  previewCard: {
    margin: 20,
    backgroundColor: colors.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    padding: 12,
  },
  preview: {
    width: "100%",
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    backgroundColor: colors.border,
  },
  fileName: { fontSize: 13, color: colors.textMuted },
  label: {
    fontSize: 13,
    fontWeight: "600",
    color: colors.navy,
    marginHorizontal: 20,
    marginTop: 12,
    marginBottom: 8,
  },
  typeRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
  },
  typeChip: {
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 999,
    paddingHorizontal: 14,
    paddingVertical: 8,
    backgroundColor: colors.white,
  },
  typeChipActive: {
    backgroundColor: colors.green,
    borderColor: colors.green,
  },
  typeChipText: { fontSize: 13, color: colors.navy, fontWeight: "600" },
  typeChipTextActive: { color: colors.navy },
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
