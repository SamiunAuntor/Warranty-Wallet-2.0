const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const MIN_PASSWORD_LENGTH = 8;

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

function validateEmail(email: string) {
  if (!normalizeEmail(email)) return "Enter your email address.";
  if (!EMAIL_PATTERN.test(normalizeEmail(email))) return "Enter a valid email address.";
  return null;
}

export function validateLoginInput(email: string, password: string): string | null {
  return validateEmail(email) ?? (password ? null : "Enter your password.");
}

export function validateRegistrationInput(
  name: string,
  email: string,
  password: string,
  confirm: string,
): string | null {
  if (name.trim().length < 2) return "Enter your full name.";
  const emailError = validateEmail(email);
  if (emailError) return emailError;
  if (password.length < MIN_PASSWORD_LENGTH) {
    return `Use a password with at least ${MIN_PASSWORD_LENGTH} characters.`;
  }
  if (password !== confirm) return "The passwords do not match.";
  return null;
}

export function validatePasswordResetRequest(email: string): string | null {
  return validateEmail(email);
}
