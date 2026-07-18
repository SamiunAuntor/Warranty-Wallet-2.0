import { Suspense } from "react";
import { AuthVisual } from "@/components/auth/auth-visual";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default function ResetPasswordPage() {
  return <div className="flex min-h-[calc(100vh-4rem)] w-full"><AuthVisual/><Suspense fallback={<section className="flex w-full items-center justify-center lg:w-1/2">Validating reset link...</section>}><ResetPasswordForm/></Suspense></div>;
}
