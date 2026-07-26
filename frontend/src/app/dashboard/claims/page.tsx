"use client";

import { useEffect, useMemo, useState, type FormEvent } from "react";
import { ClaimFormModal } from "@/components/claims/claim-form-modal";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { getAssets, type Asset } from "@/lib/assets-api";
import {
  addTimelineEvent,
  attachClaimDocument,
  createClaim,
  deleteClaim,
  detachClaimDocument,
  getAssetDocuments,
  getClaim,
  getClaims,
  updateClaim,
  claimTransitions,
  terminalClaimStatuses,
  type AssetDocument,
  type Claim,
  type ClaimInput,
  type ClaimList,
  type ClaimStatus,
  type ClaimUpdate,
} from "@/lib/claims-api";
import { dialog, toast } from "@/lib/notifications";

const PAGE_SIZE = 8;
const dateTime = new Intl.DateTimeFormat("en-US", { dateStyle: "medium", timeStyle: "short" });
const statusLabel = (status: ClaimStatus) => status.replaceAll("_", " ");
const badges: Record<ClaimStatus, string> = {
  DRAFT: "border-[#d4d6de] bg-[#f0f1f4] text-[#626773]",
  SUBMITTED: "border-[#cad4e9] bg-[#e9eefb] text-[#33445e]",
  UNDER_REVIEW: "border-[#f2d7b4] bg-[#fff3e3] text-[#b45c13]",
  APPROVED: "border-[#d0ead5] bg-[#eaf8ed] text-[#397849]",
  REJECTED: "border-[#f0c6c9] bg-[#fdecef] text-[#a83e4c]",
  RESOLVED: "border-[#c8e7dc] bg-[#e5f7ed] text-[#2c7652]",
  CANCELLED: "border-[#d4d6de] bg-[#f0f1f4] text-[#70747d]",
};

export default function ClaimsPage() {
  const { firebaseUser, appUser } = useAuth();
  const [result, setResult] = useState<ClaimList | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [assetDocuments, setAssetDocuments] = useState<AssetDocument[]>([]);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
  const [formClaim, setFormClaim] = useState<Claim | "new" | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<ClaimStatus | "">("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [attachId, setAttachId] = useState("");
  const selectedClaimId = selectedClaim?.id;

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    firebaseUser.getIdToken()
      .then((token) => Promise.all([
        getClaims(token, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          status: status || undefined,
        }),
        getAssets(token, { page: 1, limit: 500 }),
      ]))
      .then(async ([claims, assetResult]) => {
        if (cancelled) return;
        setResult(claims);
        setAssets(assetResult.data);

        if (selectedClaimId && claims.data.some((claim) => claim.id === selectedClaimId)) {
          const token = await firebaseUser.getIdToken();
          const refreshed = await getClaim(token, selectedClaimId);
          if (!cancelled) {
            setSelectedClaim(refreshed);
            setAssetDocuments(await getAssetDocuments(token, refreshed.productId));
          }
        } else if (claims.data[0]) {
          const token = await firebaseUser.getIdToken();
          const first = await getClaim(token, claims.data[0].id);
          if (!cancelled) {
            setSelectedClaim(first);
            setAssetDocuments(await getAssetDocuments(token, first.productId));
          }
        } else {
          setSelectedClaim(null);
          setAssetDocuments([]);
        }
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load claims.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, page, reloadKey, search, selectedClaimId, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const claims = result?.data ?? [];
  const attachedIds = useMemo(
    () => new Set(selectedClaim?.documents.map((item) => item.documentId) ?? []),
    [selectedClaim],
  );
  const availableDocuments = assetDocuments.filter((document) => !attachedIds.has(document.id));

  const refresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const selectClaim = async (claim: Claim) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      const detail = await getClaim(token, claim.id);
      setSelectedClaim(detail);
      setAssetDocuments(await getAssetDocuments(token, detail.productId));
      setAttachId("");
    } catch (selectError) {
      toast.error(selectError instanceof Error ? selectError.message : "Could not load claim details.");
    }
  };

  const loadDocuments = async (assetId: string) => {
    if (!firebaseUser) return;
    try {
      setAssetDocuments(await getAssetDocuments(await firebaseUser.getIdToken(), assetId));
    } catch (documentError) {
      toast.error(documentError instanceof Error ? documentError.message : "Could not load asset documents.");
    }
  };

  const saveClaim = async (input: ClaimInput | ClaimUpdate) => {
    if (!firebaseUser || !formClaim) return;
    setSaving(true);
    try {
      const token = await firebaseUser.getIdToken();
      if (formClaim === "new") {
        const created = await createClaim(token, input as ClaimInput);
        setSelectedClaim(created);
        toast.success("Claim created successfully.");
      } else {
        const updated = await updateClaim(token, formClaim.id, input as ClaimUpdate);
        setSelectedClaim(updated);
        toast.success("Claim updated successfully.");
      }
      setFormClaim(null);
      refresh();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not save the claim.");
    } finally {
      setSaving(false);
    }
  };

  const removeClaim = async () => {
    if (!firebaseUser || !selectedClaim) return;
    const confirmation = await dialog.confirm("Delete this claim?", `Claim #${selectedClaim.claimNumber} and its timeline will be permanently deleted.`);
    if (!confirmation.isConfirmed) return;
    try {
      await deleteClaim(await firebaseUser.getIdToken(), selectedClaim.id);
      setSelectedClaim(null);
      toast.success("Claim deleted.");
      refresh();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the claim.");
    }
  };

  const submitTimeline = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!firebaseUser || !selectedClaim) return;
    const form = new FormData(event.currentTarget);
    setSaving(true);
    try {
      const updated = await addTimelineEvent(
        await firebaseUser.getIdToken(),
        selectedClaim.id,
        {
          title: String(form.get("title")).trim(),
          description: String(form.get("description")).trim() || undefined,
          status: (String(form.get("status")) || undefined) as ClaimStatus | undefined,
        },
      );
      setSelectedClaim(updated);
      event.currentTarget.reset();
      toast.success("Timeline updated.");
      refresh();
    } catch (timelineError) {
      toast.error(timelineError instanceof Error ? timelineError.message : "Could not update the timeline.");
    } finally {
      setSaving(false);
    }
  };

  const attachDocument = async () => {
    if (!firebaseUser || !selectedClaim || !attachId) return;
    try {
      const updated = await attachClaimDocument(await firebaseUser.getIdToken(), selectedClaim.id, attachId);
      setSelectedClaim(updated);
      setAttachId("");
      toast.success("Document attached.");
      refresh();
    } catch (attachError) {
      toast.error(attachError instanceof Error ? attachError.message : "Could not attach the document.");
    }
  };

  const detachDocument = async (documentId: string) => {
    if (!firebaseUser || !selectedClaim) return;
    try {
      const updated = await detachClaimDocument(await firebaseUser.getIdToken(), selectedClaim.id, documentId);
      setSelectedClaim(updated);
      toast.success("Document detached.");
      refresh();
    } catch (detachError) {
      toast.error(detachError instanceof Error ? detachError.message : "Could not detach the document.");
    }
  };

  return <div className="mx-auto w-full max-w-[1440px] pb-10">
    <div className="mb-6 flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between"><header><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Claims</h1><p className="mt-1 max-w-[680px] text-base leading-6 text-[#555b67]">Create warranty claims from registered assets and track every resolution update.</p></header><button onClick={() => { setAssetDocuments([]); setFormClaim("new"); }} disabled={assets.length === 0} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white hover:bg-[#6e5cf5] disabled:cursor-not-allowed disabled:bg-[#aaa6c7]"><Icon name="plus" className="h-4 w-4"/>New Claim</button></div>

    <section className="mb-6 flex flex-col gap-3 rounded-xl border border-[#d8dbe4] bg-white p-4 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737985]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search claims, assets, or claim numbers…" className="h-11 w-full rounded-lg bg-[#eef2ff] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#d9d2ff]"/></div><select value={status} onChange={(event) => { setLoading(true); setError(""); setStatus(event.target.value as ClaimStatus | ""); setPage(1); }} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none"><option value="">All statuses</option>{Object.keys(badges).map((value) => <option key={value} value={value}>{statusLabel(value as ClaimStatus)}</option>)}</select></section>

    {loading ? <Loading fullScreen={false} className="min-h-96 rounded-xl" label="Loading claims"/> : error ? <section className="rounded-xl border border-[#f0c6c9] bg-white p-10 text-center"><Icon name="warning" className="mx-auto h-8 w-8 text-[#a83e4c]"/><p className="mt-3 text-sm text-[#555b67]">{error}</p><button onClick={refresh} className="mt-4 rounded-lg bg-[#5b47ee] px-4 py-2 text-sm font-semibold text-white">Try again</button></section> : claims.length === 0 ? <section className="rounded-xl border border-dashed border-[#c9ccd5] bg-white p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eeeaff] text-[#5b47ee]"><Icon name="claims" className="h-7 w-7"/></div><h2 className="mt-4 text-lg font-semibold text-[#172033]">No claims found</h2><p className="mt-2 text-sm text-[#626773]">{assets.length === 0 ? "Add an asset before creating a warranty claim." : search || status ? "Try changing your search or status filter." : "Create a claim when one of your registered products needs service."}</p>{assets.length > 0 && !search && !status && <button onClick={() => setFormClaim("new")} className="mt-5 rounded-lg bg-[#5b47ee] px-4 py-2 text-sm font-semibold text-white">Create your first claim</button>}</section> :
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="space-y-4">{claims.map((claim) => <button key={claim.id} onClick={() => void selectClaim(claim)} className={`w-full rounded-xl border bg-white p-4 text-left shadow-[0_2px_6px_rgba(24,32,56,.05)] transition hover:border-[#8b7dff] ${selectedClaim?.id === claim.id ? "border-2 border-[#7363ff]" : "border-[#d4d6de]"}`}><div className="flex flex-col gap-4 sm:flex-row"><div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-lg border border-[#d7dbe4] bg-gradient-to-br from-white to-[#dce1e4] text-[#4d5664]"><Icon name="products" className="h-10 w-10"/></div><div className="min-w-0 flex-1"><div className="flex flex-wrap items-start justify-between gap-2"><div><h2 className="text-lg font-semibold text-[#182237]">{claim.product.name}</h2><p className="mt-1 text-sm text-[#5c616c]">{claim.title} · #{claim.claimNumber}</p></div><span className={`rounded-full border px-3 py-1 text-[10px] font-bold ${badges[claim.status]}`}>{statusLabel(claim.status)}</span></div><div className="mt-4 grid gap-3 border-t border-[#e1e3e9] pt-3 sm:grid-cols-2"><div><p className="text-xs font-semibold text-[#8a8d96]">Service Center</p><p className="mt-1 text-sm font-medium text-[#273247]">{claim.serviceCenter || "Not assigned"}</p></div><div><p className="text-xs font-semibold text-[#8a8d96]">Last Update</p><p className="mt-1 text-sm font-medium text-[#273247]">{dateTime.format(new Date(claim.updatedAt))}</p></div></div></div></div></button>)}
          {result && result.meta.totalPages > 1 && <div className="flex items-center justify-between rounded-xl border border-[#d8dbe4] bg-white p-3"><span className="text-sm text-[#626773]">Page {page} of {result.meta.totalPages}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><button disabled={page === result.meta.totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}
        </section>

        {selectedClaim && <aside className="h-fit rounded-xl border border-[#d4d6de] bg-white p-5 shadow-[0_2px_6px_rgba(24,32,56,.05)] xl:sticky xl:top-5"><div className="flex items-start justify-between gap-3"><div><span className={`rounded-full border px-2.5 py-1 text-[10px] font-bold ${badges[selectedClaim.status]}`}>{statusLabel(selectedClaim.status)}</span><h2 className="mt-3 text-xl font-semibold text-[#172033]">Claim #{selectedClaim.claimNumber}</h2><p className="mt-1 text-sm text-[#626773]">{selectedClaim.product.name} · {selectedClaim.title}</p></div><button onClick={() => setFormClaim(selectedClaim)} className="rounded-lg bg-[#eeeaff] px-3 py-2 text-xs font-semibold text-[#5b47ee]">Edit</button></div>
          <p className="mt-4 rounded-lg bg-[#f7f8fc] p-3 text-sm leading-6 text-[#4f5663]">{selectedClaim.issueDescription}</p>

          <div className="mt-5"><h3 className="font-semibold text-[#172033]">Attached documents</h3>{selectedClaim.documents.length > 0 ? <div className="mt-2 space-y-2">{selectedClaim.documents.map(({ document }) => <div key={document.id} className="flex items-center gap-2 rounded-lg border border-[#e0e2e8] p-2"><Icon name="documents" className="h-4 w-4 text-[#5b47ee]"/><a href={document.fileUrl} target="_blank" rel="noreferrer" className="min-w-0 flex-1 truncate text-xs font-medium text-[#38445a] hover:underline">{document.fileName}</a><button onClick={() => void detachDocument(document.id)} className="text-xs font-semibold text-[#a83e4c]">Remove</button></div>)}</div> : <p className="mt-2 text-xs text-[#7c818b]">No documents attached.</p>}
            {availableDocuments.length > 0 && <div className="mt-3 flex gap-2"><select value={attachId} onChange={(event) => setAttachId(event.target.value)} className="h-9 min-w-0 flex-1 rounded-lg border border-[#c9ccd5] px-2 text-xs"><option value="">Select asset document</option>{availableDocuments.map((document) => <option key={document.id} value={document.id}>{document.fileName}</option>)}</select><button onClick={() => void attachDocument()} disabled={!attachId} className="rounded-lg bg-[#5b47ee] px-3 text-xs font-semibold text-white disabled:opacity-40">Attach</button></div>}</div>

          <div className="mt-6 border-t border-[#d8dbe2] pt-5"><h3 className="text-lg font-semibold text-[#172033]">Timeline</h3><div className="mt-4">{selectedClaim.timeline.map((event, index) => <TimelineItem key={event.id} event={event} active={index === 0}/>)}</div></div>

          {!terminalClaimStatuses.includes(selectedClaim.status) && <form onSubmit={submitTimeline} className="mt-5 space-y-2 rounded-xl border border-[#ded9ff] bg-[#faf9ff] p-3"><h3 className="text-sm font-semibold text-[#372a91]">Add timeline update</h3><input name="title" required minLength={2} placeholder="Update title" className="h-9 w-full rounded-lg border border-[#d4d0e8] px-3 text-xs outline-none"/><textarea name="description" rows={2} placeholder="What happened?" className="w-full rounded-lg border border-[#d4d0e8] px-3 py-2 text-xs outline-none"/><select name="status" defaultValue="" className="h-9 w-full rounded-lg border border-[#d4d0e8] px-2 text-xs"><option value="">Keep current status</option>{(appUser?.role === "ADMIN" ? claimTransitions[selectedClaim.status] : ["CANCELLED"] as ClaimStatus[]).map((value) => <option key={value} value={value}>{statusLabel(value)}</option>)}</select><button disabled={saving} className="h-9 w-full rounded-lg bg-[#5b47ee] text-xs font-semibold text-white disabled:opacity-50">{saving ? "Saving…" : "Add update"}</button></form>}
          {(appUser?.role === "ADMIN" || ["DRAFT", "CANCELLED"].includes(selectedClaim.status)) && <button onClick={() => void removeClaim()} className="mt-4 w-full rounded-lg px-3 py-2 text-xs font-semibold text-[#a83e4c] hover:bg-[#fff0f1]">Delete claim</button>}
        </aside>}
      </div>
    }

    {formClaim && <ClaimFormModal claim={formClaim === "new" ? null : formClaim} assets={assets} documents={assetDocuments} pending={saving} isAdmin={appUser?.role === "ADMIN"} onAssetChange={(assetId) => void loadDocuments(assetId)} onClose={() => setFormClaim(null)} onSubmit={saveClaim}/>}
  </div>;
}

function TimelineItem({ event, active }: { event: Claim["timeline"][number]; active: boolean }) {
  return <div className="relative border-l-2 border-[#e0e2e8] pb-7 pl-7 last:pb-1"><span className={`absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-white ${active ? "border-[#5b47ee]" : "border-[#c9ccd4] bg-[#c9ccd4]"}`}/><div className="flex items-start justify-between gap-3"><h4 className={`text-sm font-medium ${active ? "text-[#5b47ee]" : "text-[#273247]"}`}>{event.title}</h4><span className="text-[10px] font-semibold text-[#777d88]">{dateTime.format(new Date(event.createdAt))}</span></div>{event.status && <p className="mt-1 text-[10px] font-semibold uppercase tracking-wide text-[#777d88]">{statusLabel(event.status)}</p>}{event.description && <p className="mt-2 text-xs leading-5 text-[#555b67]">{event.description}</p>}</div>;
}
