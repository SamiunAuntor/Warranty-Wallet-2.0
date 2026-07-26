"use client";
import { useEffect, useState } from "react";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import { downloadAdminReport, getAdminActivities, type Activity } from "@/lib/admin-api";
import { toast } from "@/lib/notifications";
const reports = [
  ["admin/users", "User Directory", "Registered users, plans, and account states"],
  ["admin/revenue", "Revenue Report", "Successful payments and platform revenue"],
  ["admin/categories", "Category Report", "Catalog usage and category distribution"],
  ["products", "Asset Report", "All assets visible to the administrator"],
  ["warranty", "Warranty Report", "Coverage state and expiry overview"],
  ["payments", "Payment Report", "Payment transaction history"],
] as const;
export default function AdminReportsPage() {
  const { firebaseUser } = useAuth(); const [activities, setActivities] = useState<Activity[]>([]); const [downloading, setDownloading] = useState("");
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then(getAdminActivities).then(setActivities).catch(() => undefined); }, [firebaseUser]);
  const download = async (report: string, format: "PDF"|"EXCEL") => { if (!firebaseUser) return; const key = report+format; setDownloading(key); try { await downloadAdminReport(await firebaseUser.getIdToken(), report, format); toast.success("Report downloaded."); } catch (error) { toast.error(error instanceof Error ? error.message : "Download failed."); } finally { setDownloading(""); } };
  return <div className="mx-auto max-w-[1200px]"><h1 className="text-3xl font-semibold">Reports & Audit</h1><p className="mt-1 text-sm text-[#626773]">Export operational data and review administrator activity.</p><div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">{reports.map(([id, title, detail]) => <article key={id} className="rounded-xl border bg-white p-5"><Icon name="documents" className="h-6 w-6 text-[#5b47ee]"/><h2 className="mt-3 font-semibold">{title}</h2><p className="mt-1 min-h-10 text-xs leading-5 text-[#626773]">{detail}</p><div className="mt-4 flex gap-2"><button disabled={Boolean(downloading)} onClick={() => void download(id, "PDF")} className="rounded-lg border px-3 py-2 text-xs font-semibold">PDF</button><button disabled={Boolean(downloading)} onClick={() => void download(id, "EXCEL")} className="rounded-lg bg-[#5b47ee] px-3 py-2 text-xs font-semibold text-white">Excel</button></div></article>)}</div><section className="mt-7 rounded-xl border bg-white"><h2 className="border-b p-5 font-semibold">Recent administrator activity</h2>{activities.length ? <div className="divide-y">{activities.map((item) => <div key={item.id} className="flex gap-4 p-4"><span className="mt-1 h-2 w-2 rounded-full bg-[#5b47ee]"/><div className="min-w-0 flex-1"><div className="flex justify-between gap-3"><p className="font-semibold">{item.title}</p><time className="text-xs text-[#777d88]">{new Date(item.createdAt).toLocaleString()}</time></div><p className="mt-1 text-sm text-[#626773]">{item.description || `${item.type} · ${item.entity}`}</p></div></div>)}</div> : <p className="p-8 text-center text-sm text-[#626773]">No recent administrator activity.</p>}</section></div>;
}
