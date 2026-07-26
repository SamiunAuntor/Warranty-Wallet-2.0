"use client";

import { useState, type FormEvent } from "react";
import type { Asset } from "@/lib/assets-api";
import type { AssetDocument, Claim, ClaimInput, ClaimStatus, ClaimUpdate } from "@/lib/claims-api";

type Props = {
  claim?: Claim | null;
  assets: Asset[];
  documents: AssetDocument[];
  pending: boolean;
  onAssetChange: (assetId: string) => void;
  onClose: () => void;
  onSubmit: (input: ClaimInput | ClaimUpdate) => Promise<void>;
};

const inputClass = "h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]";
const labelClass = "space-y-1.5 text-sm font-medium text-[#17243a]";

export function ClaimFormModal({ claim, assets, documents, pending, onAssetChange, onClose, onSubmit }: Props) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const serviceCenter = String(form.get("serviceCenter") ?? "").trim() || undefined;

    if (claim) {
      await onSubmit({
        title: String(form.get("title")).trim(),
        issueDescription: String(form.get("issueDescription")).trim(),
        serviceCenter: serviceCenter ?? null,
        resolution: String(form.get("resolution") ?? "").trim() || null,
        status: String(form.get("status")) as ClaimStatus,
      });
      return;
    }

    await onSubmit({
      productId: String(form.get("productId")),
      title: String(form.get("title")).trim(),
      issueDescription: String(form.get("issueDescription")).trim(),
      serviceCenter,
      status: String(form.get("status")) as "DRAFT" | "SUBMITTED",
      documentIds: selectedDocuments,
    });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="claim-form-title">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4"><div><h2 id="claim-form-title" className="text-xl font-semibold text-[#111d32]">{claim ? "Update claim" : "Create a claim"}</h2><p className="mt-1 text-sm text-[#686d77]">{claim ? `Claim #${claim.claimNumber}` : "Start a claim from one of your registered assets."}</p></div><button onClick={onClose} className="rounded-lg p-2 text-xl text-[#596170] hover:bg-[#eef1f8]" aria-label="Close claim form">×</button></div>
      <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
        {!claim && <label className={`${labelClass} sm:col-span-2`}>Asset <span className="text-[#ba1a1a]">*</span><select name="productId" required defaultValue="" onChange={(event) => { setSelectedDocuments([]); onAssetChange(event.target.value); }} className={inputClass}><option value="" disabled>Select an asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.brand}</option>)}</select></label>}
        <label className={`${labelClass} sm:col-span-2`}>Issue title <span className="text-[#ba1a1a]">*</span><input name="title" required minLength={3} maxLength={150} defaultValue={claim?.title} placeholder="e.g. Display stopped working" className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Issue description <span className="text-[#ba1a1a]">*</span><textarea name="issueDescription" required minLength={10} maxLength={3000} rows={5} defaultValue={claim?.issueDescription} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]"/></label>
        <label className={labelClass}>Service center<input name="serviceCenter" maxLength={200} defaultValue={claim?.serviceCenter ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Status <span className="text-[#ba1a1a]">*</span><select name="status" defaultValue={claim?.status ?? "SUBMITTED"} className={inputClass}>{claim ? <><option value="DRAFT">Draft</option><option value="SUBMITTED">Submitted</option><option value="UNDER_REVIEW">Under review</option><option value="APPROVED">Approved</option><option value="REJECTED">Rejected</option><option value="RESOLVED">Resolved</option><option value="CANCELLED">Cancelled</option></> : <><option value="SUBMITTED">Submit now</option><option value="DRAFT">Save as draft</option></>}</select></label>
        {claim && <label className={`${labelClass} sm:col-span-2`}>Resolution<textarea name="resolution" maxLength={3000} rows={3} defaultValue={claim.resolution ?? ""} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]"/></label>}
        {!claim && documents.length > 0 && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-[#17243a]">Attach asset documents</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{documents.map((document) => <label key={document.id} className="flex items-center gap-3 rounded-lg border border-[#dfe2ea] bg-white p-3 text-sm"><input type="checkbox" checked={selectedDocuments.includes(document.id)} onChange={(event) => setSelectedDocuments((current) => event.target.checked ? [...current, document.id] : current.filter((id) => id !== document.id))}/><span className="min-w-0 truncate">{document.fileName}</span></label>)}</div></fieldset>}
        <div className="flex justify-end gap-3 border-t border-[#e1e4ec] pt-5 sm:col-span-2"><button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-5 text-sm font-semibold">Cancel</button><button disabled={pending || (!claim && assets.length === 0)} className="h-11 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white hover:bg-[#6e5cf5] disabled:opacity-50">{pending ? "Saving…" : claim ? "Save changes" : "Create claim"}</button></div>
      </form>
    </div>
  </div>;
}
