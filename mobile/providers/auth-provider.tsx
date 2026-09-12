import { onAuthStateChanged, type User } from "firebase/auth";
import { createContext, useContext, useEffect, useState, type PropsWithChildren } from "react";
import { getFirebaseAuth } from "../lib/firebase";

type AuthContextValue = { loading: boolean; user: User | null };
const AuthContext = createContext<AuthContextValue>({ loading: true, user: null });

export function AuthProvider({ children }: PropsWithChildren) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    try {
      return onAuthStateChanged(getFirebaseAuth(), (nextUser) => { setUser(nextUser); setLoading(false); });
    } catch {
      setLoading(false);
      return undefined;
    }
  }, []);
  return <AuthContext.Provider value={{ loading, user }}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
