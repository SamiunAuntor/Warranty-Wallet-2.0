import { Sidebar } from "@/components/dashboard/sidebar";
import { Logo } from "@/components/logo";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <div className="min-h-screen bg-[#f8f9ff]"><Sidebar/><header className="flex h-16 items-center border-b border-[#dce9ff] bg-white px-4 lg:ml-64 lg:justify-end"><div className="lg:hidden"><Logo /></div><div className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#e2dfff] text-sm font-bold text-[#3323cc]">A</div></header><main className="p-5 lg:ml-64 lg:p-8">{children}</main></div>;
}
