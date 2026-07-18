"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";
import { getAuthError } from "@/lib/auth-errors";
import { dialog, toast } from "@/lib/notifications";

export default function ForgotPasswordPage() {
  const { requestPasswordReset } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    try {
      const form = new FormData(event.currentTarget);
      await requestPasswordReset(String(form.get("email")));
      setSent(true);
      await dialog.success("Check your email", "If an account exists for that address, a secure password-reset link has been sent.");
    } catch (authError) {
      void toast.error(getAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  return <div className="flex min-h-[calc(100vh-4rem)] w-full"><AuthVisual/><section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2"><div className="w-full max-w-md"><div className="mb-8"><Logo/></div>{sent ? <div><div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-[#e2dfff] text-xl text-[#4b41e1]">✓</div><h1 className="text-3xl font-semibold tracking-[-.02em]">Check your email</h1><p className="mt-3 leading-6 text-[#45464d]">If an account exists for that address, Firebase has sent a secure password-reset link.</p><Link href="/login" className="mt-7 inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Return to login</Link></div> : <><header className="mb-8"><h1 className="text-3xl font-semibold tracking-[-.02em]">Forgot your password?</h1><p className="mt-2 leading-6 text-[#45464d]">Enter your account email and we&apos;ll send you a secure reset link.</p></header><form onSubmit={handleSubmit} className="space-y-5"><div className="space-y-2"><label htmlFor="forgot-email" className="text-sm font-medium">Email address</label><input id="forgot-email" name="email" required autoComplete="email" type="email" placeholder="name@company.com" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><button disabled={submitting} className="w-full rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Sending..." : "Send reset link"}</button></form><p className="mt-6 text-center text-sm text-[#45464d]">Remembered it? <Link href="/login" className="font-semibold text-[#4b41e1]">Sign in</Link></p></>}</div></section></div>;
}
