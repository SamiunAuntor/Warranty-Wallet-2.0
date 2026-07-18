import { Icon } from "@/components/icons";

const filters = [
  ["Status", "All Statuses"],
  ["Category", "All Categories"],
  ["Vault", "Main Residence"],
] as const;

const assets = [
  { name: 'MacBook Pro 16"', meta: "Apple • Electronics", state: "Active", tone: "green", icon: "laptop", firstLabel: "Expires", firstValue: "Oct 14, 2025", secondLabel: "Value", secondValue: "$2,499", note: "Claim Ready: 100% Docs Valid" },
  { name: "iPad Pro", meta: "Apple • Electronics", state: "Expiring (14d)", tone: "amber", icon: "laptop", firstLabel: "Expires", firstValue: "Nov 02, 2023", secondLabel: "Value", secondValue: "$1,099", note: "Renew Coverage" },
  { name: "Sony WH-1000XM5", meta: "Sony • Audio", state: "Claim in Progress", tone: "violet", icon: "headphones", firstLabel: "Filed On", firstValue: "Oct 18, 2023", secondLabel: "Est. Resolution", secondValue: "3 Days", note: "AI parsing vendor response…" },
  { name: "Apple Watch Ultra", meta: "Apple • Wearables", state: "Expired", tone: "red", icon: "watch", firstLabel: "Expired On", firstValue: "Sep 12, 2023", secondLabel: "", secondValue: "", note: "Coverage lapsed. Missing original receipt." },
] as const;

const tones = {
  green: { border: "border-t-[#66bf8a]", badge: "bg-[#e5f7ed] text-[#2c8657]", note: "bg-[#eef3ff] text-[#3f7a62]" },
  amber: { border: "border-t-[#eca82e]", badge: "bg-[#fff3df] text-[#a75a0a]", note: "border border-[#c8cbd4] bg-white text-[#17243a]" },
  violet: { border: "border-[#c6b6ff] border-t-[#7745f5]", badge: "bg-[#eee6ff] text-[#6c39df]", note: "border border-[#d8c8ff] bg-[#f8f4ff] text-[#6335d1]" },
  red: { border: "border-t-[#d97982]", badge: "bg-[#fdecef] text-[#b74d5d]", note: "bg-[#eef1fa] text-[#777987]" },
} as const;

export default function AssetsPage() {
  return <div className="mx-auto w-full max-w-[1440px] pb-10"><div className="flex flex-col gap-5 xl:flex-row xl:items-center xl:justify-between"><header><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Asset Portfolio</h1><p className="mt-1 max-w-72 text-base leading-6 text-[#45464d]">Manage and track your warranties across all vaults.</p></header><div className="flex flex-1 flex-wrap items-center gap-2 xl:max-w-[720px]"><div className="relative min-w-56 flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7280]"/><input aria-label="Search assets" placeholder="Search assets..." className="h-11 w-full rounded-lg border border-transparent bg-[#eaf0ff] pl-11 pr-4 text-sm outline-none transition focus:border-[#4b41e1] focus:bg-white"/></div><button className="flex h-11 items-center gap-2 rounded-lg border border-[#c9ccd5] bg-white px-4 text-sm font-medium"><Icon name="search" className="h-4 w-4"/>Search</button><div className="flex h-11 overflow-hidden rounded-lg border border-[#c9ccd5] bg-white"><button aria-label="Grid view" className="bg-[#eaf0ff] px-3 text-[#27364b]"><Icon name="dashboard" className="h-5 w-5"/></button><button aria-label="List view" className="border-l border-[#c9ccd5] px-3 text-[#4e5562]"><Icon name="list" className="h-5 w-5"/></button></div><button className="flex h-11 items-center gap-2 rounded-lg bg-black px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#172033]"><Icon name="plus" className="h-4 w-4"/>Add Asset</button></div></div>

    <section className="mt-8 flex flex-wrap items-center gap-4 rounded-xl border border-[#ced1da] bg-white/70 p-4 shadow-sm">{filters.map(([label, value]) => <label key={label} className="flex items-center gap-2 text-sm font-medium text-[#17243a]"><span>{label}:</span><select className="h-10 rounded-lg border border-[#c9ccd5] bg-white px-3 pr-9 text-sm font-normal outline-none focus:border-[#4b41e1]"><option>{value}</option></select></label>)}<button className="ml-auto flex items-center gap-2 text-sm font-medium text-[#4b41e1]"><Icon name="filter" className="h-4 w-4"/>More Filters</button></section>

    <section className="mt-6 grid gap-6 sm:grid-cols-2 xl:grid-cols-4">{assets.map((asset) => { const tone = tones[asset.tone]; return <article key={asset.name} className={`overflow-hidden rounded-xl border border-[#dfe2ea] border-t-4 bg-white shadow-[0_2px_7px_rgba(24,32,56,.06)] ${tone.border}`}><div className="flex gap-4 bg-[#f8f9fd] p-4"><div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-lg border border-[#dce1eb] bg-gradient-to-br from-white to-[#dfe5e8] text-[#27364b]"><Icon name={asset.icon} className="h-9 w-9"/></div><div className="min-w-0 flex-1"><div className="flex items-start gap-2"><h2 className="truncate text-lg font-semibold text-[#172033]">{asset.name}</h2><button aria-label={`More options for ${asset.name}`} className="ml-auto shrink-0"><Icon name="more" className="h-5 w-5"/></button></div><p className="truncate text-sm text-[#686d77]">{asset.meta}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${tone.badge}`}>{asset.state}</span></div></div><div className="min-h-[158px] border-t border-[#e5e7ee] p-4"><div className="flex justify-between gap-4"><div><p className="text-xs font-medium text-[#6a6f78]">{asset.firstLabel}</p><p className={`mt-1 text-sm font-medium ${asset.tone === "red" || asset.tone === "amber" ? "text-[#b55245]" : "text-[#17243a]"}`}>{asset.firstValue}</p></div>{asset.secondLabel && <div className="text-right"><p className="text-xs font-medium text-[#6a6f78]">{asset.secondLabel}</p><p className="mt-1 text-sm font-medium text-[#17243a]">{asset.secondValue}</p></div>}</div><div className={`mt-8 flex min-h-12 items-center justify-center gap-2 rounded-lg px-3 text-center text-xs font-semibold ${tone.note}`}>{asset.tone === "green" && <Icon name="shield" className="h-4 w-4 shrink-0"/>}{asset.tone === "violet" && <Icon name="scan" className="h-4 w-4 shrink-0"/>}{asset.tone === "red" && <Icon name="warning" className="h-4 w-4 shrink-0"/>}{asset.note}</div></div></article>; })}</section>
  </div>;
}
