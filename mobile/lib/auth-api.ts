import type { User } from "firebase/auth";
import { apiRequest } from "./api";

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
};

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
