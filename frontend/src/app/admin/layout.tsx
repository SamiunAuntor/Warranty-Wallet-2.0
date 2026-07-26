import { AdminGuard } from "@/components/admin/admin-guard";
import { AdminSidebar } from "@/components/admin/admin-sidebar";
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <AdminGuard><div className="min-h-screen bg-[#f6f7fb]"><AdminSidebar/><header className="flex h-16 items-center border-b bg-white px-5 lg:ml-64"><p className="font-semibold text-[#172033]">Warranty Wallet Admin</p></header><main className="p-5 lg:ml-64 lg:p-7">{children}</main></div></AdminGuard>;
}
