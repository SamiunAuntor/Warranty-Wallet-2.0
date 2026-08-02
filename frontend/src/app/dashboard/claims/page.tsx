"use client";

import { Suspense, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClaimFormModal } from "@/components/claims/claim-form-modal";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { positivePage, useUrlQuerySync } from "@/hooks/use-url-query-sync";
import { getAssets, type Asset } from "@/lib/assets-api";
import { claimStatusLabels, claimStatusStyles } from "@/lib/claim-display";
import { claimStatuses, createClaim, deleteClaim, getAssetDocuments, getClaim, getClaims, updateClaim, type AssetDocument, type Claim, type ClaimInput, type ClaimList, type ClaimStatus, type ClaimUpdate } from "@/lib/claims-api";
import { dialog, toast } from "@/lib/notifications";
import { useQueryClient } from "@tanstack/react-query";
import { Eye, Pencil, Trash2 } from "lucide-react";
import { ActionIconButton } from "@/components/ui/action-icon-button";

const PAGE_SIZE = 10;
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default function ClaimsPage() {
  return <Suspense fallback={<Loading label="Loading claims"/>}><ClaimsPageContent/></Suspense>;
}

function ClaimsPageContent() {
  const queryClient = useQueryClient();
  const { firebaseUser } = useAuth();
  const query = useSearchParams();
  const openedFromAsset = useRef(false);
  const [result, setResult] = useState<ClaimList | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [formClaim, setFormClaim] = useState<Claim | "new" | null>(null);
  const [viewClaim, setViewClaim] = useState<Claim | null>(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const [initialAssetId, setInitialAssetId] = useState("");
  const [searchInput, setSearchInput] = useState(query.get("search") ?? "");
  const [search, setSearch] = useState(query.get("search") ?? "");
  const initialStatus = query.get("status");
  const [status, setStatus] = useState<ClaimStatus | "">(initialStatus && claimStatuses.includes(initialStatus as ClaimStatus) ? initialStatus as ClaimStatus : "");
  const [page, setPage] = useState(() => positivePage(query.get("page")));
  const [reload, setReload] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useUrlQuerySync({ search, status, page });
  useLayoutEffect(() => {
    if (!firebaseUser) return;
    const cachedClaims = queryClient.getQueryData<ClaimList>(["claims", firebaseUser.uid, page, search, status]);
    const cachedAssets = queryClient.getQueryData<{ data: Asset[] }>(["claim-assets", firebaseUser.uid]);
    if (cachedClaims) { setResult(cachedClaims); setLoading(false); setError(""); }
    if (cachedAssets) setAssets(cachedAssets.data);
  }, [firebaseUser, page, queryClient, search, status]);
  useEffect(() => { const timer = window.setTimeout(() => { const nextSearch = searchInput.trim(); if (nextSearch === search) return; setSearch(nextSearch); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [search, searchInput]);
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then((token) => queryClient.fetchQuery({ queryKey: ["claim-assets", firebaseUser.uid], queryFn: () => getAssets(token, { page: 1, limit: 100 }), staleTime: Infinity })).then((data) => setAssets(data.data)).catch((cause) => toast.error(cause instanceof Error ? cause.message : "Could not load assets.")); }, [firebaseUser, queryClient, reload]);
  useEffect(() => {
    if (!firebaseUser) return; let cancelled = false; setLoading(true); setError("");
    firebaseUser.getIdToken().then((token) => queryClient.fetchQuery({ queryKey: ["claims", firebaseUser.uid, page, search, status], queryFn: () => getClaims(token, { page, limit: PAGE_SIZE, search: search || undefined, status: status || undefined }), staleTime: Infinity })).then((data) => { if (!cancelled) setResult(data); }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load claims."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [firebaseUser, page, queryClient, reload, search, status]);
  useEffect(() => {
    const assetId = query.get("assetId");
    if (!firebaseUser || !assetId || openedFromAsset.current || !assets.some((asset) => asset.id === assetId)) return;
    openedFromAsset.current = true; setInitialAssetId(assetId); setFormClaim("new");
    firebaseUser.getIdToken().then((token) => getAssetDocuments(token, assetId)).then(setDocuments).catch(() => setDocuments([]));
  }, [assets, firebaseUser, query]);

  const refresh = () => { void queryClient.invalidateQueries({ queryKey: ["claims", firebaseUser?.uid] }); void queryClient.invalidateQueries({ queryKey: ["claim-assets", firebaseUser?.uid] }); void queryClient.invalidateQueries({ queryKey: ["assets", firebaseUser?.uid] }); void queryClient.invalidateQueries({ queryKey: ["asset", firebaseUser?.uid] }); void queryClient.invalidateQueries({ queryKey: ["dashboard", firebaseUser?.uid] }); setReload((value) => value + 1); };
  const loadDocuments = async (assetId: string) => { if (!firebaseUser || !assetId) return setDocuments([]); try { setDocuments(await getAssetDocuments(await firebaseUser.getIdToken(), assetId)); } catch { setDocuments([]); } };
  const save = async (input: ClaimInput | ClaimUpdate) => {
    if (!firebaseUser || !formClaim) return; setSaving(true);
    try { const token = await firebaseUser.getIdToken(); const saved = formClaim === "new" ? await createClaim(token, input as ClaimInput) : await updateClaim(token, formClaim.id, input as ClaimUpdate); toast.success(formClaim === "new" ? "Claim created." : "Claim updated."); setFormClaim(null); setViewClaim(saved); refresh(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save claim."); } finally { setSaving(false); }
  };
  const changeStatus = async (claim: Claim, next: ClaimStatus) => {
    if (!firebaseUser || next === claim.status) return;
    try { const updated = await updateClaim(await firebaseUser.getIdToken(), claim.id, { status: next }); toast.success(`Claim marked ${claimStatusLabels[next].toLowerCase()}.`); if (viewClaim?.id === claim.id) setViewClaim(updated); refresh(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not update status."); }
  };
  const view = async (claim: Claim) => { if (!firebaseUser) return; const detailKey = ["claim", firebaseUser.uid, claim.id] as const; const cachedClaim = queryClient.getQueryData<Claim>(detailKey); setViewClaim(cachedClaim ?? claim); setDetailsLoading(!cachedClaim); try { const detailedClaim = await queryClient.fetchQuery({ queryKey: detailKey, queryFn: async () => getClaim(await firebaseUser.getIdToken(), claim.id), staleTime: Infinity }); setViewClaim((current) => current?.id === claim.id ? detailedClaim : current); } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not load claim."); } finally { setDetailsLoading(false); } };
  const remove = async (claim: Claim) => {
    if (!firebaseUser) return; const confirmation = await dialog.confirm("Delete this claim?", `Claim #${claim.claimNumber} and its history will be permanently deleted.`); if (!confirmation.isConfirmed) return;
    try { await deleteClaim(await firebaseUser.getIdToken(), claim.id); if (viewClaim?.id === claim.id) setViewClaim(null); toast.success("Claim deleted."); refresh(); } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not delete claim."); }
  };

  const claims = result?.data ?? [];
  return <div className="mx-auto w-full max-w-[1440px] pb-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Claims</h1><p className="mt-1 text-sm text-[#596170]">Record and track issues for your assets.</p></div><button onClick={() => { setInitialAssetId(""); setDocuments([]); setFormClaim("new"); }} disabled={!assets.length} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white disabled:opacity-45"><Icon name="plus" className="h-4 w-4"/>Create claim</button></header>
    <section className="mt-6 flex flex-col gap-3 rounded-xl border border-[#dfe2ea] bg-white p-4 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737985]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search claims or assets" className="h-11 w-full rounded-lg bg-[#f1f3fb] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#ddd7ff]"/></div><select value={status} onChange={(event) => { setStatus(event.target.value as ClaimStatus | ""); setPage(1); }} className="h-11 rounded-lg border border-[#d2d5de] bg-white px-3 text-sm"><option value="">All statuses</option>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></section>
    {loading ? <Loading fullScreen={false} className="mt-6 min-h-80 rounded-xl"/> : error ? <div className="mt-6 rounded-xl border border-[#efc9cc] bg-white p-10 text-center"><p className="text-sm text-[#a23843]">{error}</p><button onClick={refresh} className="mt-4 rounded-lg bg-[#5b47ee] px-4 py-2 text-sm font-semibold text-white">Try again</button></div> : !claims.length ? <div className="mt-6 rounded-xl border border-dashed border-[#cbd0dc] bg-white p-12 text-center"><Icon name="claims" className="mx-auto h-9 w-9 text-[#5b47ee]"/><h2 className="mt-3 text-lg font-semibold">No claims found</h2><p className="mt-1 text-sm text-[#686d77]">{assets.length ? "Create a claim when an asset has an issue." : "Add an asset before creating a claim."}</p></div> :
      <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe2ea] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-[#e4e6ed] bg-[#f6f7fb] text-xs font-semibold uppercase tracking-wide text-[#687080]"><tr><th className="px-5 py-4">Claim</th><th className="px-4 py-4">Asset</th><th className="px-4 py-4">Created</th><th className="px-4 py-4">Updated</th><th className="px-4 py-4">Status</th><th className="w-px whitespace-nowrap px-4 py-4 text-center">Actions</th></tr></thead><tbody className="divide-y divide-[#e8eaf0]">{claims.map((claim) => <ClaimRow key={claim.id} claim={claim} onView={() => void view(claim)} onEdit={() => { setFormClaim(claim); setDocuments([]); }} onDelete={() => void remove(claim)} onStatus={(next) => void changeStatus(claim, next)}/>)}</tbody></table></div>
      {result && result.meta.totalPages > 1 && <footer className="flex items-center justify-between border-t border-[#e4e6ed] px-5 py-3"><span className="text-sm text-[#686d77]">Page {page} of {result.meta.totalPages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></footer>}</section>}
    {formClaim && <ClaimFormModal claim={formClaim === "new" ? null : formClaim} assets={assets} documents={documents} pending={saving} initialAssetId={initialAssetId} onAssetChange={(id) => void loadDocuments(id)} onClose={() => setFormClaim(null)} onSubmit={save}/>} 
    {viewClaim && <ClaimViewDrawer claim={viewClaim} loading={detailsLoading} onClose={() => setViewClaim(null)} onEdit={() => { setFormClaim(viewClaim); setViewClaim(null); }} onStatus={(next) => void changeStatus(viewClaim, next)}/>}
  </div>;
}

function ClaimRow({ claim, onView, onEdit, onDelete, onStatus }: { claim: Claim; onView: () => void; onEdit: () => void; onDelete: () => void; onStatus: (status: ClaimStatus) => void }) {
  return <tr className="transition hover:bg-[#fafaff]"><td className="px-5 py-4"><p className="text-sm font-semibold text-[#172033]">{claim.title}</p><p className="mt-1 text-xs text-[#686d77]">#{claim.claimNumber}</p></td><td className="px-4 py-4"><p className="text-sm font-medium text-[#273247]">{claim.product.name}</p><p className="text-xs text-[#747986]">{claim.product.brand}</p></td><td className="px-4 py-4 text-sm text-[#4f5663]">{date.format(new Date(claim.createdAt))}</td><td className="px-4 py-4 text-sm text-[#4f5663]">{date.format(new Date(claim.updatedAt))}</td><td className="px-4 py-4"><select value={claim.status} onChange={(event) => onStatus(event.target.value as ClaimStatus)} className={`h-9 rounded-lg border-0 px-3 text-xs font-semibold outline-none ${claimStatusStyles[claim.status]}`}>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></td><td className="w-px whitespace-nowrap px-4 py-4"><div className="flex justify-center gap-1"><ActionIconButton icon={Eye} label="View claim" onClick={onView}/><ActionIconButton icon={Pencil} label="Edit claim" tone="primary" onClick={onEdit}/><ActionIconButton icon={Trash2} label="Delete claim" tone="danger" onClick={onDelete}/></div></td></tr>;
}

function ClaimViewDrawer({ claim, loading, onClose, onEdit, onStatus }: { claim: Claim; loading: boolean; onClose: () => void; onEdit: () => void; onStatus: (status: ClaimStatus) => void }) {
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="claim-view-title"><aside className="relative max-h-[94vh] w-full max-w-2xl overflow-y-auto rounded-l-2xl bg-[#f8f9ff] shadow-2xl">{loading && <div className="absolute inset-x-0 bottom-0 top-28 z-20 flex min-h-72 items-center justify-center bg-white/90 backdrop-blur-[1px]"><Loading fullScreen={false} label="Loading current claim details"/></div>}<header className="sticky top-0 z-10 flex items-start justify-between border-b border-[#e3e5ec] bg-white p-6"><div><span className={`inline-flex rounded-lg px-3 py-1 text-xs font-semibold ${claimStatusStyles[claim.status]}`}>{claimStatusLabels[claim.status]}</span><h2 id="claim-view-title" className="mt-3 text-2xl font-semibold text-[#172033]">{claim.title}</h2><p className="mt-1 text-sm text-[#686d77]">#{claim.claimNumber} · {claim.product.name}</p></div><button onClick={onClose} className="p-2 text-xl text-[#596170] hover:bg-[#eef1f8]" aria-label="Close claim details">×</button></header><div className="space-y-6 p-6"><section><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Issue</h3><p className="mt-2 text-sm leading-6 text-[#30394a]">{claim.issueDescription}</p></section>{claim.submittedCondition && <section><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Product condition</h3><p className="mt-2 text-sm leading-6 text-[#30394a]">{claim.submittedCondition}</p></section>}<section className="grid gap-4 border-y border-[#e2e5ec] py-5 sm:grid-cols-2"><div><p className="text-xs text-[#777d88]">Provider</p><p className="mt-1 text-sm font-medium">{claim.serviceCenter || "Not provided"}</p></div><div><p className="text-xs text-[#777d88]">Reference</p><p className="mt-1 text-sm font-medium">{claim.providerReference || "Not provided"}</p></div><div><p className="text-xs text-[#777d88]">Created</p><p className="mt-1 text-sm font-medium">{date.format(new Date(claim.createdAt))}</p></div><div><p className="text-xs text-[#777d88]">Status</p><select value={claim.status} onChange={(event) => onStatus(event.target.value as ClaimStatus)} className={`mt-1 h-9 rounded-lg border-0 px-3 text-xs font-semibold ${claimStatusStyles[claim.status]}`}>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></div></section>{claim.resolution && <section><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Result</h3><p className="mt-2 text-sm leading-6 text-[#30394a]">{claim.resolution}</p></section>}<section><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Documents</h3><div className="mt-2 space-y-2">{claim.documents?.length ? claim.documents.map(({ document }) => <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="block truncate border border-[#e0e3eb] bg-white px-3 py-3 text-sm text-[#4b41e1] hover:underline">{document.fileName}</a>) : <p className="text-sm text-[#777d88]">No documents attached.</p>}</div></section>{claim.timeline?.length ? <section><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">History</h3><div className="mt-3 space-y-2">{claim.timeline.map((event) => <div key={event.id} className="border-l-2 border-[#dcd8ff] bg-white px-4 py-3"><p className="text-sm font-medium">{event.title}</p><p className="mt-1 text-xs text-[#777d88]">{date.format(new Date(event.createdAt))}</p></div>)}</div></section> : null}</div><footer className="sticky bottom-0 flex justify-end gap-2 border-t border-[#e3e5ec] bg-white p-4"><button onClick={onClose} className="h-10 border border-[#d2d5de] px-4 text-sm font-semibold">Close</button><button onClick={onEdit} className="h-10 bg-[#5b47ee] px-4 text-sm font-semibold text-white">Edit claim</button></footer></aside></div>;
}
