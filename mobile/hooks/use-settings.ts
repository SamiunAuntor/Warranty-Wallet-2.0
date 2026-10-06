import { useMutation } from "@tanstack/react-query";
import { useAuth } from "../providers/auth-provider";

/** Account security actions from the settings screen. */
export function useAccountSettings() {
  const { appUser, requestPasswordReset, logout } = useAuth();

  const sendPasswordReset = useMutation({
    mutationFn: async () => {
      if (!appUser) throw new Error("You are not signed in.");
      await requestPasswordReset(appUser.email);
    },
  });

  const signOut = useMutation({ mutationFn: logout });

  return { appUser, sendPasswordReset, signOut };
}
