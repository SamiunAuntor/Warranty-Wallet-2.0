import { Sidebar } from "@/components/dashboard/sidebar";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/auth/auth-guard";
import { UserAvatar } from "@/components/dashboard/user-avatar";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <AuthGuard><div className="min-h-screen bg-[#f8f9ff]"><Sidebar/><header className="flex h-16 items-center border-b border-[#dce9ff] bg-white px-4 lg:ml-64 lg:justify-end"><div className="lg:hidden"><Logo /></div><UserAvatar /></header><main className="p-5 lg:ml-64 lg:p-8">{children}</main></div></AuthGuard>;
}
