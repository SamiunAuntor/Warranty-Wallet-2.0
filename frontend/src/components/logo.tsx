import Image from "next/image";
import Link from "next/link";

export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2 text-[#0b1c30]">
      <Image src="/assets/logo.png" alt="WarrantyWallet" width={32} height={32} className="h-8 w-8 object-contain" priority />
      {!compact && (
        <span className="text-[15px] font-bold tracking-[-0.02em] sm:text-lg">
          Warranty <span className="text-[#4b41e1]">Wallet</span>
        </span>
      )}
    </Link>
  );
}
