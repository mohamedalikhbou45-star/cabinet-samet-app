import AsyncStorage from "@react-native-async-storage/async-storage";

const TERMS_ACCEPTED_KEY = "cabinet-samet:termsAccepted";

export async function hasAcceptedTerms() {
  return (await AsyncStorage.getItem(TERMS_ACCEPTED_KEY)) === "true";
}

export async function markTermsAccepted() {
  await AsyncStorage.setItem(TERMS_ACCEPTED_KEY, "true");
}
