const STATUS_KEYWORDS: Record<string, string[]> = {
  fr: ["statut", "etat", "état", "en cours", "ou en est", "où en est", "avancement", "traitement"],
  en: ["status", "state", "in progress", "how far", "progress", "processing"],
  ar: ["حالة", "الحالة", "قيد المعالجة", "التقدم", "وضعية"],
};

const FISCAL_KEYWORDS: Record<string, string[]> = {
  fr: ["fiscal", "fiscalite", "fiscalité", "impot", "impôt", "tva", "declaration", "déclaration", "taxe", "cotisation"],
  en: ["fiscal", "tax", "vat", "declaration", "contribution"],
  ar: ["ضريبة", "ضريبي", "الضريبة", "إقرار", "اشتراك"],
};

const DIACRITICS_REGEX = /[̀-ͯ]/g;

function normalize(text: string) {
  return text.toLowerCase().normalize("NFD").replace(DIACRITICS_REGEX, "");
}

/**
 * Réponses préprogrammées du mode démo — identiques à celles du site web
 * (src/lib/chatbot.ts), avec correspondance de mots-clés par langue.
 * À remplacer par un appel à une API interrogeant Claude dès
 * qu'ANTHROPIC_API_KEY sera configurée côté serveur.
 */
export function getDemoResponseKey(userMessage: string, lang: "fr" | "en" | "ar"): string {
  const normalized = normalize(userMessage);
  const statusWords = STATUS_KEYWORDS[lang] ?? STATUS_KEYWORDS.fr;
  const fiscalWords = FISCAL_KEYWORDS[lang] ?? FISCAL_KEYWORDS.fr;

  if (statusWords.some((k) => normalized.includes(normalize(k)))) {
    return "chatbot.statusAnswer";
  }
  if (fiscalWords.some((k) => normalized.includes(normalize(k)))) {
    return "chatbot.fiscalAnswer";
  }
  return "chatbot.defaultAnswer";
}
