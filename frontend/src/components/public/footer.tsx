import Link from "next/link";
import { Logo } from "@/components/logo";

export function Footer() {
  return (
    <footer className="w-full border-t border-[#dce9ff] bg-white px-6 py-8">
      <div className="mx-auto flex w-11/12 max-w-[1440px] flex-col items-center justify-between gap-5 md:flex-row">
        <Logo />
        <div className="flex flex-wrap justify-center gap-6">
          <Link href="#" className="text-sm text-[#45464d] hover:text-[#0b1c30]">Privacy Policy</Link>
          <Link href="#" className="text-sm text-[#45464d] hover:text-[#0b1c30]">Terms of Service</Link>
          <Link href="#" className="text-sm text-[#45464d] hover:text-[#0b1c30]">Contact</Link>
        </div>
        <p className="text-center text-sm text-[#45464d]">© 2026 WarrantyWallet Inc. All rights reserved.</p>
      </div>
    </footer>
  );
}
