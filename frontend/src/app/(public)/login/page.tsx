import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { GoogleButton } from "@/components/auth/google-button";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

export default function LoginPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      <AuthVisual />
      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-10"><Logo /></div>
          <header className="mb-8"><h1 className="text-3xl font-semibold tracking-[-.02em]">Welcome Back</h1><p className="mt-1 text-[#45464d]">Securely access your digital warranty vault.</p></header>
          <form className="space-y-6">
            <div className="space-y-2"><label htmlFor="login-email" className="text-sm font-medium">Email address</label><input id="login-email" type="email" placeholder="name@company.com" className="w-full rounded-lg border border-[#c6c6cd] bg-[#eff4ff] px-4 py-3.5 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div>
            <div className="space-y-2"><div className="flex items-center justify-between"><label htmlFor="login-password" className="text-sm font-medium">Password</label><Link href="#" className="text-xs font-semibold text-[#4b41e1] hover:underline">Forgot password?</Link></div><input id="login-password" type="password" placeholder="••••••••" className="w-full rounded-lg border border-[#c6c6cd] bg-[#eff4ff] px-4 py-3.5 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15"/></div>
            <label className="flex items-center gap-2 text-xs font-medium text-[#45464d]"><input type="checkbox" className="h-4 w-4 rounded border-[#c6c6cd] accent-[#4b41e1]"/>Remember me for 30 days</label>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-black px-5 py-3.5 text-sm font-semibold text-white shadow-md transition hover:bg-[#131b2e] active:scale-[.98]">Sign In <Icon name="arrow" className="h-4 w-4"/></button>
          </form>
          <div className="relative my-7"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#c6c6cd]/60"/></div><div className="relative flex justify-center"><span className="bg-[#f8f9ff] px-4 text-[11px] font-semibold uppercase tracking-[.14em] text-[#76777d]">Or continue with</span></div></div>
          <GoogleButton label="Google" />
          <p className="mt-6 text-center text-sm text-[#45464d]">Don&apos;t have an account? <Link href="/register" className="ml-1 font-semibold text-[#4b41e1] hover:underline">Sign up</Link></p>
        </div>
      </section>
    </div>
  );
}
