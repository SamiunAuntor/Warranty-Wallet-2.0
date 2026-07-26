"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
export function AdminGuard({ children }: { children: React.ReactNode }) {
  const { firebaseUser, appUser, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading && (!firebaseUser || !appUser)) router.replace("/login?next=/admin");
    else if (!loading && appUser?.role !== "ADMIN") router.replace("/dashboard");
  }, [appUser, firebaseUser, loading, router]);
  if (loading || !firebaseUser || appUser?.role !== "ADMIN") return <Loading label="Checking administrator access"/>;
  return children;
}
