import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false, variant = "dark" }: { compact?: boolean; variant?: "dark" | "light" }) {
  return (
    <Link href="/" className={`flex items-center gap-2 ${variant === "light" ? "text-white" : "text-[#0b1c30]"}`}>
      <Image src="/assets/logo.png" alt="WarrantyWallet" width={32} height={32} className="h-8 w-8 object-contain" priority />
      {!compact && (
        <span className="text-[15px] font-bold tracking-[-0.02em] sm:text-lg">
          Warranty <span className={variant === "light" ? "text-[#c3c0ff]" : "text-[#4b41e1]"}>Wallet</span>
        </span>
      )}
    </Link>
  );
}
