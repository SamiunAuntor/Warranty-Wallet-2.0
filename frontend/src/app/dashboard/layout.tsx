import { Sidebar } from "@/components/dashboard/sidebar";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/auth/auth-guard";
import { Icon } from "@/components/icons";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard><div className="min-h-screen bg-[#f8f9ff]"><Sidebar/><header className="flex h-14 items-center border-b border-[#e6e8ef] bg-white px-5 lg:ml-64 lg:justify-end"><div className="lg:hidden"><Logo /></div><button aria-label="Notifications" className="ml-auto rounded-lg p-2 text-[#27364b] transition hover:bg-[#eff2ff] hover:text-[#4b41e1]"><Icon name="notifications" className="h-5 w-5"/></button></header><main className="p-5 lg:ml-64 lg:p-6 xl:p-7">{children}</main></div></AuthGuard>;
}
