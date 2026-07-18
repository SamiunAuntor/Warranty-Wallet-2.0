"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/auth-context";
import { Loading } from "@/components/ui/loading";

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
    return <Loading label="Checking your session" />;
  }

  return children;
}
