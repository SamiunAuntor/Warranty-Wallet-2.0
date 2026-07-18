"use client";

import { useAuth } from "@/contexts/auth-context";

export function UserAvatar() {
  const { appUser } = useAuth();
  const initial = appUser?.name.trim().charAt(0).toUpperCase() || "U";

  return <div title={appUser?.name} className="ml-auto flex h-9 w-9 items-center justify-center rounded-full bg-[#e2dfff] text-sm font-bold text-[#3323cc]">{initial}</div>;
}
