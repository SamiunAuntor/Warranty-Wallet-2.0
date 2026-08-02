"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { getDashboard, type DashboardData } from "@/lib/dashboard-api";

const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const relativeDays = (value: string) => Math.max(0, Math.ceil((new Date(value).getTime() - Date.now()) / 86_400_000));

function Panel({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-[#e2e4eb] bg-white shadow-[0_2px_7px_rgba(24,32,56,.06)] ${className}`}>{children}</section>;
}

export default function DashboardPage() {
  const { firebaseUser } = useAuth();
  const [data, setData] = useState<DashboardData | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!firebaseUser) return;
    firebaseUser.getIdToken().then(getDashboard).then(setData).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load dashboard."));
  }, [firebaseUser]);

  if (!data && !error) return <Loading label="Loading dashboard"/>;
  if (error) return <div className="rounded-xl border border-red-200 bg-white p-8 text-center text-sm text-red-700">{error}</div>;
  if (!data) return null;

  const stats = [
    { label: "Total Assets", value: data.products.total, icon: "clipboard", color: "text-[#27364b]" },
    { label: "Active Warranties", value: data.products.active, icon: "shield", color: "text-[#4b41e1]" },
    { label: "Expiring Soon", value: data.products.expiringSoon, icon: "warning", color: "text-[#a81414]" },
    { label: "Open Claims", value: data.claims.open, icon: "claims", color: "text-[#27364b]" },
  ] as const;
  const healthDegrees = Math.round(data.warrantyHealth * 3.6);

  return <div className="mx-auto w-full max-w-[1440px] pb-8">
    <header className="mb-6"><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#0b1c30]">Overview</h1><p className="mt-1 text-sm text-[#45464d]">Here&apos;s what&apos;s happening with your assets today.</p></header>
    <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{stats.map((stat) => <Panel key={stat.label} className="p-4"><div className={`flex items-center gap-2 text-xs font-semibold ${stat.color}`}><Icon name={stat.icon} className="h-5 w-5"/><span>{stat.label}</span></div><p className="mt-3 text-2xl font-semibold leading-none text-[#07162b]">{stat.value}</p></Panel>)}</div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[315px_minmax(0,1fr)]">
      <Panel className="flex min-h-[344px] flex-col items-center p-6"><h2 className="w-full text-sm font-medium text-[#17243a]">Warranty Health Score</h2><div style={{ background: `conic-gradient(#5043e8 0deg ${healthDegrees}deg,#dce8ff ${healthDegrees}deg 360deg)` }} className="relative mt-9 flex h-40 w-40 items-center justify-center rounded-full"><div className="flex h-[132px] w-[132px] flex-col items-center justify-center rounded-full bg-white"><strong className="text-3xl text-[#07162b]">{data.warrantyHealth}</strong><span className="text-xs font-semibold">/100</span></div></div><p className="mt-5 text-center text-sm text-[#26354a]">{data.products.expiringSoon ? `${data.products.expiringSoon} warranties need attention soon.` : "Your tracked warranties are in good shape."}</p></Panel>
      <Panel className="min-h-[344px] overflow-hidden"><div className="flex h-14 items-center justify-between border-b px-4"><h2 className="text-sm font-medium">Upcoming expirations</h2><Link href="/dashboard/assets" className="text-xs font-medium text-[#4b41e1]">View all</Link></div>{data.warrantyTimeline.length ? data.warrantyTimeline.slice(0, 5).map((asset) => <div key={asset.id} className="flex items-center gap-4 border-b px-4 py-4"><Icon name="products" className="h-5 w-5 text-[#4b41e1]"/><div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{asset.name}</p><p className="text-xs text-[#626773]">{date.format(new Date(asset.expiryDate))}</p></div><span className="rounded-full bg-[#fff2f0] px-3 py-1 text-xs font-semibold text-[#9f1717]">{relativeDays(asset.expiryDate)} days</span></div>) : <p className="p-8 text-center text-sm text-[#626773]">No upcoming warranty expirations.</p>}</Panel>
    </div>
    <div className="mt-6 grid gap-6 xl:grid-cols-[315px_minmax(0,1fr)]">
      <Panel className="min-h-[200px] p-4"><div className="flex justify-between"><h2 className="text-sm font-medium">Recent asset files</h2><Link href="/dashboard/assets" className="text-xs text-[#4b41e1]">View assets</Link></div><div className="mt-4 space-y-4">{data.documents.recent.length ? data.documents.recent.map((document) => <div key={document.id} className="flex items-center gap-3"><Icon name="documents" className="h-5 w-5 text-[#777d88]"/><div className="min-w-0"><p className="truncate text-sm">{document.fileName}</p><p className="truncate text-[10px] text-[#626773]">{document.product.name}</p></div></div>) : <p className="text-sm text-[#626773]">No asset files uploaded yet.</p>}</div></Panel>
      <Panel className="min-h-[200px] border-[#d9d0ff] p-4"><h2 className="flex items-center gap-2 text-sm font-medium"><Icon name="sparkles" className="h-6 w-6 text-[#604cf2]"/>AI document extraction</h2><div className="mt-5 rounded-lg bg-[#f6f7fc] p-5"><p className="text-3xl font-semibold text-[#4b41e1]">{data.documents.aiProcessing}</p><p className="mt-1 text-sm text-[#626773]">documents awaiting extraction</p><p className="mt-4 text-xs text-[#626773]">{data.documents.total} total documents stored securely.</p></div></Panel>
    </div>
  </div>;
}
