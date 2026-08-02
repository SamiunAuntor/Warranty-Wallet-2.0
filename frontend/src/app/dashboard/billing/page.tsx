"use client";

import { useEffect, useState } from "react";
import { Check, CreditCard, Crown, Sparkles } from "lucide-react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Loading } from "@/components/ui/loading";
import { plans, type UserPlan } from "@/constants/plans";
import { useAuth } from "@/contexts/auth-context";
import {
  cancelSubscription,
  changePlan,
  createCheckout,
  getPayments,
  getSubscription,
  resumeSubscription,
} from "@/lib/billing-api";
import { toast } from "@/lib/notifications";

const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const planRank: Record<UserPlan, number> = { BASIC: 0, PLUS: 1, PRO: 2 };
const planTheme = {
  BASIC: { icon: CreditCard, accent: "text-[#475569]", iconBg: "bg-[#eef2f7]", border: "border-[#dfe3eb]" },
  PLUS: { icon: Sparkles, accent: "text-[#5847e8]", iconBg: "bg-[#efedff]", border: "border-[#cfc9ff]" },
  PRO: { icon: Crown, accent: "text-[#9a6800]", iconBg: "bg-[#fff5d8]", border: "border-[#eed38b]" },
} as const;
const statusStyle: Record<string, string> = {
  SUCCESS: "bg-[#eaf8ef] text-[#2f7d52]",
  PENDING: "bg-[#fff7df] text-[#926300]",
  FAILED: "bg-[#fff0f0] text-[#ad2831]",
  REFUNDED: "bg-[#eef2f7] text-[#526071]",
};

export default function BillingPage() {
  const { firebaseUser, appUser, setCurrentAppUser } = useAuth();
  const queryClient = useQueryClient();
  const [busy, setBusy] = useState<string | null>(null);
  const { data, isPending } = useQuery({
    queryKey: ["billing", firebaseUser?.uid],
    enabled: Boolean(firebaseUser),
    staleTime: 60_000,
    queryFn: async () => {
      const token = await firebaseUser!.getIdToken();
      const [subscription, history] = await Promise.all([getSubscription(token), getPayments(token)]);
      return { subscription, payments: history.data };
    },
  });

  const subscription = data?.subscription ?? null;
  const payments = data?.payments ?? [];
  const currentPlan = subscription?.plan ?? appUser?.plan ?? "BASIC";
  const periodEnd = subscription?.currentPeriodEnd ?? subscription?.expiresAt;

  useEffect(() => {
    if (appUser && appUser.plan !== currentPlan) setCurrentAppUser({ ...appUser, plan: currentPlan });
  }, [appUser, currentPlan, setCurrentAppUser]);

  const refresh = async () => {
    await queryClient.invalidateQueries({ queryKey: ["billing", firebaseUser?.uid] });
  };

  const startCheckout = async (plan: "PLUS" | "PRO") => {
    if (!firebaseUser) return;
    setBusy(plan);
    try {
      const { url } = await createCheckout(await firebaseUser.getIdToken(), plan);
      window.location.assign(url);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not start checkout.");
      setBusy(null);
    }
  };

  const updateSubscription = async (action: "cancel" | "resume" | "PLUS" | "PRO") => {
    if (!firebaseUser) return;
    setBusy(action);
    try {
      const token = await firebaseUser.getIdToken();
      if (action === "cancel") await cancelSubscription(token);
      else if (action === "resume") await resumeSubscription(token);
      else await changePlan(token, action);
      await refresh();
      toast.success(action === "cancel" ? "Cancellation scheduled" : action === "resume" ? "Subscription renewed" : "Plan change saved");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not update your subscription.");
    } finally {
      setBusy(null);
    }
  };

  if (isPending) return <Loading label="Loading your plan" />;

  const CurrentIcon = planTheme[currentPlan].icon;
  return (
    <div className="mx-auto max-w-[1180px] pb-12">
      <header>
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#5b47ee]">Plan & billing</p>
        <h1 className="mt-2 text-3xl font-semibold text-[#111d32]">Choose the space you need</h1>
        <p className="mt-2 text-sm text-[#687080]">Your features stay the same. Upgrade when your asset collection grows.</p>
      </header>

      <section className="mt-6 flex flex-col justify-between gap-5 rounded-2xl border border-[#dedff0] bg-gradient-to-r from-white to-[#f3f1ff] p-6 shadow-[0_12px_35px_rgba(67,56,202,0.07)] sm:flex-row sm:items-center">
        <div className="flex items-center gap-4">
          <span className={`flex h-12 w-12 items-center justify-center rounded-xl ${planTheme[currentPlan].iconBg} ${planTheme[currentPlan].accent}`}><CurrentIcon className="h-6 w-6" /></span>
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#737987]">Current plan</p>
            <h2 className="mt-1 text-2xl font-semibold text-[#172033]">{plans[currentPlan].name}</h2>
            <p className="mt-1 text-sm text-[#687080]">Up to {plans[currentPlan].assetLimit} assets · ${plans[currentPlan].price}/month</p>
            {subscription?.status === "PAST_DUE" && <p className="mt-2 text-sm font-medium text-[#ad2831]">Payment failed. Your access is temporarily preserved while payment is retried.</p>}
            {subscription?.scheduledPlan && periodEnd && <p className="mt-2 text-sm font-medium text-[#5847e8]">{subscription.cancelAtPeriodEnd ? "Switching to Basic" : `Switching to ${plans[subscription.scheduledPlan].name}`} on {date.format(new Date(periodEnd))}.</p>}
          </div>
        </div>
        {subscription && periodEnd && <div className="flex flex-wrap items-center gap-3">
          <div className="rounded-xl bg-white/80 px-4 py-3 text-sm text-[#5d6472]"><span className="block text-xs font-semibold uppercase tracking-wide text-[#7b8190]">{subscription.cancelAtPeriodEnd ? "Access until" : "Next billing date"}</span><span className="mt-1 block font-medium text-[#273247]">{date.format(new Date(periodEnd))}</span></div>
          {subscription.scheduledPlan ? <button onClick={() => void updateSubscription("resume")} disabled={busy !== null} className="rounded-lg border border-[#cfc9ff] bg-white px-4 py-3 text-sm font-semibold text-[#5847e8] disabled:opacity-50">Keep current plan</button> : <button onClick={() => void updateSubscription("cancel")} disabled={busy !== null} className="rounded-lg border border-[#e1e4ed] bg-white px-4 py-3 text-sm font-semibold text-[#687080] disabled:opacity-50">Cancel plan</button>}
        </div>}
      </section>

      <section className="mt-6 grid gap-5 md:grid-cols-3">
        {(Object.keys(plans) as UserPlan[]).map((id) => {
          const plan = plans[id]; const theme = planTheme[id]; const Icon = theme.icon; const active = id === currentPlan;
          const scheduled = subscription?.scheduledPlan === id;
          return <article key={id} className={`relative flex min-h-72 flex-col rounded-2xl border bg-white p-6 shadow-[0_8px_24px_rgba(31,41,55,0.05)] transition ${active ? `${theme.border} ring-2 ring-[#5b47ee]/15` : "border-[#e1e4ed] hover:-translate-y-1 hover:border-[#cfc9ff]"}`}>
            {active && <span className="absolute right-4 top-4 rounded-full bg-[#eeecff] px-3 py-1 text-[10px] font-semibold uppercase tracking-wide text-[#5847e8]">Your plan</span>}
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${theme.iconBg} ${theme.accent}`}><Icon className="h-5 w-5" /></span>
            <h2 className="mt-5 text-xl font-semibold text-[#172033]">{plan.name}</h2>
            <p className="mt-2 text-3xl font-bold text-[#111d32]">${plan.price}<span className="text-sm font-normal text-[#737987]">/month</span></p>
            <p className="mt-4 flex items-center gap-2 text-sm text-[#596170]"><Check className="h-4 w-4 text-[#5847e8]" />Store up to {plan.assetLimit} assets</p>
            <div className="mt-auto pt-7">
              {active ? <button disabled className="h-11 w-full rounded-lg bg-[#f0f2f7] text-sm font-semibold text-[#737987]">Current plan</button>
                : currentPlan === "BASIC" && id !== "BASIC" ? <button onClick={() => void startCheckout(id)} disabled={busy !== null} className="h-11 w-full rounded-lg bg-[#5847e8] text-sm font-semibold text-white disabled:opacity-50">{busy === id ? "Opening checkout…" : `Upgrade to ${plan.name}`}</button>
                : id === "BASIC" ? <button onClick={() => void updateSubscription("cancel")} disabled={busy !== null || subscription?.cancelAtPeriodEnd} className="h-11 w-full rounded-lg border border-[#dfe3eb] bg-white text-sm font-semibold text-[#526071] disabled:opacity-50">{subscription?.cancelAtPeriodEnd ? "Downgrade scheduled" : "Downgrade at renewal"}</button>
                : <button onClick={() => void updateSubscription(id)} disabled={busy !== null || scheduled} className="h-11 w-full rounded-lg bg-[#5847e8] text-sm font-semibold text-white disabled:opacity-50">{scheduled ? "Change scheduled" : planRank[id] > planRank[currentPlan] ? `Upgrade to ${plan.name}` : `Switch to ${plan.name} at renewal`}</button>}
            </div>
          </article>;
        })}
      </section>

      <section className="mt-7 overflow-hidden rounded-2xl border border-[#e1e4ed] bg-white shadow-[0_8px_24px_rgba(31,41,55,0.05)]">
        <div className="flex items-center gap-3 border-b border-[#eceef4] px-6 py-5"><span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#efedff] text-[#5847e8]"><CreditCard className="h-4 w-4" /></span><div><h2 className="font-semibold text-[#172033]">Payment history</h2><p className="text-xs text-[#737987]">Your recent checkout activity</p></div></div>
        {payments.length ? <div className="divide-y divide-[#eceef4]">{payments.map((payment) => <div key={payment.id} className="grid gap-3 px-6 py-4 text-sm sm:grid-cols-[1.2fr_1fr_1fr_auto] sm:items-center"><span className="text-[#4f5663]">{date.format(new Date(payment.createdAt))}</span><span className="font-medium text-[#273247]">{payment.plan ? plans[payment.plan].name : "Plan payment"}</span><span className="text-[#4f5663]">${Number(payment.amount).toFixed(2)} {payment.currency.toUpperCase()}</span><span className={`w-fit rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-wide ${statusStyle[payment.status] ?? statusStyle.PENDING}`}>{payment.status.toLowerCase()}</span></div>)}</div> : <p className="p-8 text-center text-sm text-[#687080]">No payments yet.</p>}
      </section>
    </div>
  );
}
