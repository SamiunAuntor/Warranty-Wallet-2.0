"use client";
import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/contexts/auth-context";
import { getGrowth, getRevenue, type GrowthPoint, type RevenuePoint } from "@/lib/admin-api";
const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const monthIndex = (point: { createdAt?: string; month?: number }) => point.month ? point.month - 1 : point.createdAt ? new Date(point.createdAt).getMonth() : 0;
export function AdminCharts() {
  const { firebaseUser } = useAuth();
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then(async (token) => Promise.all([getRevenue(token, new Date().getFullYear()), getGrowth(token, new Date().getFullYear())])).then(([a, b]) => { setRevenue(a); setGrowth(b); }).catch(() => undefined); }, [firebaseUser]);
  const revenueMonths = useMemo(() => { const values = Array(12).fill(0) as number[]; revenue.forEach((point) => { values[monthIndex(point)] += Number(point.revenue ?? point._sum?.amount ?? 0); }); return values; }, [revenue]);
  const growthMonths = useMemo(() => { const values = Array(12).fill(0) as number[]; growth.forEach((point) => { values[monthIndex(point)] += Number(point.count ?? point._count?.id ?? 0); }); return values; }, [growth]);
  return <div className="grid gap-6 xl:grid-cols-2"><BarChart values={revenueMonths}/><LineChart values={growthMonths}/></div>;
}
function BarChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  return <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Monthly revenue</h2><div className="mt-6 flex h-60 items-end gap-2">{values.map((value, index) => <div key={months[index]} className="flex h-full flex-1 flex-col justify-end"><span className="mb-1 text-center text-[9px] text-[#626773]">{value ? `$${value}` : ""}</span><div style={{ height: `${Math.max(3, (value / max) * 190)}px` }} className="rounded-t bg-gradient-to-t from-[#4b41e1] to-[#887cff]"/><span className="mt-2 text-center text-[10px] text-[#777d88]">{months[index]}</span></div>)}</div></section>;
}
function LineChart({ values }: { values: number[] }) {
  const max = Math.max(1, ...values);
  const points = values.map((value, index) => `${20 + index * 42},${205 - (value / max) * 170}`).join(" ");
  return <section className="rounded-xl border bg-white p-5"><h2 className="font-semibold">Asset growth</h2><svg viewBox="0 0 500 240" className="mt-4 h-60 w-full" role="img" aria-label="Asset growth"><polyline points={points} fill="none" stroke="#5b47ee" strokeWidth="4" strokeLinejoin="round"/>{values.map((value, index) => <g key={months[index]}><circle cx={20 + index * 42} cy={205 - (value / max) * 170} r="4" fill="#fff" stroke="#5b47ee" strokeWidth="3"/><text x={20 + index * 42} y="235" textAnchor="middle" fontSize="9" fill="#777d88">{months[index]}</text></g>)}</svg></section>;
}
