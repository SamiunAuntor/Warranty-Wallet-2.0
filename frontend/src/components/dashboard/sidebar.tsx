"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/lib/notifications";
import { plans } from "@/constants/plans";

const items = [["dashboard", "Dashboard", "/dashboard"], ["products", "Assets", "/dashboard/assets"], ["claims", "Claims", "/dashboard/claims"]] as const;
const planStyles = { BASIC: "border-[#cbd5e1] bg-[#f1f5f9] text-[#334155]", PLUS: "border-[#c4b5fd] bg-[#f3f0ff] text-[#5b47ee]", PRO: "border-[#f4cf78] bg-[#fff8df] text-[#986600]" } as const;

export function Sidebar() {
  const pathname = usePathname(); const router = useRouter(); const { logout, appUser } = useAuth();
  const initial = appUser?.name.trim().charAt(0).toUpperCase() || "U";
  const planName = appUser ? plans[appUser.plan].name : "Basic";
  const handleLogout = async () => { try { await logout(); void toast.success("You have been logged out"); router.replace("/"); } catch { void toast.error("Could not log you out. Please try again."); } };

  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#e6e8ef] bg-white lg:flex"><div className="px-3 pb-7 pt-5"><Logo/></div><nav className="flex-1 space-y-2 px-3">{items.map(([icon, label, href]) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition ${active ? "border-r-2 border-[#4b41e1] bg-[#eff1ff] text-[#4438e6]" : "text-[#26354a] hover:bg-[#f5f6fb] hover:text-[#4b41e1]"}`}><Icon name={icon} className="h-5 w-5"/>{label}</Link>; })}</nav><div className="mx-3 pb-3"><Link href="/dashboard/billing" className={`mb-3 flex items-center justify-between rounded-xl border px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-sm ${appUser ? planStyles[appUser.plan] : planStyles.BASIC}`}><span><span className="block text-xs font-semibold uppercase tracking-wide">{planName} plan</span><span className="mt-0.5 block text-[11px] opacity-75">View plan & billing</span></span><span aria-hidden="true" className="text-base">→</span></Link><div className="border-t border-[#e6e8ef] pt-3"><Link href="/dashboard/settings" className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm text-[#26354a] hover:bg-[#f5f6fb]"><Icon name="settings" className="h-5 w-5"/>Settings</Link><button onClick={handleLogout} title="Log out" className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left hover:bg-[#f5f6fb]"><span className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#172033] text-xs font-semibold text-white">{appUser?.photoURL ? <img src={appUser.photoURL} alt="" className="h-full w-full object-cover"/> : initial}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#0b1c30]">{appUser?.name || "User"}</span><Icon name="logout" className="h-4 w-4 text-[#7b8190]"/></button></div></div></aside>;
}
