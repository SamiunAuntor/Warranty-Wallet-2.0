"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/lib/notifications";

const items = [
  ["dashboard", "Dashboard", "/dashboard"], ["products", "Assets", "/dashboard/assets"], ["claims", "Claims", "/dashboard/claims"], ["documents", "Documents", "/dashboard/documents"],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout, appUser } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      void toast.success("You have been logged out");
      router.replace("/");
    } catch {
      void toast.error("Could not log you out. Please try again.");
    }
  }

  const initial = appUser?.name.trim().charAt(0).toUpperCase() || "U";

  return <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-[#e6e8ef] bg-white lg:flex"><div className="px-3 pb-7 pt-5"><Logo/><p className="mt-2 text-[11px] leading-4 text-[#45464d]">{appUser?.plan === "PREMIUM" ? "Pro subscription" : "Free subscription"}</p></div><nav className="flex-1 space-y-2 px-3">{items.map(([icon,label,href]) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-4 rounded-lg px-4 py-3 text-sm font-medium transition ${active ? "border-r-2 border-[#4b41e1] bg-[#eff1ff] text-[#4438e6]" : "text-[#26354a] hover:bg-[#f5f6fb] hover:text-[#4b41e1]"}`}><Icon name={icon} className="h-5 w-5"/>{label}</Link>; })}</nav><div className="mx-3 pb-3"><button className="mb-4 flex w-full items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-[#645efb]"><Icon name="plus" className="h-4 w-4"/>New Claim</button><div className="border-t border-[#e6e8ef] pt-4"><Link href="/dashboard/settings" className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm text-[#26354a] hover:bg-[#f5f6fb]"><Icon name="settings" className="h-5 w-5"/>Settings</Link><Link href="/dashboard/support" className="flex items-center gap-4 rounded-lg px-4 py-3 text-sm text-[#26354a] hover:bg-[#f5f6fb]"><Icon name="support" className="h-5 w-5"/>Support</Link><button onClick={handleLogout} title="Log out" className="mt-2 flex w-full items-center gap-3 rounded-lg px-4 py-2 text-left hover:bg-[#f5f6fb]"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#172033] text-xs font-semibold text-white">{initial}</span><span className="min-w-0 flex-1 truncate text-xs font-semibold text-[#0b1c30]">{appUser?.name || "User"}</span><Icon name="logout" className="h-4 w-4 text-[#7b8190]"/></button></div></div></aside>;
}
