"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { useAuth } from "@/contexts/auth-context";
import { getAuthError } from "@/lib/auth-errors";
import { dialog, toast } from "@/lib/notifications";
import { RequiredMark } from "@/components/auth/required-mark";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

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

  return <div className="flex min-h-[calc(100vh-4rem)] w-full"><AuthVisual/><section className="flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2"><div className="w-full max-w-md">{sent ? <div className="text-center"><AuthPageHeader title="Check your email" description="If an account exists for that address, Firebase has sent a secure password-reset link."/><Link href="/login" className="inline-flex rounded-lg bg-[#4b41e1] px-6 py-3 text-sm font-semibold text-white">Return to login</Link></div> : <><AuthPageHeader title="Forgot your password?" description="Enter your account email and we'll send you a secure reset link."/><form onSubmit={handleSubmit} className="space-y-5"><div className="space-y-2"><label htmlFor="forgot-email" className="text-sm font-medium">Email address<RequiredMark /></label><input id="forgot-email" name="email" required autoComplete="email" type="email" placeholder="name@company.com" className="w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3.5 outline-none focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div><button disabled={submitting} className="w-full rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white disabled:opacity-60">{submitting ? "Sending..." : "Send reset link"}</button></form><p className="mt-6 text-center text-sm text-[#45464d]">Remembered it? <Link href="/login" className="font-semibold text-[#4b41e1]">Sign in</Link></p></>}</div></section></div>;
}
