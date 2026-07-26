"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

const links = [
  ["dashboard", "Overview", "/admin"], ["profile", "Users", "/admin/users"],
  ["products", "Assets", "/admin/assets"], ["claims", "Claims", "/admin/claims"],
  ["folder", "Categories", "/admin/categories"], ["shield", "Brands", "/admin/brands"],
  ["clipboard", "Payments", "/admin/payments"], ["notifications", "Broadcasts", "/admin/notifications"],
  ["insights", "Reports", "/admin/reports"],
] as const;

export function AdminSidebar() {
  const pathname = usePathname();
  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 border-r border-[#e2e5ec] bg-[#11182c] text-white lg:block">
    <div className="border-b border-white/10 px-4 py-5"><Logo variant="light"/><p className="mt-2 text-xs text-white/55">Administration</p></div>
    <nav className="space-y-1 p-3">{links.map(([icon, label, href]) => {
      const active = pathname === href;
      return <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-4 py-3 text-sm ${active ? "bg-[#5b47ee] font-semibold text-white" : "text-white/70 hover:bg-white/10 hover:text-white"}`}><Icon name={icon} className="h-5 w-5"/>{label}</Link>;
    })}</nav>
    <Link href="/dashboard" className="absolute bottom-5 left-3 right-3 rounded-lg border border-white/15 px-4 py-3 text-center text-sm text-white/75 hover:bg-white/10">User dashboard</Link>
  </aside>;
}
