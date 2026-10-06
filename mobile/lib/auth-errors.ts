import { FirebaseError } from "firebase/app";

const messages: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists with this email address.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/wrong-password": "The email or password is incorrect.",
  "auth/user-not-found": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Use a stronger password with at least 8 characters.",
  "auth/account-exists-with-different-credential":
    "This email already uses a different sign-in method.",
  "auth/too-many-requests": "Too many attempts. Please wait a moment and try again.",
  "auth/network-request-failed": "Could not reach Firebase. Check your internet connection.",
  "auth/user-disabled": "This account has been disabled. Contact support for help.",
  "auth/missing-email": "Enter your email address.",
};

export function getAuthError(error: unknown) {
  if (error instanceof FirebaseError) return messages[error.code] ?? error.message;
  if (error instanceof Error && error.message) return error.message;
  return "Something went wrong. Please try again.";
}
