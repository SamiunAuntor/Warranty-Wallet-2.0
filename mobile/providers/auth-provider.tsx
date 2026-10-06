import { useQueryClient } from "@tanstack/react-query";
import {
  createUserWithEmailAndPassword,
  GoogleAuthProvider,
  onAuthStateChanged,
  sendPasswordResetEmail,
  signInWithCredential,
  signInWithEmailAndPassword,
  signOut,
  updateProfile,
  type User,
  type UserCredential,
} from "firebase/auth";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
} from "react";
import { ApiError, registerAuthBridge } from "../lib/api";
import { syncUser } from "../lib/auth-api";
import { getAuthError } from "../lib/auth-errors";
import { normalizeEmail } from "../lib/auth-validation";
import { getFirebaseAuth } from "../lib/firebase";
import type { AppUser } from "../lib/types";

/**
 * - loading: restoring a saved session on launch
 * - offline: signed in to Firebase but the API could not be reached
 */
export type AuthStatus = "loading" | "signedOut" | "signedIn" | "offline";

type AuthContextValue = {
  status: AuthStatus;
  user: User | null;
  appUser: AppUser | null;
  isAdmin: boolean;
  /** A message explaining why the user was signed out, shown on the login screen. */
  notice: string;
  clearNotice: () => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  loginWithGoogle: (idToken: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  retrySync: () => Promise<void>;
  setAppUser: (user: AppUser) => void;
};

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: PropsWithChildren) {
  const queryClient = useQueryClient();
  const [status, setStatus] = useState<AuthStatus>("loading");
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [notice, setNotice] = useState("");
  // While an explicit sign-in runs, it owns the session state and the
  // Firebase listener must not sync a second time.
  const explicitSignIn = useRef(false);
  const statusRef = useRef(status);
  statusRef.current = status;

  const applySignedOut = useCallback(() => {
    setUser(null);
    setAppUser(null);
    setStatus("signedOut");
    queryClient.clear();
  }, [queryClient]);

  const syncSession = useCallback(
    async (nextUser: User) => {
      try {
        const synced = await syncUser(nextUser);
        setUser(nextUser);
        setAppUser(synced);
        setStatus("signedIn");
      } catch (error) {
        if (error instanceof ApiError && error.code === "NETWORK_ERROR") {
          setUser(nextUser);
          setStatus("offline");
          return;
        }
        setNotice(getAuthError(error));
        await signOut(getFirebaseAuth()).catch(() => undefined);
        applySignedOut();
      }
    },
    [applySignedOut],
  );

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
    } catch (error) {
      setNotice(getAuthError(error));
      setStatus("signedOut");
      return undefined;
    }
    return onAuthStateChanged(auth, (nextUser) => {
      if (explicitSignIn.current) return;
      if (!nextUser) {
        applySignedOut();
        return;
      }
      void syncSession(nextUser);
    });
  }, [applySignedOut, syncSession]);

  useEffect(() => {
    registerAuthBridge({
      getToken: async (forceRefresh) =>
        (await getFirebaseAuth().currentUser?.getIdToken(forceRefresh)) ?? null,
      onSessionRejected: (error) => {
        if (statusRef.current !== "signedIn") return;
        setNotice(
          error.code === "ACCOUNT_SUSPENDED"
            ? "Your account has been suspended. Contact support for help."
            : "Your session has ended. Please sign in again.",
        );
        void signOut(getFirebaseAuth());
      },
    });
    return () => registerAuthBridge(null);
  }, []);

  const finishSignIn = useCallback(
    async (signIn: () => Promise<UserCredential>, displayName?: string) => {
      explicitSignIn.current = true;
      setNotice("");
      try {
        const credential = await signIn();
        if (displayName) await updateProfile(credential.user, { displayName });
        const synced = await syncUser(credential.user, displayName);
        setUser(credential.user);
        setAppUser(synced);
        setStatus("signedIn");
      } catch (error) {
        if (getFirebaseAuth().currentUser) await signOut(getFirebaseAuth()).catch(() => undefined);
        applySignedOut();
        throw new Error(getAuthError(error));
      } finally {
        explicitSignIn.current = false;
      }
    },
    [applySignedOut],
  );

  const login = useCallback(
    (email: string, password: string) =>
      finishSignIn(() =>
        signInWithEmailAndPassword(getFirebaseAuth(), normalizeEmail(email), password),
      ),
    [finishSignIn],
  );

  const register = useCallback(
    (name: string, email: string, password: string) =>
      finishSignIn(
        () => createUserWithEmailAndPassword(getFirebaseAuth(), normalizeEmail(email), password),
        name.trim(),
      ),
    [finishSignIn],
  );

  const loginWithGoogle = useCallback(
    (idToken: string) =>
      finishSignIn(() =>
        signInWithCredential(getFirebaseAuth(), GoogleAuthProvider.credential(idToken)),
      ),
    [finishSignIn],
  );

  const logout = useCallback(async () => {
    setNotice("");
    await signOut(getFirebaseAuth());
  }, []);

  const requestPasswordReset = useCallback(async (email: string) => {
    try {
      await sendPasswordResetEmail(getFirebaseAuth(), normalizeEmail(email));
    } catch (error) {
      throw new Error(getAuthError(error));
    }
  }, []);

  const retrySync = useCallback(async () => {
    const current = getFirebaseAuth().currentUser;
    if (!current) {
      applySignedOut();
      return;
    }
    setStatus("loading");
    await syncSession(current);
  }, [applySignedOut, syncSession]);

  const value = useMemo<AuthContextValue>(
    () => ({
      status,
      user,
      appUser,
      isAdmin: appUser?.role === "ADMIN",
      notice,
      clearNotice: () => setNotice(""),
      login,
      register,
      loginWithGoogle,
      logout,
      requestPasswordReset,
      retrySync,
      setAppUser,
    }),
    [
      appUser,
      login,
      loginWithGoogle,
      logout,
      notice,
      register,
      requestPasswordReset,
      retrySync,
      status,
      user,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used inside AuthProvider.");
  return context;
}

/** The signed-in backend user. Only call this inside the signed-in app routes. */
export function useCurrentUser() {
  const { appUser } = useAuth();
  if (!appUser) throw new Error("useCurrentUser requires a signed-in user.");
  return appUser;
}
