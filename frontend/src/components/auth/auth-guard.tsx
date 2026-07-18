"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (!loading && (!firebaseUser || !appUser)) {
      router.replace(`/login?next=${encodeURIComponent(pathname)}`);
    }
  }, [loading, firebaseUser, appUser, pathname, router]);

  if (loading || !firebaseUser || !appUser) {
    return <div className="flex min-h-screen items-center justify-center bg-[#f8f9ff]"><div className="h-9 w-9 animate-spin rounded-full border-4 border-[#e2dfff] border-t-[#4b41e1]"/><span className="sr-only">Checking your session</span></div>;
  }

  return children;
}
