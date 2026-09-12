import AsyncStorage from "@react-native-async-storage/async-storage";
import { getApp, getApps, initializeApp } from "firebase/app";
import { getReactNativePersistence, initializeAuth, type Auth } from "firebase/auth";

const config = {
  apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
};

let auth: Auth | null = null;

export function getFirebaseAuth() {
  if (auth) return auth;
  const required = Object.entries(config).filter(([, value]) => !value).map(([key]) => key);
  if (required.length) throw new Error(`Firebase is not configured. Missing: ${required.join(", ")}`);
  const app = getApps().length ? getApp() : initializeApp(config);
  auth = initializeAuth(app, { persistence: getReactNativePersistence(AsyncStorage) });
  return auth;
}
