"use client";

import { useState, type FormEvent } from "react";
import type { Asset } from "@/lib/assets-api";
import { claimStatuses, terminalClaimStatuses, type AssetDocument, type Claim, type ClaimInput, type ClaimStatus, type ClaimUpdate } from "@/lib/claims-api";
import { claimStatusLabels } from "@/lib/claim-display";

type Props = { claim?: Claim | null; assets: Asset[]; documents: AssetDocument[]; pending: boolean; initialAssetId?: string; onAssetChange: (id: string) => void; onClose: () => void; onSubmit: (input: ClaimInput | ClaimUpdate) => Promise<void> };
const input = "h-11 w-full rounded-lg border border-[#d7dae4] bg-white px-3 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e7e3ff]";
const label = "space-y-1.5 text-sm font-medium text-[#17243a]";

export function ClaimFormModal({ claim, assets, documents, pending, initialAssetId = "", onAssetChange, onClose, onSubmit }: Props) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [conditionPhotos, setConditionPhotos] = useState<File[]>([]);
  const [status, setStatus] = useState<ClaimStatus>(claim?.status ?? "SUBMITTED");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault(); const form = new FormData(event.currentTarget);
    const common = {
      title: String(form.get("title")).trim(), issueDescription: String(form.get("issueDescription")).trim(),
      serviceCenter: String(form.get("serviceCenter") || "").trim() || undefined,
      providerReference: String(form.get("providerReference") || "").trim() || undefined,
      submittedCondition: String(form.get("submittedCondition") || "").trim() || undefined,
      resolution: String(form.get("resolution") || "").trim() || undefined, status,
    };
    if (claim) { await onSubmit(common); return; }
    await onSubmit({ ...common, productId: String(form.get("productId")), documentIds: selectedDocuments, pendingEvidence: [...evidenceFiles.map((file) => ({ file, kind: "CLAIM_EVIDENCE" as const })), ...conditionPhotos.map((file) => ({ file, kind: "CLAIM_CONDITION" as const }))] });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e6e8ef] bg-white px-6 py-4"><div><h2 className="text-xl font-semibold text-[#111d32]">{claim ? "Edit claim" : "Create claim"}</h2><p className="mt-1 text-sm text-[#686d77]">{claim ? `Claim #${claim.claimNumber}` : "Record an issue for one of your assets."}</p></div><button type="button" onClick={onClose} className="rounded-lg p-2 text-xl text-[#596170] hover:bg-[#eef1f8]" aria-label="Close">×</button></header>
      <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
        {!claim && <label className={`${label} sm:col-span-2`}>Asset <span className="text-[#ba1a1a]">*</span><select name="productId" required defaultValue={initialAssetId} onChange={(event) => { setSelectedDocuments([]); onAssetChange(event.target.value); }} className={input}><option value="" disabled>Select an asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.brand}</option>)}</select></label>}
        <label className={`${label} sm:col-span-2`}>Issue title <span className="text-[#ba1a1a]">*</span><input name="title" required minLength={3} maxLength={150} defaultValue={claim?.title} placeholder="e.g. Screen stopped working" className={input}/></label>
        <label className={`${label} sm:col-span-2`}>What happened? <span className="text-[#ba1a1a]">*</span><textarea name="issueDescription" required minLength={10} maxLength={3000} rows={4} defaultValue={claim?.issueDescription} className="w-full rounded-lg border border-[#d7dae4] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b47ee]"/></label>
        <label className={label}>Service center or provider<input name="serviceCenter" maxLength={200} defaultValue={claim?.serviceCenter ?? ""} className={input}/></label>
        <label className={label}>Reference number<input name="providerReference" maxLength={200} defaultValue={claim?.providerReference ?? ""} className={input}/></label>
        <label className={`${label} sm:col-span-2`}>Product condition before the claim<textarea name="submittedCondition" maxLength={3000} rows={3} defaultValue={claim?.submittedCondition ?? ""} placeholder="Visible damage, missing parts, or other important details" className="w-full rounded-lg border border-[#d7dae4] bg-white px-3 py-2 text-sm"/></label>
        <label className={label}>Status <span className="text-[#ba1a1a]">*</span><select value={status} onChange={(event) => setStatus(event.target.value as ClaimStatus)} className={input}>{claimStatuses.map((value) => <option key={value} value={value}>{claimStatusLabels[value]}</option>)}</select></label>
        {terminalClaimStatuses.includes(status) && <label className={`${label} sm:col-span-2`}>Closing note <span className="text-[#ba1a1a]">*</span><textarea name="resolution" required minLength={3} maxLength={3000} rows={3} defaultValue={claim?.resolution ?? ""} placeholder="Describe the result or reason" className="w-full rounded-lg border border-[#d7dae4] bg-white px-3 py-2 text-sm"/></label>}
        {!claim && documents.length > 0 && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-[#17243a]">Attach existing asset documents</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{documents.map((document) => <label key={document.id} className="flex items-center gap-3 rounded-lg border border-[#dfe2ea] bg-white p-3 text-sm"><input type="checkbox" checked={selectedDocuments.includes(document.id)} onChange={(event) => setSelectedDocuments((current) => event.target.checked ? [...current, document.id] : current.filter((id) => id !== document.id))}/><span className="min-w-0 truncate">{document.fileName}</span></label>)}</div></fieldset>}
        {!claim && <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2"><label className={`${label} rounded-xl border border-dashed border-[#c4c8d4] bg-white p-4`}>Supporting documents<input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setEvidenceFiles(Array.from(event.target.files ?? []).slice(0, 5))} className="mt-2 block w-full text-xs"/><span className="block text-xs font-normal text-[#686d77]">PDF, JPG, PNG, or WebP · up to 10 MB each</span></label><label className={`${label} rounded-xl border border-dashed border-[#c4c8d4] bg-white p-4`}>Current condition photos<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setConditionPhotos(Array.from(event.target.files ?? []).slice(0, 5))} className="mt-2 block w-full text-xs"/><span className="block text-xs font-normal text-[#686d77]">JPG, PNG, or WebP · up to 10 MB each</span></label></div>}
        <footer className="flex justify-end gap-3 border-t border-[#e6e8ef] pt-5 sm:col-span-2"><button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-lg border border-[#d1d4dd] bg-white px-5 text-sm font-semibold">Cancel</button><button disabled={pending || (!claim && !assets.length)} className="h-11 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white disabled:opacity-50">{pending ? "Saving…" : claim ? "Save changes" : "Create claim"}</button></footer>
      </form>
    </div>
  </div>;
}
