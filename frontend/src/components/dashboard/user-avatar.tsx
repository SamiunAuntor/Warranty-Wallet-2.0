"use client";

import { useAuth } from "@/contexts/auth-context";

export function UserAvatar() {
  const { appUser } = useAuth();
  const initial = appUser?.name.trim().charAt(0).toUpperCase() || "U";

  return <div title={appUser?.name} className="ml-auto flex h-9 w-9 overflow-hidden rounded-full bg-[#e2dfff] text-sm font-bold text-[#3323cc]">{appUser?.photoURL ? <img src={appUser.photoURL} alt={appUser.name} className="h-full w-full object-cover"/> : <span className="flex h-full w-full items-center justify-center">{initial}</span>}</div>;
}
