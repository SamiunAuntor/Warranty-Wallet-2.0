"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { getAuthError } from "@/lib/auth-errors";
import { dialog, toast } from "@/lib/notifications";
import { RequiredMark } from "@/components/auth/required-mark";
import { AuthPageHeader } from "@/components/auth/auth-page-header";
import { Loading } from "@/components/ui/loading";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const code = params.get("oobCode") ?? "";
  const { verifyResetCode, resetPassword } = useAuth();
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(Boolean(code));
  const [submitting, setSubmitting] = useState(false);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    if (!code) {
      queueMicrotask(() => void dialog.error("Invalid reset link", "This password-reset link is missing its security code."));
      return;
    }
    verifyResetCode(code)
      .then(setEmail)
      .catch((authError) => void dialog.error("Unable to reset password", getAuthError(authError)))
      .finally(() => setChecking(false));
  }, [code, verifyResetCode]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const password = String(form.get("password"));
    const confirmation = String(form.get("confirmation"));
    if (password.length < 8) return void toast.warning("Password must contain at least 8 characters.");
    if (password !== confirmation) return void toast.warning("Passwords do not match.");
    setSubmitting(true);
    try {
      await resetPassword(code, password);
      setComplete(true);
      await dialog.success("Password updated", "Your password was changed successfully. You can now sign in.");
    } catch (authError) {
      void toast.error(getAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  if (checking) return <section className="w-full lg:w-1/2"><Loading fullScreen={false} className="min-h-[calc(100vh-4rem)]" label="Validating your reset link"/></section>;

  return <section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2"><div className="w-full max-w-md">{complete ? <div className="text-center"><AuthPageHeader title="Password updated" description="Your password was changed successfully. You can now sign in."/><Link href="/login" className="inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Continue to login</Link></div> : !email ? <div className="text-center"><AuthPageHeader title="Reset link unavailable" description="Request a new password-reset link to continue."/><Link href="/forgot-password" className="inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Request new link</Link></div> : <><AuthPageHeader title="Create a new password" description={`Resetting the password for ${email}`} className="mb-7"/><form onSubmit={handleSubmit} className="space-y-5"><div className="space-y-2"><label htmlFor="new-password" className="text-sm font-medium">New password<RequiredMark /></label><input id="new-password" name="password" required minLength={8} autoComplete="new-password" type="password" placeholder="At least 8 characters" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><div className="space-y-2"><label htmlFor="new-password-confirmation" className="text-sm font-medium">Confirm new password<RequiredMark /></label><input id="new-password-confirmation" name="confirmation" required minLength={8} autoComplete="new-password" type="password" placeholder="Repeat your password" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><button disabled={submitting} className="w-full rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Updating..." : "Update password"}</button></form></>}</div></section>;
}
