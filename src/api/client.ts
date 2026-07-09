import Constants from "expo-constants";
import AsyncStorage from "@react-native-async-storage/async-storage";

const API_URL =
  (Constants.expoConfig?.extra?.apiUrl as string | undefined) ??
  "http://localhost:3000";

const TOKEN_KEY = "cabinet-samet:token";
const USER_KEY = "cabinet-samet:user";

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  company: string | null;
  role: "CLIENT" | "ADMIN";
};

export async function getToken() {
  return AsyncStorage.getItem(TOKEN_KEY);
}

export async function saveSession(token: string, user: ApiUser) {
  await AsyncStorage.setItem(TOKEN_KEY, token);
  await AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
}

export async function getStoredUser(): Promise<ApiUser | null> {
  const raw = await AsyncStorage.getItem(USER_KEY);
  return raw ? JSON.parse(raw) : null;
}

export async function clearSession() {
  await AsyncStorage.multiRemove([TOKEN_KEY, USER_KEY]);
}

class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

async function request<T>(
  path: string,
  options: RequestInit & { skipAuth?: boolean } = {}
): Promise<T> {
  const headers: Record<string, string> = {
    ...(options.headers as Record<string, string>),
  };

  if (!options.skipAuth) {
    const token = await getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const isFormData =
    typeof FormData !== "undefined" && options.body instanceof FormData;
  if (!isFormData && options.body && !headers["Content-Type"]) {
    headers["Content-Type"] = "application/json";
  }

  const res = await fetch(`${API_URL}${path}`, { ...options, headers });
  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new ApiError(data.error ?? "Une erreur est survenue.", res.status);
  }

  return data as T;
}

export const api = {
  login: (email: string, password: string) =>
    request<{ token: string; user: ApiUser }>("/api/mobile/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    }),

  register: (payload: {
    name: string;
    email: string;
    company?: string;
    password: string;
  }) =>
    request<{ success: boolean }>("/api/register", {
      method: "POST",
      body: JSON.stringify(payload),
      skipAuth: true,
    }),

  dashboard: () =>
    request<{
      stats: {
        total: number;
        enAttente: number;
        enTraitement: number;
        traite: number;
      };
      recentDocuments: DocumentDto[];
      recentMessages: MessageDto[];
    }>("/api/dashboard"),

  documents: () => request<{ documents: DocumentDto[] }>("/api/documents"),

  uploadDocument: (file: { uri: string; name: string; type: string }, docType: string) => {
    const form = new FormData();
    // React Native's FormData accepts this shape for file uploads.
    form.append("file", { uri: file.uri, name: file.name, type: file.type } as never);
    form.append("type", docType);
    return request<{ document: DocumentDto }>("/api/documents", {
      method: "POST",
      body: form,
    });
  },

  messages: () => request<{ messages: MessageDto[] }>("/api/messages"),

  sendMessage: (body: string) =>
    request<{ message: MessageDto }>("/api/messages", {
      method: "POST",
      body: JSON.stringify({ body }),
    }),

  registerPushToken: (token: string, platform: string) =>
    request<{ success: boolean }>("/api/push-token", {
      method: "POST",
      body: JSON.stringify({ token, platform }),
    }),

  forgotPassword: (email: string) =>
    request<{ ok: boolean }>("/api/auth/forgot-password", {
      method: "POST",
      body: JSON.stringify({ email }),
      skipAuth: true,
    }),

  changePassword: (currentPassword: string, newPassword: string) =>
    request<{ ok: boolean }>("/api/profile/password", {
      method: "POST",
      body: JSON.stringify({ currentPassword, newPassword }),
    }),
};

export type DocumentDto = {
  id: string;
  originalName: string;
  mimeType: string;
  size: number;
  type: string;
  status: string;
  note: string | null;
  createdAt: string;
};

export type MessageDto = {
  id: string;
  body: string;
  read: boolean;
  sender: "ADMIN" | "CLIENT";
  createdAt: string;
};
