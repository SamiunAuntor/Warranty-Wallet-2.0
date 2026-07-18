"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  browserLocalPersistence,
  browserSessionPersistence,
  confirmPasswordReset,
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  setPersistence,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
  verifyPasswordResetCode,
  type User,
} from "firebase/auth";
import { getFirebaseAuth } from "@/lib/firebase";
import { syncUser, type AppUser } from "@/lib/auth-api";

type AuthContextValue = {
  firebaseUser: User | null;
  appUser: AppUser | null;
  loading: boolean;
  register: (name: string, email: string, password: string) => Promise<void>;
  login: (email: string, password: string, remember: boolean) => Promise<void>;
  loginWithGoogle: () => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  verifyResetCode: (code: string) => Promise<string>;
  resetPassword: (code: string, password: string) => Promise<void>;
};

const AuthContext = createContext<AuthContextValue | null>(null);
const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: "select_account" });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [firebaseUser, setFirebaseUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), async (user) => {
        setFirebaseUser(user);
        if (!user) {
          setAppUser(null);
          setLoading(false);
          return;
        }
        try {
          setAppUser(await syncUser(user));
        } catch {
          await signOut(getFirebaseAuth());
          setFirebaseUser(null);
          setAppUser(null);
        } finally {
          setLoading(false);
        }
      });
    } catch {
      queueMicrotask(() => setLoading(false));
    }
  }, []);

  const finishSignIn = useCallback(async (user: User, name?: string) => {
    try {
      const syncedUser = await syncUser(user, name);
      setFirebaseUser(user);
      setAppUser(syncedUser);
    } catch (error) {
      await signOut(getFirebaseAuth());
      setFirebaseUser(null);
      setAppUser(null);
      throw error;
    }
  }, []);

  const register = useCallback(async (name: string, email: string, password: string) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const credential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(credential.user, { displayName: name.trim() });
    await finishSignIn(credential.user, name);
  }, [finishSignIn]);

  const login = useCallback(async (email: string, password: string, remember: boolean) => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, remember ? browserLocalPersistence : browserSessionPersistence);
    const credential = await signInWithEmailAndPassword(auth, email, password);
    await finishSignIn(credential.user);
  }, [finishSignIn]);

  const loginWithGoogle = useCallback(async () => {
    const auth = getFirebaseAuth();
    await setPersistence(auth, browserLocalPersistence);
    const credential = await signInWithPopup(auth, googleProvider);
    await finishSignIn(credential.user);
  }, [finishSignIn]);

  const logout = useCallback(async () => {
    await signOut(getFirebaseAuth());
    setFirebaseUser(null);
    setAppUser(null);
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    await sendPasswordResetEmail(getFirebaseAuth(), email, {
      url: `${window.location.origin}/reset-password`,
      handleCodeInApp: true,
    });
  }, []);

  const verifyResetCode = useCallback(
    (code: string) => verifyPasswordResetCode(getFirebaseAuth(), code),
    [],
  );

  const resetPassword = useCallback(
    (code: string, password: string) => confirmPasswordReset(getFirebaseAuth(), code, password),
    [],
  );

  const value = useMemo<AuthContextValue>(() => ({
    firebaseUser, appUser, loading, register, login, loginWithGoogle, logout,
    requestPasswordReset,
    verifyResetCode,
    resetPassword,
  }), [firebaseUser, appUser, loading, register, login, loginWithGoogle, logout, requestPasswordReset, verifyResetCode, resetPassword]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}
