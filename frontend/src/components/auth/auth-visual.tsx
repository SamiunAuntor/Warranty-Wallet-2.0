import Image from "next/image";
import { Icon } from "@/components/icons";

const benefits = [
  ["scan", "AI-powered scanning", "Upload receipts; we handle the data extraction instantly."],
  ["notifications", "Smart expiration alerts", "Receive proactive reminders before your coverage lapses."],
  ["documents", "Unlimited secure storage", "AES-256 encrypted storage for all your digital documents."],
] as const;

export function AuthVisual() {
  return (
    <section className="relative hidden min-h-[calc(100vh-4rem)] w-1/2 items-center overflow-hidden bg-[#131b2e] lg:flex">
      <Image src="/assets/banner-image.png" alt="Warranty workspace" fill className="scale-110 object-cover opacity-55 mix-blend-overlay" priority />
      <div className="absolute inset-0 bg-gradient-to-tr from-[#131b2e]/65 via-[#131b2e]/45 to-[#4b41e1]/15" />
      <div className="relative z-10 mx-auto w-full max-w-xl px-12 text-white">
        <h2 className="text-5xl font-bold leading-tight tracking-[-.03em]">Secure your legacy,<br/>one asset at a time.</h2>
        <p className="my-7 text-lg leading-7 text-[#dae2fd]/80">Experience the future of warranty management. Our AI-driven engine tracks your coverage so you never miss a claim window again.</p>
        <div className="space-y-4">{benefits.map(([icon,title,text]) => <div key={title} className="flex items-start gap-4 rounded-xl border border-white/10 bg-white/[.06] p-4 backdrop-blur-sm"><span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#645efb]/25 text-[#c3c0ff]"><Icon name={icon} className="h-5 w-5"/></span><div><h3 className="text-sm font-semibold">{title}</h3><p className="mt-1 text-sm leading-5 text-[#dae2fd]/65">{text}</p></div></div>)}</div>
      </div>
    </section>
  );
}
