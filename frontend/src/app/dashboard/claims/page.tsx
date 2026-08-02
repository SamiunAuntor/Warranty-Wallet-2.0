"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { ClaimFormModal } from "@/components/claims/claim-form-modal";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { positivePage, useUrlQuerySync } from "@/hooks/use-url-query-sync";
import { getAssets, type Asset } from "@/lib/assets-api";
import { claimStatusLabels, claimStatusStyles } from "@/lib/claim-display";
import { claimStatuses, createClaim, deleteClaim, getAssetDocuments, getClaim, getClaims, terminalClaimStatuses, updateClaim, type AssetDocument, type Claim, type ClaimInput, type ClaimList, type ClaimStatus, type ClaimUpdate } from "@/lib/claims-api";
import { dialog, toast } from "@/lib/notifications";

const PAGE_SIZE = 10;
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default function ClaimsPage() { return <Suspense fallback={<Loading label="Loading claims"/>}><ClaimsPageContent/></Suspense>; }

function ClaimsPageContent() {
  const { firebaseUser } = useAuth(); const query = useSearchParams(); const openedFromAsset = useRef(false);
  const [result, setResult] = useState<ClaimList | null>(null); const [assets, setAssets] = useState<Asset[]>([]); const [documents, setDocuments] = useState<AssetDocument[]>([]);
  const [formClaim, setFormClaim] = useState<Claim | "new" | null>(null); const [expanded, setExpanded] = useState<Claim | null>(null); const [initialAssetId, setInitialAssetId] = useState("");
  const [searchInput, setSearchInput] = useState(query.get("search") ?? ""); const [search, setSearch] = useState(query.get("search") ?? "");
  const initialStatus = query.get("status"); const [status, setStatus] = useState<ClaimStatus | "">(initialStatus && claimStatuses.includes(initialStatus as ClaimStatus) ? initialStatus as ClaimStatus : "");
  const [page, setPage] = useState(() => positivePage(query.get("page"))); const [reload, setReload] = useState(0); const [loading, setLoading] = useState(true); const [saving, setSaving] = useState(false); const [error, setError] = useState("");
  useUrlQuerySync({ search, status, page });

  useEffect(() => { const timer = window.setTimeout(() => { setSearch(searchInput.trim()); setPage(1); }, 350); return () => window.clearTimeout(timer); }, [searchInput]);
  useEffect(() => { if (!firebaseUser) return; firebaseUser.getIdToken().then((token) => getAssets(token, { page: 1, limit: 100 })).then((data) => setAssets(data.data)).catch((cause) => toast.error(cause instanceof Error ? cause.message : "Could not load assets.")); }, [firebaseUser, reload]);
  useEffect(() => {
    if (!firebaseUser) return; let cancelled = false; setLoading(true); setError("");
    firebaseUser.getIdToken().then((token) => getClaims(token, { page, limit: PAGE_SIZE, search: search || undefined, status: status || undefined })).then((data) => { if (!cancelled) setResult(data); }).catch((cause) => { if (!cancelled) setError(cause instanceof Error ? cause.message : "Could not load claims."); }).finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [firebaseUser, page, reload, search, status]);
  useEffect(() => {
    const assetId = query.get("assetId"); if (!firebaseUser || !assetId || openedFromAsset.current || !assets.some((asset) => asset.id === assetId)) return;
    openedFromAsset.current = true; setInitialAssetId(assetId); setFormClaim("new"); firebaseUser.getIdToken().then((token) => getAssetDocuments(token, assetId)).then(setDocuments).catch(() => setDocuments([]));
  }, [assets, firebaseUser, query]);

  const refresh = () => setReload((value) => value + 1);
  const loadDocuments = async (assetId: string) => { if (!firebaseUser || !assetId) return setDocuments([]); try { setDocuments(await getAssetDocuments(await firebaseUser.getIdToken(), assetId)); } catch { setDocuments([]); } };
  const openCreate = () => { setInitialAssetId(""); setDocuments([]); setFormClaim("new"); };
  const save = async (input: ClaimInput | ClaimUpdate) => {
    if (!firebaseUser || !formClaim) return; setSaving(true);
    try { const token = await firebaseUser.getIdToken(); const saved = formClaim === "new" ? await createClaim(token, input as ClaimInput) : await updateClaim(token, formClaim.id, input as ClaimUpdate); toast.success(formClaim === "new" ? "Claim created." : "Claim updated."); setFormClaim(null); setExpanded(saved); refresh(); }
    catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not save claim."); } finally { setSaving(false); }
  };
  const changeStatus = async (claim: Claim, next: ClaimStatus) => {
    if (!firebaseUser || next === claim.status) return; let resolution: string | undefined;
    if (terminalClaimStatuses.includes(next)) { const prompt = await dialog.textarea(`${claimStatusLabels[next]} claim`, "Add a short result or reason."); if (!prompt.isConfirmed || !prompt.value.trim()) return; resolution = prompt.value.trim(); }
    try { const updated = await updateClaim(await firebaseUser.getIdToken(), claim.id, { status: next, ...(resolution && { resolution }) }); toast.success(`Claim marked ${claimStatusLabels[next].toLowerCase()}.`); if (expanded?.id === claim.id) setExpanded(updated); refresh(); } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not update status."); }
  };
  const view = async (claim: Claim) => { if (!firebaseUser) return; if (expanded?.id === claim.id) return setExpanded(null); try { setExpanded(await getClaim(await firebaseUser.getIdToken(), claim.id)); } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not load claim."); } };
  const remove = async (claim: Claim) => { if (!firebaseUser) return; const confirmation = await dialog.confirm("Delete this claim?", `Claim #${claim.claimNumber} and its history will be permanently deleted.`); if (!confirmation.isConfirmed) return; try { await deleteClaim(await firebaseUser.getIdToken(), claim.id); if (expanded?.id === claim.id) setExpanded(null); toast.success("Claim deleted."); refresh(); } catch (cause) { toast.error(cause instanceof Error ? cause.message : "Could not delete claim."); } };

  const claims = result?.data ?? [];
  return <div className="mx-auto w-full max-w-[1440px] pb-10">
    <header className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Claims</h1><p className="mt-1 text-sm text-[#596170]">Record and track issues for your assets.</p></div><button onClick={openCreate} disabled={!assets.length} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white disabled:opacity-45"><Icon name="plus" className="h-4 w-4"/>Create claim</button></header>
    <section className="mt-6 flex flex-col gap-3 rounded-xl border border-[#dfe2ea] bg-white p-4 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737985]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search claims or assets" className="h-11 w-full rounded-lg bg-[#f1f3fb] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#ddd7ff]"/></div><select value={status} onChange={(event) => { setStatus(event.target.value as ClaimStatus | ""); setPage(1); }} className="h-11 rounded-lg border border-[#d2d5de] bg-white px-3 text-sm"><option value="">All statuses</option>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></section>
    {loading ? <Loading fullScreen={false} className="mt-6 min-h-80 rounded-xl"/> : error ? <div className="mt-6 rounded-xl border border-[#efc9cc] bg-white p-10 text-center"><p className="text-sm text-[#a23843]">{error}</p><button onClick={refresh} className="mt-4 rounded-lg bg-[#5b47ee] px-4 py-2 text-sm font-semibold text-white">Try again</button></div> : !claims.length ? <div className="mt-6 rounded-xl border border-dashed border-[#cbd0dc] bg-white p-12 text-center"><Icon name="claims" className="mx-auto h-9 w-9 text-[#5b47ee]"/><h2 className="mt-3 text-lg font-semibold">No claims found</h2><p className="mt-1 text-sm text-[#686d77]">{assets.length ? "Create a claim when an asset has an issue." : "Add an asset before creating a claim."}</p></div> :
      <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe2ea] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-[#e4e6ed] bg-[#f6f7fb] text-xs font-semibold uppercase tracking-wide text-[#687080]"><tr><th className="px-5 py-4">Claim</th><th className="px-4 py-4">Asset</th><th className="px-4 py-4">Created</th><th className="px-4 py-4">Updated</th><th className="px-4 py-4">Status</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#e8eaf0]">{claims.map((claim) => <ClaimRow key={claim.id} claim={claim} expanded={expanded?.id === claim.id ? expanded : null} onView={() => void view(claim)} onEdit={() => { setFormClaim(claim); setDocuments([]); }} onDelete={() => void remove(claim)} onStatus={(next) => void changeStatus(claim, next)}/>)}</tbody></table></div>
      {result && result.meta.totalPages > 1 && <footer className="flex items-center justify-between border-t border-[#e4e6ed] px-5 py-3"><span className="text-sm text-[#686d77]">Page {page} of {result.meta.totalPages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => setPage((value) => value - 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page === result.meta.totalPages} onClick={() => setPage((value) => value + 1)} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></footer>}</section>}
    {formClaim && <ClaimFormModal claim={formClaim === "new" ? null : formClaim} assets={assets} documents={documents} pending={saving} initialAssetId={initialAssetId} onAssetChange={(id) => void loadDocuments(id)} onClose={() => setFormClaim(null)} onSubmit={save}/>} 
  </div>;
}

function ClaimRow({ claim, expanded, onView, onEdit, onDelete, onStatus }: { claim: Claim; expanded: Claim | null; onView: () => void; onEdit: () => void; onDelete: () => void; onStatus: (status: ClaimStatus) => void }) {
  return <><tr className="transition hover:bg-[#fafaff]"><td className="px-5 py-4"><p className="text-sm font-semibold text-[#172033]">{claim.title}</p><p className="mt-1 text-xs text-[#686d77]">#{claim.claimNumber}</p></td><td className="px-4 py-4"><p className="text-sm font-medium text-[#273247]">{claim.product.name}</p><p className="text-xs text-[#747986]">{claim.product.brand}</p></td><td className="px-4 py-4 text-sm text-[#4f5663]">{date.format(new Date(claim.createdAt))}</td><td className="px-4 py-4 text-sm text-[#4f5663]">{date.format(new Date(claim.updatedAt))}</td><td className="px-4 py-4"><select value={claim.status} onChange={(event) => onStatus(event.target.value as ClaimStatus)} className={`h-9 rounded-lg border-0 px-3 text-xs font-semibold outline-none ${claimStatusStyles[claim.status]}`}>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={onView} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#27364b] hover:bg-[#eef0f5]">{expanded ? "Hide" : "View"}</button><button onClick={onEdit} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4b41e1] hover:bg-[#eeecff]">Edit</button><button onClick={onDelete} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#a92b2b] hover:bg-[#fff0f0]">Delete</button></div></td></tr>{expanded && <tr><td colSpan={6} className="bg-[#fafbff] px-5 py-5"><div className="grid gap-5 lg:grid-cols-3"><div><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Issue</h3><p className="mt-2 text-sm leading-6 text-[#30394a]">{expanded.issueDescription}</p>{expanded.submittedCondition && <><h3 className="mt-4 text-xs font-semibold uppercase tracking-wide text-[#777d88]">Product condition</h3><p className="mt-2 text-sm text-[#30394a]">{expanded.submittedCondition}</p></>}</div><div><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Claim information</h3><dl className="mt-2 space-y-2 text-sm"><div><dt className="text-[#777d88]">Provider</dt><dd>{expanded.serviceCenter || "Not provided"}</dd></div><div><dt className="text-[#777d88]">Reference</dt><dd>{expanded.providerReference || "Not provided"}</dd></div>{expanded.resolution && <div><dt className="text-[#777d88]">Result</dt><dd>{expanded.resolution}</dd></div>}</dl></div><div><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">Documents</h3><div className="mt-2 space-y-2">{expanded.documents?.length ? expanded.documents.map(({ document }) => <a key={document.id} href={document.fileUrl} target="_blank" rel="noreferrer" className="block truncate rounded-lg border border-[#e0e3eb] bg-white px-3 py-2 text-sm text-[#4b41e1] hover:underline">{document.fileName}</a>) : <p className="text-sm text-[#777d88]">No documents attached.</p>}</div></div></div>{expanded.timeline?.length ? <div className="mt-5 border-t border-[#e2e5ec] pt-4"><h3 className="text-xs font-semibold uppercase tracking-wide text-[#777d88]">History</h3><div className="mt-3 flex flex-wrap gap-2">{expanded.timeline.map((event) => <span key={event.id} className="rounded-lg bg-white px-3 py-2 text-xs text-[#4f5663]">{event.title} · {date.format(new Date(event.createdAt))}</span>)}</div></div> : null}</td></tr>}</>;
}
