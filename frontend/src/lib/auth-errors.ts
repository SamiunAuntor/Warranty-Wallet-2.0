import { FirebaseError } from "firebase/app";

const messages: Record<string, string> = {
  "auth/email-already-in-use": "An account already exists with this email address.",
  "auth/invalid-credential": "The email or password is incorrect.",
  "auth/invalid-email": "Enter a valid email address.",
  "auth/weak-password": "Use a stronger password with at least 8 characters.",
  "auth/popup-closed-by-user": "Google sign-in was cancelled.",
  "auth/popup-blocked": "The Google sign-in popup was blocked by your browser.",
  "auth/account-exists-with-different-credential": "This email already uses a different sign-in method.",
  "auth/too-many-requests": "Too many attempts. Please wait and try again.",
  "auth/network-request-failed": "Could not reach Firebase. Check your internet connection.",
  "auth/expired-action-code": "This password-reset link has expired.",
  "auth/invalid-action-code": "This password-reset link is invalid or has already been used.",
  "auth/user-disabled": "This account has been disabled.",
};

export function getAuthError(error: unknown) {
  if (error instanceof FirebaseError) return messages[error.code] ?? error.message;
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}
