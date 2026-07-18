"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { AuthVisual } from "@/components/auth/auth-visual";
import { GoogleButton } from "@/components/auth/google-button";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { getAuthError } from "@/lib/auth-errors";
import { toast } from "@/lib/notifications";
import { RequiredMark } from "@/components/auth/required-mark";
import { AuthPageHeader } from "@/components/auth/auth-page-header";

export default function LoginPage() {
  const router = useRouter();
  const { login, loginWithGoogle, appUser, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && appUser) router.replace("/dashboard");
  }, [authLoading, appUser, router]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitting(true);
    const form = new FormData(event.currentTarget);
    try {
      await login(String(form.get("email")), String(form.get("password")), form.get("remember") === "on");
      void toast.success("Signed in successfully");
      router.replace("/dashboard");
    } catch (authError) {
      void toast.error(getAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  async function handleGoogle() {
    setSubmitting(true);
    try {
      await loginWithGoogle();
      void toast.success("Signed in with Google");
      router.replace("/dashboard");
    } catch (authError) {
      void toast.error(getAuthError(authError));
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      <AuthVisual />
      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <AuthPageHeader title="Welcome Back" description="Securely access your digital warranty vault." />
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-2"><label htmlFor="login-email" className="text-sm font-medium">Email address<RequiredMark /></label><input id="login-email" name="email" required autoComplete="email" type="email" placeholder="name@company.com" className="w-full rounded-lg border border-[#c6c6cd] bg-[#eff4ff] px-4 py-3.5 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="login-password" className="text-sm font-medium">Password<RequiredMark /></label><Link href="/forgot-password" className="text-xs font-semibold text-[#4b41e1] hover:underline">Forgot password?</Link></div><input id="login-password" name="password" required autoComplete="current-password" type="password" placeholder="••••••••" className="w-full rounded-lg border border-[#c6c6cd] bg-[#eff4ff] px-4 py-3.5 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#45464d]"><input name="remember" type="checkbox" className="h-4 w-4 rounded border-[#c6c6cd] accent-[#4b41e1]"/>Remember me for 30 days</label>
            <button disabled={submitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#645efb] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Signing in..." : "Sign In"} {!submitting && <Icon name="arrow" className="h-4 w-4"/>}</button>
          </form>
          <div className="relative my-7"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#c6c6cd]/60"/></div><div className="relative flex justify-center"><span className="bg-[#f8f9ff] px-4 text-[11px] font-semibold uppercase tracking-[.14em] text-[#76777d]">Or continue with</span></div></div>
          <GoogleButton label={submitting ? "Please wait..." : "Google"} onClick={handleGoogle} disabled={submitting} />
          <p className="mt-6 text-center text-sm text-[#45464d]">Don&apos;t have an account? <Link href="/register" className="ml-1 font-semibold text-[#4b41e1] hover:underline">Sign up</Link></p>
        </div>
      </section>
    </div>
  );
}
