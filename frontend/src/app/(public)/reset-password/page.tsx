import { Suspense } from "react";
import { AuthVisual } from "@/components/auth/auth-visual";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { Loading } from "@/components/ui/loading";

export default function ResetPasswordPage() {
  return <div className="flex min-h-[calc(100vh-4rem)] w-full"><AuthVisual/><Suspense fallback={<section className="w-full lg:w-1/2"><Loading fullScreen={false} className="min-h-[calc(100vh-4rem)]" label="Preparing password reset"/></section>}><ResetPasswordForm/></Suspense></div>;
}
