import Image from "next/image";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { plans } from "@/constants/plans";

function Action({ children, secondary = false }: { children: React.ReactNode; secondary?: boolean }) {
  return <Link href="/register" className={`flex min-h-12 items-center justify-center gap-2 rounded-lg px-8 py-3 text-sm font-semibold transition active:scale-95 ${secondary ? "border border-[#c6c6cd] bg-white text-[#0b1c30] hover:bg-[#eff4ff]" : "bg-[#4b41e1] text-white shadow-md hover:bg-[#645efb]"}`}>{children}</Link>;
}

function FeatureIcon({ name, purple = false }: { name: Parameters<typeof Icon>[0]["name"]; purple?: boolean }) {
  return <div className={`mb-4 flex h-12 w-12 items-center justify-center rounded-xl border ${purple ? "border-[#645efb] bg-[#645efb] text-white" : "border-[#c6c6cd] bg-[#dce9ff] text-[#0b1c30]"}`}><Icon name={name} className="h-6 w-6" /></div>;
}

function CheckItem({ children, dark = false }: { children: React.ReactNode; dark?: boolean }) {
  return <li className={`flex items-center gap-2 text-sm ${dark ? "text-white" : "text-[#0b1c30]"}`}><Icon name="check" className={`h-4 w-4 ${dark ? "text-[#c3c0ff]" : "text-[#4b41e1]"}`} />{children}</li>;
}

function PlanFeatures({ assetLimit, dark = false }: { assetLimit: number; dark?: boolean }) {
  return <ul className="mb-8 flex flex-1 flex-col gap-4">
    <CheckItem dark={dark}>Up to {assetLimit} assets</CheckItem>
    <CheckItem dark={dark}>AI-powered document scanning</CheckItem>
    <CheckItem dark={dark}>Warranty expiration reminders</CheckItem>
    <CheckItem dark={dark}>Claims and service history</CheckItem>
    <CheckItem dark={dark}>Secure document storage</CheckItem>
  </ul>;
}

export default function LandingPage() {
  return (
    <>
      <div className="pointer-events-none absolute -right-24 -top-40 -z-0 h-[600px] w-[600px] rounded-full bg-[radial-gradient(circle,rgba(75,65,225,.1),rgba(248,249,255,0)_70%)]" />
      <section className="relative z-10 mx-auto flex w-11/12 max-w-[1440px] flex-col items-center gap-12 pb-12 pt-16 lg:flex-row lg:gap-16">
        <div className="flex w-full flex-col items-start gap-6 lg:w-1/2">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#dce9ff] bg-[#eff4ff] px-4 py-1.5 text-xs font-semibold tracking-wide text-[#4b41e1]"><Icon name="sparkles" className="h-4 w-4" />Digital Warranty Management</div>
          <h1 className="max-w-[620px] text-[42px] font-bold leading-[1.08] tracking-[-.03em] text-[#0b1c30] sm:text-5xl lg:text-[56px]">Never lose a <span className="bg-gradient-to-br from-[#0b1c30] to-[#4b41e1] bg-clip-text text-transparent">warranty benefit</span> again.</h1>
          <p className="max-w-xl text-base leading-7 text-[#45464d] sm:text-lg">Organize your high-value assets in a secure, intelligent vault. Our AI-powered system extracts details from receipts, tracks expiration dates, and alerts you before it&apos;s too late.</p>
          <div className="flex w-full flex-col gap-4 pt-1 sm:w-auto sm:flex-row"><Action>Start Free <Icon name="arrow" className="h-4 w-4" /></Action><Action secondary>View Demo</Action></div>
          <div className="flex items-center gap-3 pt-2 text-sm text-[#45464d]"><div className="flex -space-x-2">{["AS", "MR", "NK"].map((name, i) => <span key={name} className={`flex h-8 w-8 items-center justify-center rounded-full border-2 border-[#f8f9ff] text-[9px] font-bold text-white ${["bg-[#4b41e1]", "bg-[#213145]", "bg-[#8e7bc7]"][i]}`}>{name}</span>)}</div><span>Trusted by 10,000+ smart asset owners</span></div>
        </div>
        <div className="flex w-full justify-center lg:w-1/2 lg:justify-end"><div className="relative aspect-[4/3] w-full max-w-[560px] overflow-hidden rounded-2xl border border-[#dce9ff] bg-[#e5eeff] shadow-[0_24px_60px_rgba(11,28,48,.18)]"><Image src="/assets/banner-image.png" alt="Modern home workspace with warranty dashboard" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" priority /></div></div>
      </section>

      <section id="features" className="mx-auto w-11/12 max-w-[1440px] py-12">
        <div className="mb-10 text-center"><h2 className="text-3xl font-semibold tracking-[-.02em] text-[#0b1c30]">Intelligent Warranty Management</h2><p className="mx-auto mt-2 max-w-4xl text-sm text-[#45464d] sm:whitespace-nowrap">Everything you need to keep track of your valuable purchases, automated for your peace of mind.</p></div>
        <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
          <article className="relative overflow-hidden rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm md:col-span-2"><FeatureIcon name="scan" purple /><h3 className="mb-2 text-2xl font-semibold">AI-Powered Document Scanning</h3><p className="mb-6 max-w-xl leading-6 text-[#45464d]">Upload a receipt, invoice, or warranty card. Our AI extracts the product details, purchase date, price, seller, and warranty information for your review.</p><div className="flex items-center gap-4 rounded-xl border border-[#c6c6cd] bg-[#f8f9ff] p-4"><div className="relative flex h-20 w-16 shrink-0 items-center justify-center overflow-hidden rounded border border-[#c6c6cd] bg-[#dce9ff]"><Icon name="receipt" className="h-7 w-7 text-[#45464d]" /><div className="scan-line absolute left-0 top-0 h-0.5 w-full bg-[#4b41e1] shadow-[0_0_8px_#4b41e1]" /></div><div className="flex min-w-0 flex-1 flex-col gap-2"><div className="h-3 w-3/4 rounded bg-[#d3e4fe]" /><div className="h-3 w-1/2 rounded bg-[#d3e4fe]" /><div className="mt-1 flex flex-wrap gap-1.5">{["PRODUCT", "BRAND", "MODEL", "SERIAL", "CATEGORY", "DATE", "PRICE", "SELLER", "INVOICE", "WARRANTY"].map((field) => <span key={field} className="rounded bg-[#e2dfff] px-2 py-1 text-[9px] font-bold text-[#4b41e1]">{field} FOUND</span>)}</div></div></div></article>
          <article className="flex flex-col rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm"><FeatureIcon name="calendar" /><h3 className="mb-2 text-lg font-semibold">Proactive Alerts</h3><p className="flex-1 leading-6 text-[#45464d]">Never let a warranty slip away. Get notified 30, 14, and 3 days before expiration via email or push notification.</p><div className="mt-6 rounded-lg border border-[#efb8bd] bg-[#fff1f2] p-3 shadow-[0_2px_8px_rgba(186,26,26,.06)]"><div className="flex items-center gap-2 text-xs font-semibold text-[#a81414]"><Icon name="warning" className="h-4 w-4 text-[#ba1a1a]" />Expiring Soon</div><p className="mt-2 text-sm text-[#7d2b32]">Sony Headphones coverage ends in 14 days.</p></div></article>
          <article className="rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm"><FeatureIcon name="vault" /><h3 className="mb-2 text-lg font-semibold">Centralized Vault</h3><p className="leading-6 text-[#45464d]">Store manuals, receipts, and warranty documents in one secure place. Accessible anywhere, anytime.</p></article>
          <article id="how-it-works" className="flex flex-col items-center gap-6 rounded-2xl border border-[#d3e4fe] bg-white p-8 shadow-sm md:col-span-2 md:flex-row"><div className="flex-1"><FeatureIcon name="support" /><h3 className="mb-2 text-2xl font-semibold">One-Click Claim Initiation</h3><p className="leading-6 text-[#45464d]">When something breaks, we gather all the necessary documentation into a single packet and provide the manufacturer&apos;s direct contact flow.</p></div><div className="relative flex aspect-square w-full items-center justify-center rounded-xl border border-[#c6c6cd] bg-[#f8f9ff] md:w-64"><div className="absolute h-40 w-32 rotate-3 rounded border border-[#d3e4fe] bg-[#eff4ff] shadow-sm" /><div className="relative z-10 flex h-40 w-32 -rotate-6 flex-col gap-2 rounded border border-[#dce9ff] bg-white p-3 shadow-md"><div className="h-2 rounded bg-[#d3e4fe]" /><div className="h-2 w-3/4 rounded bg-[#d3e4fe]" /><span className="mt-auto ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-[#645efb] text-white"><Icon name="check" className="h-4 w-4" /></span></div></div></article>
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
            <div className="my-1 text-5xl font-bold">${plans.BASIC.price}<span className="text-base font-normal text-[#45464d]">/mo</span></div>
            <p className="mb-6 border-b border-[#dce9ff] pb-5 leading-6 text-[#45464d]">Perfect for individuals starting to organize their major purchases.</p>
            <PlanFeatures assetLimit={plans.BASIC.assetLimit}/>
            <Link href="/register" className="rounded-lg border border-[#c6c6cd] bg-[#dae2fd] px-5 py-2.5 text-center text-sm font-medium hover:bg-[#d3e4fe]">Get Started Free</Link>
          </article>

          <article className="flex min-h-[540px] flex-col rounded-2xl border border-[#d3e4fe] bg-[#f8f9ff] p-8 shadow-sm">
            <h3 className="text-2xl font-semibold">Plus</h3>
            <div className="my-1 text-5xl font-bold">${plans.PLUS.price}<span className="text-base font-normal text-[#45464d]">/mo</span></div>
            <p className="mb-6 border-b border-[#dce9ff] pb-5 leading-6 text-[#45464d]">Enhanced protection for your growing collection of assets.</p>
            <PlanFeatures assetLimit={plans.PLUS.assetLimit}/>
            <Link href="/dashboard/billing" className="rounded-lg bg-[#4b41e1] px-5 py-2.5 text-center text-sm font-semibold text-white shadow-sm transition hover:bg-[#645efb] active:scale-95">Upgrade to Plus</Link>
          </article>

          <article className="relative flex min-h-[540px] flex-col overflow-hidden rounded-2xl border border-[#645efb] bg-[#131b2e] p-8 text-white shadow-lg">
            <span className="absolute right-0 top-0 rounded-bl-lg bg-[#645efb] px-4 py-1.5 text-[11px] font-semibold tracking-wide">RECOMMENDED</span>
            <h3 className="text-2xl font-semibold text-[#7c839b]">Pro</h3>
            <div className="my-1 text-5xl font-bold">${plans.PRO.price}<span className="text-base font-normal text-[#7c839b]">/mo</span></div>
            <p className="mb-6 border-b border-[#3f465c] pb-5 leading-6 text-[#7c839b]">The ultimate vault for power users and families.</p>
            <PlanFeatures assetLimit={plans.PRO.assetLimit} dark/>
            <Link href="/dashboard/billing" className="rounded-lg bg-[#e2dfff] px-5 py-2.5 text-center text-sm font-medium text-[#0f0069] hover:bg-[#c3c0ff]">Upgrade to Pro</Link>
          </article>
        </div>
      </section>

      <section className="mx-auto w-11/12 max-w-[1440px] py-16">
        <div className="relative isolate overflow-hidden rounded-[32px] border border-[#7569ff] bg-[#111a31] px-6 py-8 text-white shadow-[0_28px_80px_rgba(15,24,50,.22)] sm:px-10 sm:py-12 lg:px-14">
          <div className="pointer-events-none absolute -right-24 -top-32 -z-10 h-96 w-96 rounded-full bg-[#645efb]/35 blur-3xl"/>
          <div className="pointer-events-none absolute -bottom-40 left-1/4 -z-10 h-80 w-80 rounded-full bg-[#3f8cff]/20 blur-3xl"/>
          <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(120deg,rgba(255,255,255,.045)_1px,transparent_1px)] bg-[size:28px_28px] [mask-image:linear-gradient(to_right,black,transparent)]"/>

          <div className="grid items-center gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(340px,.85fr)] lg:gap-16">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1.5 text-xs font-semibold tracking-wide text-[#d9d5ff]"><Icon name="shield" className="h-4 w-4"/>Your purchases deserve a memory</div>
              <h2 className="mt-6 max-w-3xl text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-4xl lg:text-[46px]">When something breaks, your proof should already be ready.</h2>
              <p className="mt-5 max-w-2xl text-base leading-7 text-[#bfc6d9]">Keep the receipt, original condition, warranty details, claims, and service history together—before you ever need them.</p>
              <div className="mt-7 flex flex-wrap gap-3">{["AI-assisted setup", "Condition evidence", "Claim-ready history"].map((benefit) => <span key={benefit} className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[.07] px-3.5 py-2 text-xs font-medium text-[#e7e9f4]"><span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#6d63ff] text-white"><Icon name="check" className="h-3 w-3"/></span>{benefit}</span>)}</div>
            </div>

            <div className="rounded-2xl border border-white/15 bg-white/[.08] p-5 shadow-2xl backdrop-blur-sm sm:p-6">
              <p className="text-xs font-semibold uppercase tracking-[.18em] text-[#aaa3ff]">Start in minutes</p>
              <div className="mt-5 space-y-4">{[
                ["01", "Upload a purchase document", "Receipt, invoice, or warranty card"],
                ["02", "Review the AI-filled details", "Correct anything before it is saved"],
                ["03", "Build a claim-ready record", "Documents and condition stay together"],
              ].map(([number, title, description]) => <div key={number} className="flex gap-3 rounded-xl border border-white/10 bg-[#0b1328]/55 p-3.5"><span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#645efb] text-xs font-bold">{number}</span><div><p className="text-sm font-semibold text-white">{title}</p><p className="mt-1 text-xs leading-5 text-[#aeb6ca]">{description}</p></div></div>)}</div>
              <Link href="/register" className="mt-5 flex min-h-12 w-full items-center justify-center gap-2 rounded-xl bg-white px-5 py-3 text-sm font-semibold text-[#191342] shadow-lg transition hover:bg-[#eeeaff] active:scale-[.99]">Create your free wallet <Icon name="arrow" className="h-4 w-4"/></Link>
              <p className="mt-3 text-center text-[11px] text-[#9da6bb]">Free for up to {plans.BASIC.assetLimit} assets · No credit card required</p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
