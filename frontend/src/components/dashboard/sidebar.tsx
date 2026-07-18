import Link from "next/link";
import { Logo } from "@/components/logo";
import { Icon } from "@/components/icons";

const items = [
  ["dashboard", "Overview", "/dashboard"], ["products", "My Products", "/dashboard/products"], ["documents", "Documents", "/dashboard/documents"], ["notifications", "Notifications", "/dashboard/notifications"], ["profile", "Profile", "/dashboard/profile"], ["settings", "Settings", "/dashboard/settings"],
] as const;

export function Sidebar() {
  return <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col border-r border-[#dce9ff] bg-white lg:flex"><div className="flex h-16 items-center border-b border-[#dce9ff] px-5"><Logo /></div><nav className="flex-1 space-y-1 p-4">{items.map(([icon,label,href], index) => <Link key={href} href={href} className={`flex items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium transition ${index === 0 ? "bg-[#e2dfff] text-[#3323cc]" : "text-[#45464d] hover:bg-[#eff4ff] hover:text-[#0b1c30]"}`}><Icon name={icon} className="h-5 w-5"/>{label}</Link>)}</nav><div className="border-t border-[#dce9ff] p-4"><button className="flex w-full items-center gap-3 rounded-lg px-3 py-3 text-sm font-medium text-[#45464d] hover:bg-[#eff4ff]"><Icon name="logout" className="h-5 w-5"/>Log out</button></div></aside>;
}
