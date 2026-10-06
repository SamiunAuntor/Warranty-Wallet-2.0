import Constants from "expo-constants";
import { Platform } from "react-native";

const DEFAULT_PORT = "5000";

/**
 * Resolves the API base URL. An explicit EXPO_PUBLIC_API_URL always wins.
 * In development without one, the Expo dev server host is reused so a
 * physical device reaches the computer that runs both servers.
 */
function resolveApiUrl() {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) return configured.replace(/\/+$/, "");

  const devHost = Constants.expoConfig?.hostUri?.split(":")[0];
  if (devHost) return `http://${devHost}:${DEFAULT_PORT}/api/v1`;

  const fallbackHost = Platform.OS === "android" ? "10.0.2.2" : "localhost";
  return `http://${fallbackHost}:${DEFAULT_PORT}/api/v1`;
}

export const API_URL = resolveApiUrl();

export const googleClientIds = {
  android: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID?.trim() || undefined,
  ios: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID?.trim() || undefined,
  web: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID?.trim() || undefined,
};

/** Google sign-in needs a client ID for the platform the app is running on. */
export const isGoogleSignInConfigured = Boolean(
  Platform.select({
    android: googleClientIds.android,
    ios: googleClientIds.ios,
    default: googleClientIds.web,
  }),
);
