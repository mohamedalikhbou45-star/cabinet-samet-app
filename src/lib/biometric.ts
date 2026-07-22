import AsyncStorage from "@react-native-async-storage/async-storage";
import * as LocalAuthentication from "expo-local-authentication";

const ENABLED_KEY = "cabinet-samet:biometricEnabled";
const ASKED_KEY = "cabinet-samet:biometricAsked";
const KEEP_SIGNED_IN_KEY = "cabinet-samet:keepSignedIn";

export async function isBiometricEnabled() {
  return (await AsyncStorage.getItem(ENABLED_KEY)) === "true";
}

export async function setBiometricEnabled(enabled: boolean) {
  await AsyncStorage.setItem(ENABLED_KEY, String(enabled));
}

export async function hasBeenAskedAboutBiometric() {
  return (await AsyncStorage.getItem(ASKED_KEY)) === "true";
}

export async function markBiometricAsked() {
  await AsyncStorage.setItem(ASKED_KEY, "true");
}

/** Le matériel existe ET au moins une empreinte/visage est enregistré sur l'appareil. */
export async function isBiometricAvailable() {
  const hasHardware = await LocalAuthentication.hasHardwareAsync();
  if (!hasHardware) return false;
  const enrolled = await LocalAuthentication.isEnrolledAsync();
  return enrolled;
}

// Évite de redemander Face ID juste après une connexion interactive (login,
// vérification 2FA) : seule une reprise après mise en arrière-plan ou un
// vrai démarrage à froid doit déclencher le verrou biométrique.
let skipNextLockCheck = false;

export function markJustAuthenticated() {
  skipNextLockCheck = true;
}

export function consumeSkipLockCheck() {
  const value = skipNextLockCheck;
  skipNextLockCheck = false;
  return value;
}

export async function authenticateWithBiometrics(promptMessage: string) {
  const result = await LocalAuthentication.authenticateAsync({
    promptMessage,
    disableDeviceFallback: false,
  });
  return result.success;
}

export async function getKeepSignedIn(): Promise<boolean> {
  const stored = await AsyncStorage.getItem(KEEP_SIGNED_IN_KEY);
  // Coché par défaut tant que l'utilisateur n'a rien choisi explicitement.
  return stored === null ? true : stored === "true";
}

export async function setKeepSignedIn(value: boolean) {
  await AsyncStorage.setItem(KEEP_SIGNED_IN_KEY, String(value));
}
