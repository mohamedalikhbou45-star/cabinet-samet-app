export const colors = {
  green: "#86BC25",
  greenHover: "#78a821",
  navy: "#0B2545",
  navySoft: "#123a63",
  ink: "#0a0a0a",
  white: "#ffffff",
  background: "#f7f8fa",
  border: "#e5e7eb",
  textMuted: "#6b7280",
  danger: "#dc2626",
  warning: "#f59e0b",
  warningBg: "#fef3c7",
  info: "#2563eb",
  infoBg: "#dbeafe",
  success: "#059669",
  successBg: "#d1fae5",
};

export const statusStyles: Record<string, { bg: string; text: string }> = {
  EN_ATTENTE: { bg: colors.warningBg, text: "#92400e" },
  EN_TRAITEMENT: { bg: colors.infoBg, text: "#1e40af" },
  TRAITE: { bg: colors.successBg, text: "#065f46" },
};

export const statusLabels: Record<string, string> = {
  EN_ATTENTE: "En attente",
  EN_TRAITEMENT: "En traitement",
  TRAITE: "Traité",
};

export const documentTypeLabels: Record<string, string> = {
  FACTURE: "Facture",
  LEASING: "Leasing",
  RELEVE_BANCAIRE: "Relevé bancaire",
  AUTRE: "Autre",
};
