"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BarChart3, BellRing, Boxes, CreditCard, FileDown, FolderTree, LayoutDashboard, LogOut, ShieldCheck, Tags, Users, ExternalLink } from "lucide-react";
import { Logo } from "@/components/logo";
import { useAuth } from "@/contexts/auth-context";

const links = [
  [LayoutDashboard, "Overview", "/admin"],
  [Users, "Users", "/admin/users"],
  [Boxes, "Assets", "/admin/assets"],
  [ShieldCheck, "Claims", "/admin/claims"],
  [FolderTree, "Categories", "/admin/categories"],
  [Tags, "Brands", "/admin/brands"],
  [CreditCard, "Payments", "/admin/payments"],
  [BellRing, "Announcements", "/admin/notifications"],
  [FileDown, "Reports & audit", "/admin/reports"],
] as const;

export function AdminSidebar({ mobileOpen = false, onClose }: { mobileOpen?: boolean; onClose?: () => void }) {
  const pathname = usePathname();
  const router = useRouter();
  const { logout } = useAuth();

  return (
    <>
      {mobileOpen && <div className="fixed inset-0 z-40 bg-[#11182c]/40 lg:hidden" onClick={onClose} />}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#1f2340] text-white shadow-[4px_0_24px_rgba(36,31,82,0.24)] transition-transform duration-200 lg:block lg:w-64 lg:translate-x-0 ${mobileOpen ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="px-5 pb-4 pt-6">
          <Logo variant="light" />
          <div className="mt-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-[11px] font-semibold text-[#d7d5ff] shadow-sm">
            <BarChart3 className="h-3.5 w-3.5" />
            Administration
          </div>
        </div>
        <nav className="space-y-1 px-3 py-3">
          {links.map(([NavIcon, label, href]) => {
            const active = pathname === href || (href !== "/admin" && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition ${
                  active ? "bg-[#5b47ee] font-semibold text-white shadow-lg shadow-[#5b47ee]/20" : "text-[#c8cbe3] hover:bg-white/10 hover:text-white"
                }`}
              >
                <NavIcon className="h-[18px] w-[18px]" />
                {label}
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-5 left-3 right-3 space-y-3">
          <Link
            href="/dashboard"
            onClick={onClose}
            className="flex items-center justify-center gap-2 rounded-xl bg-white px-4 py-3 text-sm font-medium text-[#4d5670] shadow-sm transition hover:text-[#5141df]"
          >
            Open user dashboard
            <ExternalLink className="h-4 w-4" />
          </Link>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={async () => {
                await logout();
                onClose?.();
                router.push("/login");
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </button>
            <button
              type="button"
              onClick={onClose}
              className="flex w-full items-center justify-center rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm font-medium text-white transition hover:bg-white/10 lg:hidden"
            >
              Close
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
