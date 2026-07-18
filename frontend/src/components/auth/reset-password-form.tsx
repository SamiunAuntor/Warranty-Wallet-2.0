"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { getAuthError } from "@/lib/auth-errors";
import { dialog, toast } from "@/lib/notifications";

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

  return <section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2"><div className="w-full max-w-md"><div className="mb-8"><Logo/></div>{checking ? <p className="text-[#45464d]">Validating your reset link...</p> : complete ? <div><h1 className="text-3xl font-semibold">Password updated</h1><p className="mt-3 text-[#45464d]">Your password was changed successfully. You can now sign in.</p><Link href="/login" className="mt-7 inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Continue to login</Link></div> : !email ? <div><h1 className="text-3xl font-semibold">Reset link unavailable</h1><p className="mt-3 text-[#45464d]">Request a new password-reset link to continue.</p><Link href="/forgot-password" className="mt-7 inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Request new link</Link></div> : <><header className="mb-7"><h1 className="text-3xl font-semibold tracking-[-.02em]">Create a new password</h1><p className="mt-2 text-[#45464d]">Resetting the password for {email}</p></header><form onSubmit={handleSubmit} className="space-y-5"><div className="space-y-2"><label htmlFor="new-password" className="text-sm font-medium">New password</label><input id="new-password" name="password" required minLength={8} autoComplete="new-password" type="password" placeholder="At least 8 characters" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><div className="space-y-2"><label htmlFor="new-password-confirmation" className="text-sm font-medium">Confirm new password</label><input id="new-password-confirmation" name="confirmation" required minLength={8} autoComplete="new-password" type="password" placeholder="Repeat your password" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><button disabled={submitting} className="w-full rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Updating..." : "Update password"}</button></form></>}</div></section>;
}
