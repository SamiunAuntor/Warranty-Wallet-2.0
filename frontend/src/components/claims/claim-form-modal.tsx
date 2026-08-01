"use client";

import { useState, type FormEvent } from "react";
import type { Asset } from "@/lib/assets-api";
import { claimTransitions, type AssetDocument, type Claim, type ClaimInput, type ClaimRecordType, type ClaimResolutionOutcome, type ClaimServicePurpose, type ClaimStatus, type ClaimUpdate } from "@/lib/claims-api";
import { claimOutcomeLabels, claimStatusLabels } from "@/lib/claim-display";

type Props = {
  claim?: Claim | null;
  assets: Asset[];
  documents: AssetDocument[];
  pending: boolean;
  isAdmin: boolean;
  initialAssetId?: string;
  initialParentClaimId?: string;
  onAssetChange: (assetId: string) => void;
  onClose: () => void;
  onSubmit: (input: ClaimInput | ClaimUpdate) => Promise<void>;
};

const inputClass = "h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]";
const labelClass = "space-y-1.5 text-sm font-medium text-[#17243a]";

export function ClaimFormModal({ claim, assets, documents, pending, isAdmin, initialAssetId = "", initialParentClaimId = "", onAssetChange, onClose, onSubmit }: Props) {
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([]);
  const [recordType, setRecordType] = useState<ClaimRecordType>("WARRANTY_CLAIM");
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [conditionPhotos, setConditionPhotos] = useState<File[]>([]);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const serviceCenter = String(form.get("serviceCenter") ?? "").trim() || undefined;

    if (claim) {
      const update: ClaimUpdate = {
        title: String(form.get("title")).trim(),
        issueDescription: String(form.get("issueDescription")).trim(),
        serviceCenter: serviceCenter ?? null,
      };
      if (isAdmin) {
        update.resolution = String(form.get("resolution") ?? "").trim() || null;
        update.resolutionOutcome = (String(form.get("resolutionOutcome") ?? "") || null) as ClaimResolutionOutcome | null;
        update.status = String(form.get("status")) as ClaimStatus;
      }
      await onSubmit(update);
      return;
    }

    await onSubmit({
      productId: String(form.get("productId")),
      recordType,
      parentClaimId: initialParentClaimId || undefined,
      title: String(form.get("title")).trim(),
      issueDescription: String(form.get("issueDescription")).trim(),
      serviceCenter,
      servicePurpose: (String(form.get("servicePurpose") ?? "") || undefined) as ClaimServicePurpose | undefined,
      serviceDate: String(form.get("serviceDate") ?? "") || undefined,
      providerReference: String(form.get("providerReference") ?? "").trim() || undefined,
      submittedCondition: String(form.get("submittedCondition") ?? "").trim() || undefined,
      userCost: form.get("userCost") ? Number(form.get("userCost")) : undefined,
      resolution: String(form.get("resolution") ?? "").trim() || undefined,
      resolutionOutcome: (String(form.get("resolutionOutcome") ?? "") || undefined) as ClaimResolutionOutcome | undefined,
      status: recordType === "SERVICE_RECORD" ? "RESOLVED" : String(form.get("status")) as "DRAFT" | "SUBMITTED",
      documentIds: selectedDocuments,
      pendingEvidence: [
        ...evidenceFiles.map((file) => ({ file, kind: "CLAIM_EVIDENCE" as const })),
        ...conditionPhotos.map((file) => ({ file, kind: "CLAIM_CONDITION" as const })),
      ],
    });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="claim-form-title">
    <div className="max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4"><div><h2 id="claim-form-title" className="text-xl font-semibold text-[#111d32]">{claim ? "Update claim" : "Create a claim"}</h2><p className="mt-1 text-sm text-[#686d77]">{claim ? `Claim #${claim.claimNumber}` : "Start a claim from one of your registered assets."}</p></div><button onClick={onClose} className="rounded-lg p-2 text-xl text-[#596170] hover:bg-[#eef1f8]" aria-label="Close claim form">×</button></div>
      <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
        {!claim && <label className={`${labelClass} sm:col-span-2`}>Asset <span className="text-[#ba1a1a]">*</span><select name="productId" required defaultValue={initialAssetId} onChange={(event) => { setSelectedDocuments([]); onAssetChange(event.target.value); }} className={inputClass}><option value="" disabled>Select an asset</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name} · {asset.brand}</option>)}</select></label>}
        {!claim && <fieldset className="grid gap-3 sm:col-span-2 sm:grid-cols-2"><legend className="mb-2 text-sm font-medium text-[#17243a]">What would you like to record?</legend><button type="button" onClick={() => setRecordType("WARRANTY_CLAIM")} className={`rounded-xl border p-4 text-left ${recordType === "WARRANTY_CLAIM" ? "border-[#5b47ee] bg-[#f1efff]" : "border-[#dfe2ea] bg-white"}`}><span className="block font-semibold">Formal warranty claim</span><span className="mt-1 block text-xs text-[#686d77]">Submit an issue and track its review and resolution.</span></button><button type="button" onClick={() => setRecordType("SERVICE_RECORD")} className={`rounded-xl border p-4 text-left ${recordType === "SERVICE_RECORD" ? "border-[#5b47ee] bg-[#f1efff]" : "border-[#dfe2ea] bg-white"}`}><span className="block font-semibold">Service or repair record</span><span className="mt-1 block text-xs text-[#686d77]">Store an inspection, repair, or instantly resolved visit.</span></button></fieldset>}
        <label className={`${labelClass} sm:col-span-2`}>Issue title <span className="text-[#ba1a1a]">*</span><input name="title" required minLength={3} maxLength={150} defaultValue={claim?.title} placeholder="e.g. Display stopped working" className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Issue description <span className="text-[#ba1a1a]">*</span><textarea name="issueDescription" required minLength={10} maxLength={3000} rows={5} defaultValue={claim?.issueDescription} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]"/></label>
        <label className={labelClass}>Service center<input name="serviceCenter" maxLength={200} defaultValue={claim?.serviceCenter ?? ""} className={inputClass}/></label>
        {!claim && <label className={labelClass}>Provider reference<input name="providerReference" maxLength={200} placeholder="Job, ticket, or receipt number" className={inputClass}/></label>}
        {!claim && recordType === "SERVICE_RECORD" && <><label className={labelClass}>Service purpose <span className="text-[#ba1a1a]">*</span><select name="servicePurpose" required className={inputClass}><option value="">Select purpose</option>{["REPAIR","INSPECTION","MAINTENANCE","INSTALLATION","DAMAGE_ASSESSMENT","WARRANTY_CONSULTATION","OTHER"].map((value) => <option key={value} value={value}>{value.replaceAll("_", " ").toLowerCase()}</option>)}</select></label><label className={labelClass}>Service date<input name="serviceDate" type="date" className={inputClass}/></label><label className={labelClass}>Your cost<input name="userCost" type="number" min="0" step="0.01" className={inputClass}/></label><label className={labelClass}>Outcome <span className="text-[#ba1a1a]">*</span><select name="resolutionOutcome" required className={inputClass}><option value="">Select outcome</option>{Object.entries(claimOutcomeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><label className={`${labelClass} sm:col-span-2`}>Service summary <span className="text-[#ba1a1a]">*</span><textarea name="resolution" required minLength={3} maxLength={3000} rows={3} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm"/></label></>}
        {!claim && <label className={`${labelClass} sm:col-span-2`}>Physical condition before submission or service<textarea name="submittedCondition" maxLength={3000} rows={3} placeholder="Describe scratches, dents, cracks, missing parts, packaging condition, and whether the product still powers on." className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm"/></label>}
        {((!claim && recordType === "WARRANTY_CLAIM") || isAdmin) && <label className={labelClass}>Status <span className="text-[#ba1a1a]">*</span><select name="status" defaultValue={claim?.status ?? "SUBMITTED"} className={inputClass}>{claim ? <><option value={claim.status}>{claimStatusLabels[claim.status]}</option>{claimTransitions[claim.status].map((status) => <option key={status} value={status}>{claimStatusLabels[status]}</option>)}</> : <><option value="SUBMITTED">Submit now</option><option value="DRAFT">Save as draft</option></>}</select></label>}
        {claim && isAdmin && <label className={labelClass}>Completion outcome<select name="resolutionOutcome" defaultValue={claim.resolutionOutcome ?? ""} className={inputClass}><option value="">Not completed yet</option>{Object.entries(claimOutcomeLabels).map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>}
        {claim && isAdmin && <label className={`${labelClass} sm:col-span-2`}>Resolution<textarea name="resolution" maxLength={3000} rows={3} defaultValue={claim.resolution ?? ""} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none focus:border-[#5b47ee] focus:ring-2 focus:ring-[#e4dfff]"/></label>}
        {!claim && documents.length > 0 && <fieldset className="sm:col-span-2"><legend className="text-sm font-medium text-[#17243a]">Attach asset documents</legend><div className="mt-2 grid gap-2 sm:grid-cols-2">{documents.map((document) => <label key={document.id} className="flex items-center gap-3 rounded-lg border border-[#dfe2ea] bg-white p-3 text-sm"><input type="checkbox" checked={selectedDocuments.includes(document.id)} onChange={(event) => setSelectedDocuments((current) => event.target.checked ? [...current, document.id] : current.filter((id) => id !== document.id))}/><span className="min-w-0 truncate">{document.fileName}</span></label>)}</div></fieldset>}
        {!claim && <div className="grid gap-4 sm:col-span-2 sm:grid-cols-2"><label className={`${labelClass} rounded-xl border border-dashed border-[#bfc4d2] bg-white p-4`}>New supporting evidence<input type="file" multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => setEvidenceFiles(Array.from(event.target.files ?? []).slice(0, 5))} className="mt-2 block w-full text-xs"/><span className="block text-xs font-normal text-[#686d77]">Receipts, estimates, reports, correspondence, or damage photos.</span></label><label className={`${labelClass} rounded-xl border border-dashed border-[#bfc4d2] bg-white p-4`}>Pre-submission condition photos<input type="file" multiple accept="image/jpeg,image/png,image/webp" onChange={(event) => setConditionPhotos(Array.from(event.target.files ?? []).slice(0, 5))} className="mt-2 block w-full text-xs"/><span className="block text-xs font-normal text-[#686d77]">Photograph all sides, serial number, packaging, and visible damage.</span></label></div>}
        <div className="flex justify-end gap-3 border-t border-[#e1e4ec] pt-5 sm:col-span-2"><button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-5 text-sm font-semibold">Cancel</button><button disabled={pending || (!claim && assets.length === 0)} className="h-11 rounded-lg bg-[#5b47ee] px-5 text-sm font-semibold text-white hover:bg-[#6e5cf5] disabled:opacity-50">{pending ? "Saving…" : claim ? "Save changes" : "Create claim"}</button></div>
      </form>
    </div>
  </div>;
}
