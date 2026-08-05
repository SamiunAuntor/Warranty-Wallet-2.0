"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { BarChart3, BellRing, Boxes, CreditCard, FileDown, FolderTree, LayoutDashboard, ShieldCheck, Tags, Users, ExternalLink } from "lucide-react";

const links = [
  [LayoutDashboard, "Overview", "/admin"], [Users, "Users", "/admin/users"],
  [Boxes, "Assets", "/admin/assets"], [ShieldCheck, "Claims", "/admin/claims"],
  [FolderTree, "Categories", "/admin/categories"], [Tags, "Brands", "/admin/brands"],
  [CreditCard, "Payments", "/admin/payments"], [BellRing, "Announcements", "/admin/notifications"],
  [FileDown, "Reports & audit", "/admin/reports"],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 bg-[#f0efff] text-[#182238] shadow-[4px_0_24px_rgba(36,31,82,0.08)] lg:block">
    <div className="px-5 pb-4 pt-6"><Logo/><div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white px-3 py-1.5 text-[11px] font-semibold text-[#6558d9] shadow-sm"><BarChart3 className="h-3.5 w-3.5"/>Administration</div></div>
    <nav className="space-y-1 px-3 py-3">{links.map(([NavIcon, label, href]) => {
      const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
      return <Link key={href} href={href} className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${active ? "bg-[#5b47ee] font-semibold text-white shadow-lg shadow-[#5b47ee]/20" : "text-[#5d6474] hover:bg-white hover:text-[#322799]"}`}><NavIcon className="h-[18px] w-[18px]"/>{label}</Link>;
    })}</nav>
    <Link href="/dashboard" className="absolute bottom-5 left-3 right-3 flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#5d6474] shadow-sm transition hover:text-[#5141df]">Open user dashboard <ExternalLink className="h-4 w-4"/></Link>
  </aside>;
}
