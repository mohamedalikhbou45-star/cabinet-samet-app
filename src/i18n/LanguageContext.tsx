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
  /** true uniquement quand la langue active est l'arabe — dérivé directement
   * de `lang`, jamais du flag natif global I18nManager.isRTL (voir plus bas). */
  isRTL: boolean;
  setLang: (lang: Lang) => Promise<void>;
  t: (key: string, params?: Record<string, string>) => string;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>("fr");

  // I18nManager.forceRTL est un réglage natif GLOBAL et PERSISTANT (il ne
  // s'applique qu'après redémarrage complet de l'app, et reste actif tant
  // qu'un nouveau redémarrage n'a pas eu lieu). L'utiliser pour basculer la
  // direction à chaque changement de langue provoquait ce bug : après être
  // passé en arabe une fois, TOUS les écrans (y compris en français/anglais)
  // restaient mis en miroir tant que l'app n'était pas redémarrée une
  // seconde fois. On ne s'appuie donc plus dessus pour la mise en page :
  // chaque écran qui a besoin d'un miroir RTL lit `isRTL` du contexte
  // (dérivé de la langue courante, réactif immédiatement, sans redémarrage).
  //
  // Si une session précédente avait déjà forcé le RTL natif (avant ce fix),
  // on nettoie ce réglage résiduel une bonne fois pour toutes.
  useEffect(() => {
    if (I18nManager.isRTL) {
      I18nManager.allowRTL(false);
      I18nManager.forceRTL(false);
    }
  }, []);

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
      value={{ lang, isRTL: isRTLLang(lang), setLang, t }}
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
