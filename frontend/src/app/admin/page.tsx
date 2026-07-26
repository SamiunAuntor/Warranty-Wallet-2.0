"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { AdminCharts } from "@/components/admin/admin-charts";
import { useAuth } from "@/contexts/auth-context";
import { getAdminStats, type AdminStats } from "@/lib/admin-api";

export default function AdminPage() {
  const { firebaseUser } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [error, setError] = useState("");
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then(getAdminStats).then(setStats).catch((reason) => setError(reason instanceof Error ? reason.message : "Could not load overview.")); }, [firebaseUser]);
  if (!stats && !error) return <Loading label="Loading admin overview"/>;
  if (!stats) return <p className="rounded-xl border border-red-200 bg-white p-8 text-red-700">{error}</p>;
  const cards = [
    ["Users", stats.totalUsers, `${stats.activeUsers} active`, "profile", "/admin/users"],
    ["Paid users", stats.paidUsers, `${Math.round((stats.paidUsers / Math.max(1, stats.totalUsers)) * 100)}% conversion`, "shield", "/admin/users"],
    ["Assets", stats.totalProducts, "Across all accounts", "products", "/admin/assets"],
    ["Revenue", `$${Number(stats.totalRevenue).toFixed(2)}`, `${stats.totalPayments} payments`, "clipboard", "/admin/payments"],
  ] as const;
  return <div className="mx-auto max-w-[1440px] pb-10">
    <header><h1 className="text-3xl font-semibold text-[#111d32]">Admin Overview</h1><p className="mt-1 text-sm text-[#626773]">Platform health, growth, and operational activity.</p></header>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, detail, icon, href]) => <Link href={href} key={label} className="rounded-xl border bg-white p-5 shadow-sm hover:border-[#8b7dff]"><div className="flex justify-between"><p className="text-sm font-semibold text-[#626773]">{label}</p><Icon name={icon} className="h-5 w-5 text-[#5b47ee]"/></div><p className="mt-4 text-3xl font-semibold">{value}</p><p className="mt-2 text-xs text-[#777d88]">{detail}</p></Link>)}</div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Active accounts" value={stats.activeUsers}/><Metric label="Blocked accounts" value={stats.blockedUsers}/><Metric label="Categories" value={stats.totalCategories}/></div>
    <div className="mt-6"><AdminCharts/></div>
  </div>;
}
function Metric({ label, value }: { label: string; value: number }) { return <section className="rounded-xl border bg-white p-5"><p className="text-sm font-semibold">{label}</p><p className="mt-4 text-2xl font-semibold text-[#5b47ee]">{value}</p></section>; }
