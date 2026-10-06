import type { User } from "firebase/auth";
import { apiRequest, filePart } from "./api";
import type { AppUser, NativeFile, UserPreferences } from "./types";

const MIN_NAME_LENGTH = 2;

function displayNameFor(user: User, preferredName?: string) {
  const candidates = [preferredName, user.displayName, user.email?.split("@")[0]];
  const name = candidates
    .map((value) => value?.trim())
    .find((value) => value && value.length >= MIN_NAME_LENGTH);
  return name ?? "Warranty Wallet User";
}

/** Creates or refreshes the backend record for a signed-in Firebase user. */
export async function syncUser(user: User, preferredName?: string) {
  return apiRequest<AppUser>("/users/sync", {
    method: "POST",
    token: await user.getIdToken(),
    body: {
      name: displayNameFor(user, preferredName),
      ...(user.photoURL ? { photoURL: user.photoURL } : {}),
    },
  });
}

export const getProfile = () => apiRequest<AppUser>("/users/profile");

export const updateProfile = (input: { name?: string; phone?: string | null }) =>
  apiRequest<AppUser>("/users/profile", { method: "PATCH", body: input });

export function uploadProfilePhoto(file: NativeFile) {
  const body = new FormData();
  body.append("file", filePart(file));
  return apiRequest<AppUser>("/users/profile/avatar", { method: "POST", body });
}

export const getPreferences = () => apiRequest<UserPreferences>("/users/preferences");

export const updatePreferences = (input: Partial<Omit<UserPreferences, "id" | "userId">>) =>
  apiRequest<UserPreferences>("/users/preferences", { method: "PATCH", body: input });
