import { createUserWithEmailAndPassword, onAuthStateChanged, sendPasswordResetEmail, signInWithEmailAndPassword, signOut, updateProfile, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { getFirebaseAuth } from "../lib/firebase";
import { syncUser, type AppUser } from "../lib/auth-api";

type AuthContextValue = {
  loading: boolean;
  user: User | null;
  appUser: AppUser | null;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  requestPasswordReset: (email: string) => Promise<void>;
  setAppUser: (user: AppUser) => void;
};
const unavailable = async () => { throw new Error("Authentication is not ready."); };
const AuthContext = createContext<AuthContextValue>({
  loading: true,
  user: null,
  appUser: null,
  login: unavailable,
  register: unavailable,
  logout: unavailable,
  requestPasswordReset: unavailable,
  setAppUser: () => undefined,
});

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [appUser, setAppUser] = useState<AppUser | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), async (nextUser) => {
        setUser(nextUser);
        if (!nextUser) {
          setAppUser(null);
          setLoading(false);
          return;
        }
        try {
          setAppUser(await syncUser(nextUser));
        } catch {
          await signOut(getFirebaseAuth());
          setUser(null);
          setAppUser(null);
        } finally {
          setLoading(false);
        }
      });
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);
  async function login(email: string, password: string) {
    await signInWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
  }

  async function register(name: string, email: string, password: string) {
    const credential = await createUserWithEmailAndPassword(getFirebaseAuth(), email.trim(), password);
    await updateProfile(credential.user, { displayName: name.trim() });
    setAppUser(await syncUser(credential.user, name));
  }

  async function logout() {
    await signOut(getFirebaseAuth());
  }

  async function requestPasswordReset(email: string) {
    await sendPasswordResetEmail(getFirebaseAuth(), email.trim());
  }

  return <AuthContext.Provider value={{ loading, user, appUser, login, register, logout, requestPasswordReset, setAppUser }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
