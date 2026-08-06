import type { User } from "firebase/auth";
import type { UserPlan } from "@/constants/plans";
import { apiRequest } from "@/lib/api-client";

export type AppUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  plan: UserPlan;
  emailVerified: boolean;
  phone?: string | null;
  avatarSource?: "NONE" | "GOOGLE" | "CUSTOM";
};

export type UserPreferences = {
  id: string; userId: string; warrantyReminders: boolean;
  reminderDays: number[]; timezone: string;
  currency: "USD" | "BDT" | "EUR" | "GBP" | "CAD" | "AUD";
  dateFormat: "MMM_D_YYYY" | "DD_MM_YYYY" | "MM_DD_YYYY";
};

export async function syncUser(firebaseUser: User, preferredName?: string): Promise<AppUser> {
  const token = await firebaseUser.getIdToken();
  const fallbackName = firebaseUser.email?.split("@")[0] ?? "Warranty Wallet User";
  return apiRequest<AppUser>("/users/sync", {
    method: "POST",
    token,
    fallbackMessage: "Could not synchronize your account with Warranty Wallet.",
    body: JSON.stringify({
      name: preferredName?.trim() || firebaseUser.displayName || fallbackName,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
    }),
  });
}

export async function updateAppUser(token: string, input: { name?: string; phone?: string | null }) {
  return apiRequest<AppUser>("/users/profile", {
    method: "PATCH",
    token,
    fallbackMessage: "Could not update profile.",
    body: JSON.stringify(input),
  });
}

async function authenticatedRequest<T>(path: string, token: string, init?: RequestInit) {
  return apiRequest<T>(path, { ...init, token, fallbackMessage: "The account request could not be completed." });
}

export function uploadProfilePhoto(token: string, file: File) {
  const body = new FormData(); body.set("file", file);
  return authenticatedRequest<AppUser>("/users/profile/avatar", token, { method: "POST", body });
}
export const getUserPreferences = (token: string) => authenticatedRequest<UserPreferences>("/users/preferences", token);
export const updateUserPreferences = (token: string, input: Partial<Omit<UserPreferences, "id" | "userId">>) => authenticatedRequest<UserPreferences>("/users/preferences", token, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
