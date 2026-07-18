import { Icon } from "@/components/icons";

const stats = [
  { label: "Total Products", value: "142", icon: "clipboard", color: "text-[#27364b]" },
  { label: "Active Warranties", value: "89", icon: "shield", color: "text-[#4b41e1]" },
  { label: "Expiring Soon", value: "12", icon: "warning", color: "text-[#a81414]" },
  { label: "Open Claims", value: "3", icon: "claims", color: "text-[#27364b]" },
] as const;

const expiringAssets = [
  { name: 'MacBook Pro 16"', detail: "AppleCare+ • IT Dept", days: 14, icon: "laptop" },
  { name: "Canon imageRUNNER ADVANCE", detail: "Standard • Office A", days: 22, icon: "printer" },
] as const;

const documents = [
  { name: "Dell_Servers_Invoice.pdf", time: "Added 2 hrs ago" },
  { name: "Office_Chairs_Receipt.jpg", time: "Added yesterday" },
] as const;

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[#e2e4eb] bg-white shadow-[0_2px_7px_rgba(24,32,56,.06)] ${className}`}>{children}</section>;
}

export default function DashboardPage() {
  return <div className="mx-auto w-full max-w-[1440px] pb-8"><header className="mb-6"><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#0b1c30]">Overview</h1><p className="mt-1 text-sm text-[#45464d]">Here&apos;s what&apos;s happening with your assets today.</p></header>

    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Panel key={stat.label} className="p-4"><div className={`flex items-center gap-2 text-xs font-semibold ${stat.color}`}><Icon name={stat.icon} className="h-5 w-5"/><span>{stat.label}</span></div><p className="mt-3 text-2xl font-semibold leading-none text-[#07162b]">{stat.value}</p></Panel>)}</div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[315px_minmax(0,1fr)]"><Panel className="flex min-h-[344px] flex-col items-center p-6"><h2 className="w-full text-sm font-medium text-[#17243a]">Warranty Health Score</h2><div className="relative mt-9 flex h-40 w-40 items-center justify-center rounded-full bg-[conic-gradient(#5043e8_0deg_295deg,#dce8ff_295deg_360deg)]"><div className="flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl text-[#07162b]">82</strong><span className="text-xs font-semibold">/100</span></div></div><p className="mt-5 max-w-60 text-center text-sm leading-5 text-[#26354a]">Your portfolio is well protected.<br/>Consider extending coverage on 4 items.</p></Panel>

      <Panel className="min-h-[344px] overflow-hidden"><div className="flex h-14 items-center justify-between border-b border-[#e7e8ee] px-4"><h2 className="text-sm font-medium text-[#0b1c30]">Expiring Soon</h2><button className="text-xs font-medium text-[#4b41e1] hover:underline">View All</button></div>{expiringAssets.map((asset) => <div key={asset.name} className="flex items-center gap-4 border-b border-[#eff0f4] px-4 py-4 last:border-b-0"><div className="flex h-11 w-11 shrink-0 items-center justify-center rounded bg-[#e4edff] text-[#0b1c30]"><Icon name={asset.icon} className="h-5 w-5"/></div><div className="min-w-0 flex-1"><h3 className="truncate text-sm font-medium text-[#07162b]">{asset.name}</h3><p className="mt-1 truncate text-sm text-[#26354a]">{asset.detail}</p></div><span className="rounded-full bg-[#fff2f0] px-3 py-1 text-xs font-semibold text-[#9f1717]">{asset.days} Days Left</span><button aria-label={`More options for ${asset.name}`} className="text-[#4b41e1]"><Icon name="more" className="h-5 w-5"/></button></div>)}</Panel>
    </div>

    <div className="mt-6 grid gap-6 xl:grid-cols-[315px_minmax(0,1fr)]"><Panel className="min-h-[200px] p-4"><h2 className="text-sm font-medium text-[#0b1c30]">Recent Documents</h2><div className="mt-4 space-y-5">{documents.map((document) => <div key={document.name} className="flex items-center gap-4"><Icon name="documents" className="h-5 w-5 shrink-0 text-[#777d88]"/><div className="min-w-0"><p className="truncate text-sm text-[#07162b]">{document.name}</p><p className="mt-1 text-[10px] text-[#565d6b]">{document.time}</p></div></div>)}</div></Panel>

      <Panel className="min-h-[200px] border-[#d9d0ff] p-4 shadow-[0_7px_20px_rgba(75,65,225,.09)]"><div className="flex items-center justify-between"><h2 className="flex items-center gap-2 text-sm font-medium text-[#07162b]"><Icon name="sparkles" className="h-6 w-6 text-[#604cf2]"/>AI Processing Queue</h2><span className="text-xs font-medium text-[#26354a]">2 pending</span></div><div className="mt-4 flex items-center gap-3 rounded border border-[#e5e8f3] bg-[#f6f7fc] p-3"><div className="flex h-8 w-8 items-center justify-center rounded bg-[#ebe8ff] text-[#735df5]"><Icon name="scan" className="h-4 w-4"/></div><span className="min-w-0 flex-1 truncate text-sm text-[#07162b]">IMG_9921.jpg</span><span className="text-xs font-medium text-[#26354a]">Extracting data…</span></div></Panel>
    </div>
  </div>;
}
