import Link from "next/link";
import { AuthVisual } from "@/components/auth/auth-visual";
import { GoogleButton } from "@/components/auth/google-button";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

const inputClass = "w-full rounded-lg border border-[#c6c6cd] bg-white px-4 py-3 outline-none transition placeholder:text-[#76777d] focus:border-[#4b41e1] focus:ring-2 focus:ring-[#4b41e1]/15";

export default function RegisterPage() {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] w-full">
      <AuthVisual />
      <section className="relative flex w-full items-center justify-center px-5 py-10 sm:px-10 lg:w-1/2">
        <div className="w-full max-w-md">
          <div className="mb-6"><Logo /></div>
          <header className="mb-7"><h1 className="text-3xl font-semibold tracking-[-.02em]">Create your secure vault</h1><p className="mt-1 text-[#45464d]">Join thousands of users protecting their assets.</p></header>
          <form className="space-y-4">
            <div className="space-y-1.5"><label htmlFor="full-name" className="text-xs font-semibold text-[#45464d]">Full Name</label><input id="full-name" type="text" placeholder="John Doe" className={inputClass}/></div>
            <div className="space-y-1.5"><label htmlFor="register-email" className="text-xs font-semibold text-[#45464d]">Email Address</label><input id="register-email" type="email" placeholder="name@company.com" className={inputClass}/></div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2"><div className="space-y-1.5"><label htmlFor="register-password" className="text-xs font-semibold text-[#45464d]">Password</label><input id="register-password" type="password" placeholder="••••••••" className={inputClass}/></div><div className="space-y-1.5"><label htmlFor="confirm-password" className="text-xs font-semibold text-[#45464d]">Confirm Password</label><input id="confirm-password" type="password" placeholder="••••••••" className={inputClass}/></div></div>
            <div><div className="mb-1.5 flex justify-between text-[10px] font-semibold uppercase tracking-[.14em] text-[#76777d]"><span>Security Strength</span><span>Weak</span></div><div className="h-1 overflow-hidden rounded-full bg-[#e5eeff]"><div className="h-full w-1/4 bg-[#ba1a1a]"/></div></div>
            <label className="flex items-start gap-2 text-xs text-[#45464d]"><input type="checkbox" className="mt-0.5 h-4 w-4 rounded border-[#c6c6cd] accent-[#4b41e1]"/><span>I agree to the <Link href="#" className="font-medium text-[#4b41e1]">Terms of Service</Link> and <Link href="#" className="font-medium text-[#4b41e1]">Privacy Policy</Link>.</span></label>
            <button type="button" className="flex w-full items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-5 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#645efb] active:scale-[.98]">Create Account <Icon name="arrow" className="h-4 w-4"/></button>
          </form>
          <div className="relative my-5"><div className="absolute inset-0 flex items-center"><span className="w-full border-t border-[#c6c6cd]/60"/></div><div className="relative flex justify-center"><span className="bg-[#f8f9ff] px-4 text-[11px] font-semibold uppercase tracking-[.14em] text-[#76777d]">Or continue with</span></div></div>
          <GoogleButton label="Sign up with Google" />
          <p className="mt-6 text-center text-sm text-[#45464d]">Already have an account? <Link href="/login" className="ml-1 font-semibold text-[#4b41e1] hover:underline">Sign in</Link></p>
        </div>
      </section>
    </div>
  );
}
