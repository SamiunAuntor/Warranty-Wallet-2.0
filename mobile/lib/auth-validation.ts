export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export function validateLoginInput(email: string, password: string): string | null {
  if (!normalizeEmail(email) || !password) {
    return "Enter your email and password.";
  }

  return null;
}

export function validateRegistrationInput(
  name: string,
  email: string,
  password: string,
): string | null {
  if (!name.trim() || !normalizeEmail(email) || password.length < 6) {
    return "Enter your name, email, and a password of at least 6 characters.";
  }

  return null;
}

export function validatePasswordResetInput(password: string, confirm: string): string | null {
  if (password.length < 6 || password !== confirm) {
    return "Passwords must match and contain at least 6 characters.";
  }

  return null;
}
