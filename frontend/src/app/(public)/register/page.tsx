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

const inputClass = "w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15";

export default function RegisterPage() {
  const router = useRouter();
  const { register, loginWithGoogle, appUser, loading: authLoading } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    if (!authLoading && appUser) router.replace("/dashboard");
  }, [authLoading, appUser, router]);

  const strength = password.length >= 12 ? ["Strong", "w-full", "bg-[#4b41e1]"] : password.length >= 8 ? ["Fair", "w-2/3", "bg-amber-500"] : ["Weak", "w-1/4", "bg-[#ba1a1a]"];

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const name = String(form.get("name"));
    const email = String(form.get("email"));
    const confirmPassword = String(form.get("confirmPassword"));
    if (name.trim().length < 2) return void toast.warning("Enter your full name.");
    if (password.length < 8) return void toast.warning("Password must contain at least 8 characters.");
    if (password !== confirmPassword) return void toast.warning("Passwords do not match.");
    if (form.get("terms") !== "on") return void toast.warning("You must agree to the Terms of Service and Privacy Policy.");
    setSubmitting(true);
    try {
      await register(name, email, password);
      void toast.success("Your account was created successfully");
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
      void toast.success("Your Google account is connected");
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
          <AuthPageHeader title="Create your secure vault" description="Join thousands of users protecting their assets." className="mb-7" />
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-1.5"><label htmlFor="full-name" className="text-xs font-semibold text-[#45464d]">Full Name<RequiredMark /></label><input id="full-name" name="name" required autoComplete="name" type="text" placeholder="John Doe" className={inputClass}/></div>
            <div className="space-y-1.5"><label htmlFor="register-email" className="text-xs font-semibold text-[#45464d]">Email Address<RequiredMark /></label><input id="register-email" name="email" required autoComplete="email" type="email" placeholder="name@company.com" className={inputClass}/></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-1.5"><label htmlFor="register-password" className="text-xs font-semibold text-[#45464d]">Password<RequiredMark /></label><input id="register-password" name="password" required minLength={8} autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} type="password" placeholder="••••••••" className={inputClass}/></div><div className="space-y-1.5"><label htmlFor="confirm-password" className="text-xs font-semibold text-[#45464d]">Confirm Password<RequiredMark /></label><input id="confirm-password" name="confirmPassword" required minLength={8} autoComplete="new-password" type="password" placeholder="••••••••" className={inputClass}/></div></div>
            <div><div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-[#76777d]"><span>Security Strength</span><span>{strength[0]}</span></div><div className="h-1 overflow-hidden rounded-full bg-[#e5eeff]"><div className={`h-full transition-all ${strength[1]} ${strength[2]}`}/></div></div>
            <label className="flex items-start gap-2 text-xs text-[#45464d]"><input name="terms" required type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#c6c6cd] accent-[#4b41e1]"/><span>I agree to the <Link href="#" className="font-medium text-[#4b41e1]">Terms of Service</Link> and <Link href="#" className="font-medium text-[#4b41e1]">Privacy Policy</Link>.<RequiredMark /></span></label>
            <button disabled={submitting} type="submit" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#645efb] active:scale-[.98] disabled:cursor-not-allowed disabled:opacity-60">{submitting ? "Creating account..." : "Create Account"} {!submitting && <Icon name="arrow" className="h-4 w-4"/>}</button>
          </form>
          <div className="relative my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#c6c6cd]/60"/></div><div className="relative flex justify-center"><span className="bg-[#f8f9ff] px-4 text-[11px] font-semibold uppercase tracking-[.14em] text-[#76777d]">Or continue with</span></div></div>
          <GoogleButton label={submitting ? "Please wait..." : "Sign up with Google"} onClick={handleGoogle} disabled={submitting} />
          <p className="mt-6 text-center text-sm text-[#45464d]">Already have an account? <Link href="/login" className="ml-1 font-semibold text-[#4b41e1] hover:underline">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
