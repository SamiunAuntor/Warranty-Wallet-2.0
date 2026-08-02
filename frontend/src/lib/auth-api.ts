import type { User } from "firebase/auth";
import type { UserPlan } from "@/constants/plans";

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

type ApiResponse<T> = { success: boolean; message: string; data: T };

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:5000/api/v1";

export async function syncUser(firebaseUser: User, preferredName?: string): Promise<AppUser> {
  const token = await firebaseUser.getIdToken();
  const fallbackName = firebaseUser.email?.split("@")[0] ?? "Warranty Wallet User";
  const response = await fetch(`${API_URL}/users/sync`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      name: preferredName?.trim() || firebaseUser.displayName || fallbackName,
      ...(firebaseUser.photoURL ? { photoURL: firebaseUser.photoURL } : {}),
    }),
  });

  const payload = (await response.json().catch(() => null)) as ApiResponse<AppUser> | { message?: string } | null;
  if (!response.ok) {
    throw new Error(payload?.message || "Could not synchronize your account with Warranty Wallet.");
  }
  return (payload as ApiResponse<AppUser>).data;
}

export async function updateAppUser(token: string, input: { name?: string; phone?: string | null }) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(input),
  });
  const payload = await response.json().catch(() => null) as ApiResponse<AppUser> | { message?: string } | null;
  if (!response.ok) throw new Error(payload?.message || "Could not update profile.");
  return (payload as ApiResponse<AppUser>).data;
}

async function authenticatedRequest<T>(path: string, token: string, init?: RequestInit) {
  const response = await fetch(`${API_URL}${path}`, { ...init, headers: { Authorization: `Bearer ${token}`, ...init?.headers } });
  const payload = await response.json().catch(() => null) as ApiResponse<T> | { message?: string } | null;
  if (!response.ok) throw new Error(payload?.message || "The account request could not be completed.");
  return (payload as ApiResponse<T>).data;
}

export function uploadProfilePhoto(token: string, file: File) {
  const body = new FormData(); body.set("file", file);
  return authenticatedRequest<AppUser>("/users/profile/avatar", token, { method: "POST", body });
}
export const getUserPreferences = (token: string) => authenticatedRequest<UserPreferences>("/users/preferences", token);
export const updateUserPreferences = (token: string, input: Partial<Omit<UserPreferences, "id" | "userId">>) => authenticatedRequest<UserPreferences>("/users/preferences", token, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(input) });
