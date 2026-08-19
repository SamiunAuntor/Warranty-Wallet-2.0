"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Sidebar } from "@/components/dashboard/sidebar";
import { Logo } from "@/components/logo";
import { AuthGuard } from "@/components/auth/auth-guard";
import { NotificationCenter } from "@/components/dashboard/notification-center";
import { PreferencesProvider } from "@/contexts/preferences-context";

export default function DashboardLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return <AuthGuard><PreferencesProvider><div className="min-h-screen bg-[#f8f9ff]"><Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)}/><header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b border-[#e6e8ef] bg-white/95 px-5 backdrop-blur lg:ml-64 lg:justify-end"><div className="flex items-center gap-3 lg:hidden"><button type="button" aria-label="Open dashboard menu" onClick={() => setMobileOpen(true)} className="flex h-9 w-9 items-center justify-center rounded-lg text-[#172033] hover:bg-[#f1f3f8]"><Menu className="h-5 w-5"/></button><Logo/></div><NotificationCenter/></header><main className="p-5 lg:ml-64 lg:p-6 xl:p-7">{children}</main></div></PreferencesProvider></AuthGuard>;
}
