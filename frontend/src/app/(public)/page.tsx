import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";

function Action({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  return <Link href="/register" className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold transition active:scale-95 ${secondary ? "border border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]" : "bg-[#4b41e1] text-white shadow-md hover:bg-[#645efb]"}`}>{children}</Link>;
}

function FeatureIcon({ name, purple = false }: { name: Parameters<typeof Icon>[0]["name"]; purple?: boolean }) {
  return <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${purple ? "border-[#645efb] bg-[#645efb] text-white" : "border-[#c6c6cd] bg-[#dce9ff] text-[#0b1c30]"}`}><Icon name={name} className="h-6 w-6" /></div>;
}

function CheckItem({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <li className={`flex items-center gap-2 text-sm ${dark ? "text-white" : "text-[#0b1c30]"}`}><Icon name="check" className={`h-4 w-4 ${dark ? "text-[#c3c0ff]" : "text-[#4b41e1]"}`} />{children}</li>;
}

export default function LandingPage() {
  return (
    <>
      <div className="pointer-events-none absolute -right-24 -top-40 -z-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(75,65,225,.1),rgba(248,249,255,0)_70%)]" />
      <section className="relative z-10 mx-auto flex w-11/12 max-w-[1440px] flex-col items-center gap-12 pb-12 pt-16 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-col items-start gap-6 lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dce9ff] bg-[#eff4ff] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4b41e1]"><Icon name="sparkles" className="h-4 w-4" />WarrantyWallet 2.0 is here</div>
          <h1 className="max-w-[620px] text-[42px] font-bold leading-[1.08] tracking-[-.03em] text-[#0b1c30] sm:text-5xl lg:text-[56px]">Never lose a <span className="bg-gradient-to-br from-[#0b1c30] to-[#4b41e1] bg-clip-text text-transparent">warranty benefit</span> again.</h1>
          <p className="max-w-xl text-base leading-7 text-[#45464d] sm:text-lg">Organize your high-value assets in a secure, intelligent vault. Our AI-powered system extracts details from receipts, tracks expiration dates, and alerts you before it&apos;s too late.</p>
          <div className="flex w-full flex-col gap-4 pt-1 sm:w-auto sm:flex-row"><Action>Start Free Trial <Icon name="arrow" className="h-4 w-4" /></Action><Action secondary>View Demo</Action></div>
          <div className="flex items-center gap-3 pt-2 text-sm text-[#45464d]"><div className="flex -space-x-2">{["AS", "MR", "NK"].map((name, i) => <span key={name} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f9ff] text-[9px] font-bold text-white ${["bg-[#4b41e1]", "bg-[#213145]", "bg-[#8e7bc7]"][i]}`}>{name}</span>)}</div><span>Trusted by 10,000+ smart asset owners</span></div>
        </div>
        <div className="flex w-full justify-center lg:w-1/2 lg:justify-end"><div className="relative aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#dce9ff] bg-[#e5eeff] shadow-[0_24px_60px_rgba(11,28,48,.18)]"><Image src="/assets/banner-image.png" alt="Modern home workspace with warranty dashboard" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div></div>
      </section>

      <section id="features" className="mx-auto w-11/12 max-w-[1440px] py-12">
        <div className="mb-10 text-center"><h2 className="text-3xl font-semibold tracking-[-.02em] text-[#0b1c30]">Intelligent Warranty Management</h2><p className="mx-auto mt-2 max-w-2xl text-base text-[#45464d]">Everything you need to keep track of your valuable purchases, automated for your peace of mind.</p></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="relative overflow-hidden rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm md:col-span-2"><FeatureIcon name="scan" purple /><h3 className="mb-2 text-2xl font-semibold">AI-Powered Receipt Scanning</h3><p className="mb-6 max-w-xl leading-6 text-[#45464d]">Simply snap a photo of your receipt or forward an email. Our intelligent OCR extracts the product name, purchase date, price, and automatically calculates the warranty period.</p><div className="flex items-center gap-4 rounded-xl border border-[#c6c6cd] bg-[#f8f9ff] p-4"><div className="relative flex h-20 w-16 items-center justify-center overflow-hidden rounded border border-[#c6c6cd] bg-[#dce9ff]"><Icon name="receipt" className="h-7 w-7 text-[#45464d]" /><div className="scan-line absolute left-0 top-0 h-0.5 w-full bg-[#4b41e1] shadow-[0_0_8px_#4b41e1]" /></div><div className="flex flex-1 flex-col gap-2"><div className="h-3 w-3/4 rounded bg-[#d3e4fe]"/><div className="h-3 w-1/2 rounded bg-[#d3e4fe]"/><div className="mt-1 flex gap-2"><span className="rounded bg-[#e2dfff] px-2 py-1 text-[10px] font-bold text-[#4b41e1]">DATE FOUND</span><span className="rounded bg-[#e2dfff] px-2 py-1 text-[10px] font-bold text-[#4b41e1]">PRICE FOUND</span></div></div></div></article>
          <article className="flex flex-col rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm"><FeatureIcon name="calendar" /><h3 className="mb-2 text-lg font-semibold">Proactive Alerts</h3><p className="flex-1 leading-6 text-[#45464d]">Never let a warranty slip away. Get notified 30, 14, and 3 days before expiration via email or push notification.</p><div className="mt-6 rounded-lg border border-[#c6c6cd] bg-[#f8f9ff] p-3"><div className="flex items-center gap-2 text-xs font-semibold"><Icon name="warning" className="h-4 w-4 text-[#ba1a1a]"/>Expiring Soon</div><p className="mt-2 text-sm text-[#45464d]">Sony Headphones coverage ends in 14 days.</p></div></article>
          <article className="rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm"><FeatureIcon name="vault" /><h3 className="mb-2 text-lg font-semibold">Centralized Vault</h3><p className="leading-6 text-[#45464d]">Store manuals, receipts, and warranty documents in one secure place. Accessible anywhere, anytime.</p></article>
          <article id="how-it-works" className="flex flex-col items-center gap-6 rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm md:col-span-2 md:flex-row"><div className="flex-1"><FeatureIcon name="support"/><h3 className="mb-2 text-2xl font-semibold">One-Click Claim Initiation</h3><p className="mb-4 leading-6 text-[#45464d]">When something breaks, we gather all the necessary documentation into a single packet and provide the manufacturer&apos;s direct contact flow.</p><Link href="#" className="inline-flex items-center gap-1 text-sm font-medium text-[#4b41e1]">See how claims work <Icon name="arrow" className="h-4 w-4"/></Link></div><div className="relative flex aspect-square w-full items-center justify-center rounded-xl border border-[#c6c6cd] bg-[#f8f9ff] md:w-64"><div className="absolute h-40 w-32 rotate-3 rounded border border-[#d3e4fe] bg-[#eff4ff] shadow-sm"/><div className="relative z-10 flex h-40 w-32 -rotate-6 flex-col gap-2 rounded border border-[#dce9ff] bg-white p-3 shadow-md"><div className="h-2 rounded bg-[#d3e4fe]"/><div className="h-2 w-3/4 rounded bg-[#d3e4fe]"/><span className="mt-auto ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#645efb] text-white"><Icon name="check" className="h-4 w-4"/></span></div></div></article>
        </div>
      </section>

      <section id="pricing" className="mx-auto w-11/12 max-w-[1440px] py-16">
        <div className="mb-10 text-center">
          <h2 className="text-3xl font-semibold tracking-[-.02em]">Simple, transparent pricing</h2>
          <p className="mt-2 text-base text-[#45464d]">Start organizing your assets today. Upgrade when you need more power.</p>
        </div>
        <div className="mx-auto grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="flex min-h-[540px] flex-col rounded-2xl border border-[#d3e4fe] bg-[#f8f9ff] p-8 shadow-sm">
            <h3 className="text-2xl font-semibold">Basic</h3>
            <div className="my-1 text-5xl font-bold">$0<span className="text-base font-normal text-[#45464d]">/mo</span></div>
            <p className="mb-6 border-b border-[#dce9ff] pb-5 leading-6 text-[#45464d]">Perfect for individuals starting to organize their major purchases.</p>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <CheckItem>Up to 5 assets</CheckItem>
              <CheckItem>Basic email reminders</CheckItem>
              <CheckItem>Manual entry</CheckItem>
            </ul>
            <Link href="/register" className="rounded-lg border border-[#c6c6cd] bg-[#dae2fd] px-5 py-2.5 text-center text-sm font-medium hover:bg-[#d3e4fe]">Get Started Free</Link>
          </article>

          <article className="flex min-h-[540px] flex-col rounded-2xl border border-[#d3e4fe] bg-[#f8f9ff] p-8 shadow-sm">
            <h3 className="text-2xl font-semibold">Plus</h3>
            <div className="my-1 text-5xl font-bold">$5<span className="text-base font-normal text-[#45464d]">/mo</span></div>
            <p className="mb-6 border-b border-[#dce9ff] pb-5 leading-6 text-[#45464d]">Enhanced protection for your growing collection of assets.</p>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <CheckItem>Up to 20 assets</CheckItem>
              <CheckItem>Smart OCR Receipt Scanning</CheckItem>
              <CheckItem>Advanced multi-channel alerts</CheckItem>
              <CheckItem>Priority email support</CheckItem>
            </ul>
            <Link href="/register" className="rounded-lg bg-[#4b41e1] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#645efb] active:scale-95">Start Plus Trial</Link>
          </article>

          <article className="relative flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[#645efb] bg-[#131b2e] p-8 text-white shadow-lg">
            <span className="absolute right-0 top-0 rounded-bl-lg bg-[#645efb] px-4 py-1.5 text-[11px] font-semibold tracking-wide">RECOMMENDED</span>
            <h3 className="text-2xl font-semibold text-[#7c839b]">Pro</h3>
            <div className="my-1 text-5xl font-bold">$10<span className="text-base font-normal text-[#7c839b]">/mo</span></div>
            <p className="mb-6 border-b border-[#3f465c] pb-5 leading-6 text-[#7c839b]">The ultimate vault for power users and families.</p>
            <ul className="mb-8 flex flex-1 flex-col gap-4">
              <CheckItem dark>Up to 100 assets</CheckItem>
              <CheckItem dark>Unlimited OCR</CheckItem>
              <CheckItem dark>Claim preparation assistant</CheckItem>
              <CheckItem dark>Shared vaults</CheckItem>
              <CheckItem dark>Priority phone support</CheckItem>
            </ul>
            <Link href="/register" className="rounded-lg bg-[#e2dfff] px-5 py-2.5 text-center text-sm font-medium text-[#0f0069] hover:bg-[#c3c0ff]">Start Pro Trial</Link>
          </article>
        </div>
      </section>

      <section className="mx-auto w-11/12 max-w-[1440px] py-16"><div className="flex flex-col items-center overflow-hidden rounded-3xl border border-[#d3e4fe] bg-[#eff4ff] p-8 text-center shadow-sm md:p-12"><h2 className="max-w-2xl text-3xl font-semibold tracking-[-.02em]">Stop leaving money on the table when things break.</h2><p className="mt-3 max-w-xl text-[#45464d]">Join thousands of smart consumers who use WarrantyWallet to protect their investments.</p><div className="mt-8"><Action>Start Free</Action></div><p className="mt-2 text-xs font-semibold tracking-wide text-[#45464d]">No credit card required for Free tier.</p></div></section>
    </>
  );
}
