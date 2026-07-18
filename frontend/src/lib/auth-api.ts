import type { User } from "firebase/auth";

export type AppUser = {
  id: string;
  firebaseUid: string;
  name: string;
  email: string;
  photoURL: string | null;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "BLOCKED" | "DELETED";
  plan: "FREE" | "PREMIUM";
  emailVerified: boolean;
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
