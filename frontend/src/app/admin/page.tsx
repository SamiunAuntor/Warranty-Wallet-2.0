"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { AdminCharts } from "@/components/admin/admin-charts";
import { useAuth } from "@/contexts/auth-context";
import { getAdminStats, type AdminStats } from "@/lib/admin-api";
import { AdminBadge, AdminPageHeader, adminCard } from "@/components/admin/admin-ui";

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
    <AdminPageHeader title="Admin overview" description="A clear view of platform adoption, revenue, and account health." action={<AdminBadge tone="success">SYSTEM ONLINE</AdminBadge>}/>
    <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">{cards.map(([label, value, detail, icon, href]) => <Link href={href} key={label} className={`${adminCard} group p-5 transition hover:-translate-y-0.5 hover:border-[#bdb6ff]`}><div className="flex justify-between"><p className="text-sm font-semibold text-[#626773]">{label}</p><span className="rounded-xl bg-[#eeecff] p-2 text-[#5b47ee]"><Icon name={icon} className="h-5 w-5"/></span></div><p className="mt-4 text-3xl font-bold text-[#172033]">{value}</p><p className="mt-2 text-xs text-[#777d88]">{detail}</p></Link>)}</div>
    <div className="mt-6 grid gap-4 md:grid-cols-3"><Metric label="Active accounts" value={stats.activeUsers} tone="success"/><Metric label="Blocked accounts" value={stats.blockedUsers} tone="danger"/><Metric label="Catalog categories" value={stats.totalCategories} tone="primary"/></div>
    <div className="mt-6"><AdminCharts/></div>
  </div>;
}
function Metric({ label, value, tone }: { label: string; value: number; tone: "success" | "danger" | "primary" }) { const colors = { success: "bg-[#eaf8f0] text-[#28794d]", danger: "bg-[#fff0f1] text-[#ad2831]", primary: "bg-[#eeecff] text-[#5141df]" }; return <section className={`${adminCard} flex items-center justify-between p-5`}><p className="text-sm font-semibold text-[#596172]">{label}</p><span className={`rounded-xl px-4 py-2 text-xl font-bold ${colors[tone]}`}>{value}</span></section>; }
