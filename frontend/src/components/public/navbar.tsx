import Link from "next/link";
import { Logo } from "@/components/logo";

export function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-[#d3e4fe] bg-[#f8f9ff]/90 shadow-[0_2px_8px_rgba(11,28,48,.04)] backdrop-blur-md">
      <div className="mx-auto flex h-16 w-11/12 max-w-[1440px] items-center justify-between">
        <Logo />
        <nav className="hidden items-center gap-8 md:flex" aria-label="Primary navigation">
          <Link href="#features" className="text-sm font-medium text-[#45464d] transition-colors hover:text-[#4b41e1]">Features</Link>
          <Link href="#how-it-works" className="text-sm font-medium text-[#45464d] transition-colors hover:text-[#4b41e1]">How It Works</Link>
          <Link href="#pricing" className="text-sm font-medium text-[#45464d] transition-colors hover:text-[#4b41e1]">Pricing</Link>
        </nav>
        <div className="flex items-center gap-4">
          <Link href="/login" className="hidden text-sm font-medium text-[#0b1c30] transition-colors hover:text-[#4b41e1] md:block">Log In</Link>
          <Link href="/register" className="rounded-lg bg-[#4b41e1] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#645efb] active:scale-95">Start Free</Link>
        </div>
      </div>
    </header>
  );
}
