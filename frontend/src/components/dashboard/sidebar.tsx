"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { toast } from "@/lib/notifications";

const items = [
  ["dashboard", "Overview", "/dashboard"], ["products", "My Products", "/dashboard/products"], ["documents", "Documents", "/dashboard/documents"], ["notifications", "Notifications", "/dashboard/notifications"], ["profile", "Profile", "/dashboard/profile"], ["settings", "Settings", "/dashboard/settings"],
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  async function handleLogout() {
    try {
      await logout();
      void toast.success("You have been logged out");
      router.replace("/");
    } catch {
      void toast.error("Could not log you out. Please try again.");
    }
  }

  return <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#dce9ff] bg-white lg:flex"><div className="flex h-16 items-center border-b border-[#dce9ff] px-5"><Logo /></div><nav className="flex-1 space-y-1 p-4">{items.map(([icon,label,href]) => { const active = pathname === href; return <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${active ? "bg-[#e2dfff] text-[#3323cc]" : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"}`}><Icon name={icon} className="h-5 w-5"/>{label}</Link>; })}</nav><div className="border-t border-[#dce9ff] p-4"><button onClick={handleLogout} className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#45464d] hover:bg-[#eff4ff]"><Icon name="logout" className="h-5 w-5"/>Log out</button></div></aside>;
}
