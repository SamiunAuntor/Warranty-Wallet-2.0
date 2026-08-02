import { Sidebar } from "@/components/dashboard/sidebar";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/auth/auth-guard";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { PreferencesProvider } from "@/contexts/preferences-context";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard><PreferencesProvider><div className="min-h-screen bg-[#f8f9ff]"><Sidebar/><header className="flex h-14 items-center border-b border-[#e6e8ef] bg-white px-5 lg:ml-64 lg:justify-end"><div className="lg:hidden"><Logo/></div><NotificationCenter/></header><main className="p-5 lg:ml-64 lg:p-6 xl:p-7">{children}</main></div></PreferencesProvider></AuthGuard>;
}
