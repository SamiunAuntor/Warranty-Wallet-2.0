import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard><div className="min-h-screen bg-[#f6f7fb]"><AdminSidebar/><header className="sticky top-0 z-30 flex h-16 items-center bg-white/90 px-5 shadow-[0_1px_0_#e8eaf0] backdrop-blur lg:ml-64"><p className="font-semibold text-[#172033]">Administration</p><span className="ml-3 rounded-full bg-[#eeecff] px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-[#5848df]">Secure workspace</span></header><main className="p-5 lg:ml-64 lg:p-8">{children}</main></div></AdminGuard>;
}
