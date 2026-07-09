import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { I18nManager } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Lang, translations } from "./translations";

const LANGUAGE_KEY = "cabinet-samet:language";

function isRTLLang(lang: Lang) {
  return lang === "ar";
}

type LanguageContextValue = {
  lang: Lang;
  isRTL: boolean;
  /** Renvoie true si le changement de langue nécessite un redémarrage complet
   * de l'app pour appliquer la direction RTL (bascule ar <-> fr/en). */
  setLang: (lang: Lang) => Promise<boolean>;
  t: (key: string, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  useEffect(() => {
    AsyncStorage.getItem(LANGUAGE_KEY).then((stored) => {
      if (stored === "fr" || stored === "en" || stored === "ar") {
        setLangState(stored);
      }
    });
  }, []);

  const setLang = useCallback(async (next: Lang) => {
    await AsyncStorage.setItem(LANGUAGE_KEY, next);
    setLangState(next);

    const wantsRTL = isRTLLang(next);
    if (I18nManager.isRTL !== wantsRTL) {
      I18nManager.allowRTL(wantsRTL);
      I18nManager.forceRTL(wantsRTL);
      // Ne PAS appeler DevSettings.reload() ici : le rechargement JS
      // immédiatement après un changement de I18nManager.forceRTL provoque
      // une race condition sur le registre des modules natifs côté Expo Go
      // ("Cannot find native module 'ExpoAsset'"). La mise en page RTL ne
      // sera donc complète qu'après un redémarrage manuel de l'app — on le
      // signale à l'appelant pour qu'il prévienne l'utilisateur.
      return true;
    }
    return false;
  }, []);

  const t = useCallback(
    (key: string, params?: Record<string, string>) => {
      let text = translations[lang][key] ?? translations.fr[key] ?? key;
      if (params) {
        for (const [k, v] of Object.entries(params)) {
          text = text.replace(`{${k}}`, v);
        }
      }
      return text;
    },
    [lang]
  );

  return (
    <LanguageContext.Provider
      value={{ lang, isRTL: I18nManager.isRTL, setLang, t }}
    >
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error("useLanguage doit être utilisé dans LanguageProvider");
  return ctx;
}
