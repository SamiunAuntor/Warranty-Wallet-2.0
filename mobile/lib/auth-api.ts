import type { User } from "firebase/auth";
import { apiRequest } from "./api";
import type { NativeFile } from "./documents-api";

export type AppUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  plan: "BASIC" | "PLUS" | "PRO";
  emailVerified: boolean;
  phone?: string | null;
};
export type UserPreferences = { id: string; userId: string; warrantyReminders: boolean; reminderDays: number[]; timezone: string; currency: "USD" | "BDT" | "EUR" | "GBP" | "CAD" | "AUD"; dateFormat: "MMM_D_YYYY" | "DD_MM_YYYY" | "MM_DD_YYYY" };

export async function syncUser(firebaseUser: User, preferredName?: string) {
  const token = await firebaseUser.getIdToken();
  const fallbackName = firebaseUser.email?.split("@")[0] ?? "Warranty Wallet User";
  return apiRequest<AppUser>("/users/sync", {
    method: "POST",
    token,
    body: JSON.stringify({
      name: preferredName?.trim() || firebaseUser.displayName || fallbackName,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
    }),
  });
}
export function updateAppUser(token: string, input: { name?: string; phone?: string | null }) { return apiRequest<AppUser>("/users/profile", { method: "PATCH", token, body: JSON.stringify(input) }); }
export function getUserPreferences(token: string) { return apiRequest<UserPreferences>("/users/preferences", { token }); }
export function updateUserPreferences(token: string, input: Partial<Omit<UserPreferences, "id" | "userId">>) { return apiRequest<UserPreferences>("/users/preferences", { method: "PATCH", token, body: JSON.stringify(input) }); }
export function uploadProfilePhoto(token: string, file: NativeFile) { const body = new FormData(); body.append("file", { uri: file.uri, name: file.name, type: file.mimeType ?? "image/jpeg" } as unknown as Blob); return apiRequest<AppUser>("/users/profile/avatar", { method: "POST", token, body }); }
