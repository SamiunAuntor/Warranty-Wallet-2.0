"use client";

import { useRef, useState } from "react";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import type { Asset } from "@/lib/assets-api";
import { claimStatusLabels } from "@/lib/claim-display";
import { deleteDocument, replaceDocument, uploadDocuments, type DocumentType } from "@/lib/documents-api";
import { dialog, toast } from "@/lib/notifications";
import { prepareUploadFile } from "@/lib/upload-files";
import { usePreferences } from "@/contexts/preferences-context";

type Props = { asset: Asset; loading?: boolean; onClose: () => void; onEdit: () => void; onDelete: () => void; onRaiseClaim: () => void; onFilesChanged: () => Promise<void> };
type AssetFile = NonNullable<Asset["documents"]>[number];

const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value)) : "Not provided";
const labels: Record<string, string> = { INVOICE: "Invoice", WARRANTY_CARD: "Warranty card", RECEIPT: "Receipt", OTHER: "Other document", PRODUCT_IMAGE: "Arrival-condition photo", CLAIM_EVIDENCE: "Claim evidence", CLAIM_CONDITION: "Pre-claim condition photo" };
const size = (bytes: number | null) => !bytes ? "Size unavailable" : bytes < 1048576 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / 1048576).toFixed(1)} MB`;

export function AssetDetailsModal({ asset, loading = false, onClose, onEdit, onDelete, onRaiseClaim, onFilesChanged }: Props) {
  const { firebaseUser } = useAuth();
  const { formatDate, formatMoney } = usePreferences();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploadType, setUploadType] = useState<DocumentType>("RECEIPT");
  const [busy, setBusy] = useState<string | null>(null);
  const documents = asset.documents ?? [];
  const purchaseFiles = documents.filter((file) => !["PRODUCT_IMAGE", "CLAIM_EVIDENCE", "CLAIM_CONDITION"].includes(file.fileType));
  const conditionPhotos = documents.filter((file) => file.fileType === "PRODUCT_IMAGE");
  const claimFiles = documents.filter((file) => ["CLAIM_EVIDENCE", "CLAIM_CONDITION"].includes(file.fileType));
  const headerImage = asset.productImageUrl || conditionPhotos[0]?.fileUrl;
  const rows = [["Brand", asset.brand], ["Model", asset.model || "Not provided"], ["Category", asset.category.name], ["Serial number", asset.serialNumber || "Not provided"], ["Purchase price", formatMoney(Number(asset.purchasePrice))], ["Purchase date", formatDate(asset.purchaseDate)], ["Warranty expires", formatDate(asset.expiryDate)], ["Warranty type", !asset.hasWarranty ? "No warranty" : asset.warrantyType === "EXTENDED" ? "Extended" : "Manufacturer"], ["Asset state", asset.lifecycleStatus === "ARCHIVED" ? "Archived" : "Added"], ["Seller", asset.sellerName || "Not provided"], ["Documents", String(documents.length)]];

  const download = (file: AssetFile) => { const anchor = window.document.createElement("a"); anchor.href = file.fileUrl; anchor.download = file.fileName; anchor.target = "_blank"; anchor.rel = "noreferrer"; anchor.click(); };
  const addFile = async (file: File) => { if (!firebaseUser) return; setBusy("upload"); try { await uploadDocuments(await firebaseUser.getIdToken(), asset.id, uploadType, [await prepareUploadFile(file)]); await onFilesChanged(); toast.success("File added to this asset."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not upload the file."); } finally { setBusy(null); if (inputRef.current) inputRef.current.value = ""; } };
  const replace = async (fileRecord: AssetFile, replacement: File) => { if (!firebaseUser) return; setBusy(fileRecord.id); try { await replaceDocument(await firebaseUser.getIdToken(), fileRecord.id, await prepareUploadFile(replacement)); await onFilesChanged(); toast.success("File replaced successfully."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not replace the file."); } finally { setBusy(null); } };
  const remove = async (file: AssetFile) => { if (!firebaseUser) return; const answer = await dialog.confirm("Delete this file?", `${file.fileName} will be permanently removed from this asset.`); if (!answer.isConfirmed) return; setBusy(file.id); try { await deleteDocument(await firebaseUser.getIdToken(), file.id); await onFilesChanged(); toast.success("File deleted."); } catch (error) { toast.error(error instanceof Error ? error.message : "Could not delete the file."); } finally { setBusy(null); } };

  const FileGroup = ({ title, files }: { title: string; files: AssetFile[] }) => files.length ? (
    <div className="mt-6">
      <h4 className="text-sm font-semibold text-[#273247]">{title}</h4>
      <div className="mt-2 overflow-hidden rounded-xl border border-[#e4e6ef] bg-white">
        {files.map((file, index) => {
          const locked = Boolean(file._count?.claims);
          return <article key={file.id} className={`flex flex-col gap-3 px-4 py-3.5 sm:flex-row sm:items-center ${index ? "border-t border-[#eceef4]" : ""}`}>
            <div className="flex min-w-0 flex-1 items-center gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-[#f0eeff] text-[#5b47ee]"><Icon name={file.fileType.includes("IMAGE") || file.fileType.includes("CONDITION") ? "image" : "documents"} className="h-4 w-4"/></span>
              <div className="min-w-0"><p className="truncate text-sm font-medium text-[#273247]">{file.fileName}</p><p className="mt-0.5 text-xs text-[#777d88]">{labels[file.fileType] ?? file.fileType.replaceAll("_", " ")} · {size(file.fileSize)} · {date(file.createdAt)}</p>{locked && <p className="mt-1 text-xs font-medium text-[#986600]">Attached to a claim</p>}</div>
            </div>
            <div className="flex shrink-0 flex-wrap items-center gap-1">
              <a href={file.fileUrl} target="_blank" rel="noreferrer" className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4b41e1] hover:bg-[#f0eeff]">View</a>
              <button onClick={() => download(file)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4b5567] hover:bg-[#f2f4f8]">Download</button>
              <label className={`rounded-lg px-3 py-2 text-xs font-semibold text-[#4b41e1] hover:bg-[#f0eeff] ${locked || busy === file.id ? "cursor-not-allowed opacity-45" : "cursor-pointer"}`}>Replace<input type="file" disabled={locked || busy === file.id} accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const selected = event.target.files?.[0]; if (selected) void replace(file, selected); event.target.value = ""; }}/></label>
              <button disabled={locked || busy === file.id} onClick={() => void remove(file)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#a83e4c] hover:bg-[#fff0f1] disabled:opacity-45">Delete</button>
            </div>
          </article>;
        })}
      </div>
    </div>
  ) : null;

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="asset-details-title"><div className="relative max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-l-2xl bg-white shadow-2xl">{loading && <div className="absolute inset-x-0 bottom-0 top-28 z-20 flex min-h-72 items-center justify-center bg-white/90 backdrop-blur-[1px]"><Loading fullScreen={false} label="Loading current asset details"/></div>}<div className="flex items-start justify-between bg-[#f5f6ff] p-6"><div className="flex gap-4"><div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#e4e8ff] text-[#4b41e1]">{headerImage ? <img src={headerImage} alt={asset.name} className="h-full w-full object-cover"/> : <Icon name="products" className="h-8 w-8"/>}</div><div><span className="rounded-full bg-[#e5f7ed] px-2.5 py-1 text-[11px] font-semibold text-[#2c8657]">{asset.warrantyStatus.replaceAll("_", " ")}</span><h2 id="asset-details-title" className="mt-2 text-2xl font-semibold text-[#111d32]">{asset.name}</h2></div></div><button onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-white" aria-label="Close asset details">×</button></div>
    <div className="grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="border-b border-[#eceef4] pb-3"><p className="text-xs font-medium uppercase tracking-wide text-[#787e8a]">{label}</p><p className="mt-1 text-sm font-medium text-[#17243a]">{value}</p></div>)}{asset.notes && <div className="sm:col-span-2"><p className="text-xs font-medium uppercase tracking-wide text-[#787e8a]">Notes</p><p className="mt-2 rounded-lg bg-[#f7f8fc] p-3 text-sm leading-6 text-[#45464d]">{asset.notes}</p></div>}</div>
    <section className="border-t border-[#e7e9f0] px-6 py-6"><div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between"><div><h3 className="font-semibold text-[#17243a]">Asset files</h3><p className="mt-1 text-xs text-[#707684]">Documents and condition photos saved with this asset.</p></div><div className="flex gap-2"><select value={uploadType} onChange={(event) => setUploadType(event.target.value as DocumentType)} className="h-10 rounded-lg border border-[#d9dce6] bg-white px-3 text-sm outline-none focus:border-[#5b47ee]"><option value="RECEIPT">Receipt</option><option value="INVOICE">Invoice</option><option value="WARRANTY_CARD">Warranty card</option><option value="OTHER">Other document</option><option value="PRODUCT_IMAGE">Condition photo</option></select><input ref={inputRef} type="file" accept=".pdf,.jpg,.jpeg,.png,.webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void addFile(file); }}/><button disabled={busy === "upload"} onClick={() => inputRef.current?.click()} className="h-10 rounded-lg bg-[#4b41e1] px-4 text-sm font-semibold text-white disabled:opacity-50">{busy === "upload" ? "Uploading…" : "Add file"}</button></div></div><FileGroup title="Purchase and warranty documents" files={purchaseFiles}/><FileGroup title="Arrival-condition photos" files={conditionPhotos}/><FileGroup title="Claim and service evidence" files={claimFiles}/>{documents.length === 0 && <p className="mt-4 rounded-lg border border-dashed p-5 text-center text-sm text-[#686d77]">No files are stored for this asset yet.</p>}</section>
    {asset.claims && asset.claims.length > 0 && <section className="border-t border-[#e7e9f0] px-6 py-5"><h3 className="font-semibold text-[#17243a]">Claim history</h3><div className="mt-3 space-y-2">{asset.claims.map((claim) => <div key={claim.id} className="flex items-center justify-between rounded-lg bg-[#f7f8fc] p-3"><div><p className="text-sm font-semibold text-[#17243a]">{claim.title}</p><p className="text-xs text-[#707684]">{claim.claimNumber} · {date(claim.updatedAt)}</p></div><span className="rounded-full bg-[#eee9ff] px-2.5 py-1 text-xs font-semibold text-[#5942d6]">{claimStatusLabels[claim.status]}</span></div>)}</div></section>}
    <div className="flex flex-col justify-between gap-2 border-t border-[#e7e9f0] bg-[#fafbfe] p-4 sm:flex-row"><button onClick={onDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#ba1a1a] hover:bg-[#fff0f0]">Delete asset</button><div className="flex flex-wrap gap-2"><button onClick={onRaiseClaim} className="rounded-lg border border-[#5b47ee] bg-white px-4 py-2 text-sm font-semibold text-[#5b47ee]">Raise a claim</button><button onClick={onClose} className="rounded-lg border bg-white px-4 py-2 text-sm font-semibold">Close</button><button onClick={onEdit} className="rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white">Edit asset</button></div></div></div></div>;
}
