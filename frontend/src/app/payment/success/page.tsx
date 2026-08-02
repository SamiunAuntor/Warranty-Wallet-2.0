"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CircleAlert, LoaderCircle } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/auth-context";
import { syncUser } from "@/lib/auth-api";
import { confirmCheckout } from "@/lib/billing-api";

type State = "confirming" | "success" | "error";

export default function PaymentSuccessPage() {
  const queryClient = useQueryClient();
  const { firebaseUser, loading, setCurrentAppUser } = useAuth();
  const started = useRef(false);
  const [state, setState] = useState<State>("confirming");
  const [message, setMessage] = useState("Confirming your payment and activating your plan.");

  useEffect(() => {
    if (loading || !firebaseUser || started.current) return;
    const sessionId = new URLSearchParams(window.location.search).get("session_id");
    if (!sessionId) {
      setState("error");
      setMessage("The checkout session is missing. Please review your billing history.");
      return;
    }

    started.current = true;
    void (async () => {
      try {
        const token = await firebaseUser.getIdToken();
        await confirmCheckout(token, sessionId);
        setCurrentAppUser(await syncUser(firebaseUser));
        await queryClient.invalidateQueries({ queryKey: ["billing"] });
        setState("success");
        setMessage("Your plan is active and your new asset limit is ready.");
      } catch (error) {
        setState("error");
        setMessage(error instanceof Error ? error.message : "We could not confirm this payment yet.");
      }
    })();
  }, [firebaseUser, loading, queryClient, setCurrentAppUser]);

  const Icon = state === "confirming" ? LoaderCircle : state === "success" ? CheckCircle2 : CircleAlert;
  return <main className="flex min-h-screen items-center justify-center bg-[#f7f8ff] p-5"><section className="w-full max-w-md rounded-2xl border border-[#e0e3ee] bg-white p-8 text-center shadow-[0_18px_50px_rgba(49,46,129,0.10)]"><span className={`mx-auto flex h-14 w-14 items-center justify-center rounded-full ${state === "success" ? "bg-[#eaf8ef] text-[#2f855a]" : state === "error" ? "bg-[#fff0f0] text-[#b02a32]" : "bg-[#efedff] text-[#5847e8]"}`}><Icon className={`h-7 w-7 ${state === "confirming" ? "animate-spin" : ""}`}/></span><h1 className="mt-5 text-2xl font-semibold text-[#111d32]">{state === "confirming" ? "Activating your plan" : state === "success" ? "Plan activated" : "Confirmation delayed"}</h1><p className="mt-2 text-sm leading-6 text-[#686f7c]">{message}</p><Link href="/dashboard/billing" className="mt-6 inline-flex rounded-lg bg-[#5847e8] px-5 py-3 text-sm font-semibold text-white hover:bg-[#4939d0]">View plan & billing</Link></section></main>;
}
