"use client";

import { useMemo, useState } from "react";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import type { AssetInput, Brand, Category } from "@/lib/assets-api";
import {
  extractAssetDocument,
  type ExtractedAssetData,
  type PendingAssetDocument,
} from "@/lib/documents-api";
import { toast } from "@/lib/notifications";
import { MAX_PDF_SIZE_MB, MAX_SOURCE_IMAGE_SIZE_MB, prepareUploadFiles } from "@/lib/upload-files";

type Props = {
  categories: Category[];
  brands: Brand[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: AssetInput, documents: PendingAssetDocument[]) => Promise<void>;
};

type SupportedDocumentType = PendingAssetDocument["type"];

const normalized = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function mergeExtraction(current: ExtractedAssetData, next: ExtractedAssetData) {
  const merged = { ...current };
  for (const [key, value] of Object.entries(next)) {
    if ((merged[key as keyof ExtractedAssetData] === null || merged[key as keyof ExtractedAssetData] === undefined || merged[key as keyof ExtractedAssetData] === "") && value !== null && value !== undefined && value !== "") {
      Object.assign(merged, { [key]: value });
    }
  }
  return merged;
}

function toAssetDraft(extracted: ExtractedAssetData, categories: Category[], brands: Brand[]): Partial<AssetInput> {
  const category = extracted.category
    ? categories.find((item) => {
        const candidate = normalized(item.name);
        const suggestion = normalized(extracted.category ?? "");
        return candidate === suggestion || candidate.includes(suggestion) || suggestion.includes(candidate);
      })
    : undefined;
  const brand = extracted.brand
    ? brands.find((item) => normalized(item.name) === normalized(extracted.brand ?? ""))
    : undefined;

  return {
    name: extracted.productName ?? undefined,
    brand: brand?.name ?? extracted.brand ?? undefined,
    brandId: brand?.id ?? null,
    model: extracted.model ?? undefined,
    serialNumber: extracted.serialNumber ?? undefined,
    categoryId: category?.id,
    purchaseDate: extracted.purchaseDate ?? undefined,
    purchasePrice: extracted.purchasePrice ?? undefined,
    sellerName: extracted.sellerName ?? undefined,
    hasWarranty: Boolean(extracted.warrantyDuration),
    warrantyDuration: extracted.warrantyDuration || undefined,
    warrantyType: extracted.warrantyType ?? "MANUFACTURER",
  };
}

export function AssetOnboardingModal({ categories, brands, pending, onClose, onSubmit }: Props) {
  const { firebaseUser } = useAuth();
  const [files, setFiles] = useState<File[]>([]);
  const [documentType, setDocumentType] = useState<SupportedDocumentType>("RECEIPT");
  const [extracting, setExtracting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedAssetData | null>(null);
  const [fileExtractions, setFileExtractions] = useState<ExtractedAssetData[]>([]);
  const [showForm, setShowForm] = useState(false);

  const draft = useMemo(
    () => toAssetDraft(extracted ?? {}, categories, brands),
    [brands, categories, extracted],
  );

  const chooseFiles = async (selected: FileList | null) => {
    if (!selected) return;
    const next = Array.from(selected);
    if ((documentType === "INVOICE" || documentType === "WARRANTY_CARD") && next.length > 1) {
      toast.warning("Only one invoice or warranty card can be attached to an asset.");
      return;
    }
    setPreparing(true);
    try {
      setFiles(await prepareUploadFiles(next));
      setExtracted(null);
      setFileExtractions([]);
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "The selected files are invalid.");
    } finally {
      setPreparing(false);
    }
  };

  const analyze = async () => {
    if (!firebaseUser || files.length === 0) return;
    setExtracting(true);
    setProcessedCount(0);
    try {
      const token = await firebaseUser.getIdToken();
      let combined: ExtractedAssetData = {};
      const results: ExtractedAssetData[] = [];
      for (const file of files) {
        const result = await extractAssetDocument(token, file);
        results.push(result);
        combined = mergeExtraction(combined, result);
        setProcessedCount((count) => count + 1);
      }
      setFileExtractions(results);
      setExtracted(combined);
      setShowForm(true);
      toast.success("AI extraction complete. Review the details before saving.");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "The documents could not be analyzed.");
    } finally {
      setExtracting(false);
    }
  };

  if (showForm) {
    const documents = files.map((file, index) => ({ file, type: documentType, extractedData: fileExtractions[index] }));
    return <AssetFormModal
      initialValues={draft}
      categories={categories}
      brands={brands}
      pending={pending}
      onClose={onClose}
      onBack={() => setShowForm(false)}
      onSubmit={(input) => onSubmit(input, documents)}
    />;
  }

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="asset-upload-title">
    <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#4b41e1]">Step 1 of 2</p><h2 id="asset-upload-title" className="mt-1 text-xl font-semibold text-[#111d32]">Upload purchase documents</h2><p className="mt-1 text-sm text-[#686d77]">AI will read them and prepare the asset details for your review.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-[#eef1f8]" aria-label="Close asset workflow">×</button>
      </div>

      <div className="space-y-5 p-6">
        <label className="block space-y-2 text-sm font-medium text-[#17243a]">Document kind
          <select value={documentType} onChange={(event) => { setDocumentType(event.target.value as SupportedDocumentType); setFiles([]); }} className="h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 outline-none focus:border-[#4b41e1]">
            <option value="RECEIPT">Receipt</option>
            <option value="INVOICE">Invoice</option>
            <option value="WARRANTY_CARD">Warranty card</option>
          </select>
        </label>

        <label className="flex min-h-52 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#bfc4d3] bg-white px-6 text-center transition hover:border-[#4b41e1] hover:bg-[#f5f4ff]">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e9e7ff] text-[#4b41e1]"><Icon name="upload" className="h-7 w-7"/></span>
          <span className="mt-4 font-semibold text-[#17243a]">Choose document{documentType === "RECEIPT" ? "s" : ""}</span>
          <span className="mt-1 text-sm text-[#686d77]">Images up to {MAX_SOURCE_IMAGE_SIZE_MB} MB · PDFs up to {MAX_PDF_SIZE_MB} MB</span>
          <span className="mt-1 text-xs text-[#858a95]">Large phone photos are optimized automatically.</span>
          <input type="file" multiple={documentType === "RECEIPT"} accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(event) => void chooseFiles(event.target.files)} className="sr-only"/>
        </label>

        {files.length > 0 && <div className="rounded-xl border border-[#dfe2ea] bg-white p-4"><p className="text-sm font-semibold text-[#17243a]">Selected files</p><ul className="mt-2 space-y-2">{files.map((file) => <li key={`${file.name}-${file.lastModified}`} className="flex items-center justify-between gap-4 text-sm"><span className="min-w-0 truncate text-[#394254]">{file.name}</span><span className="shrink-0 text-xs text-[#737986]">{(file.size / 1024 / 1024).toFixed(2)} MB</span></li>)}</ul></div>}

        {preparing && <div className="rounded-lg bg-[#eeecff] px-4 py-3 text-sm text-[#4b41e1]" aria-live="polite">Optimizing selected images…</div>}
        {extracting && <div className="rounded-lg bg-[#eeecff] px-4 py-3 text-sm text-[#4b41e1]" aria-live="polite">Analyzing document {Math.min(processedCount + 1, files.length)} of {files.length}…</div>}

        <div className="flex items-center justify-between border-t border-[#e1e4ec] pt-5">
          <button type="button" onClick={() => { setExtracted({}); setShowForm(true); }} disabled={extracting || preparing} className="text-sm font-semibold text-[#596170] hover:text-[#4b41e1]">Enter details manually</button>
          <button type="button" onClick={() => void analyze()} disabled={extracting || preparing || files.length === 0} className="flex h-11 items-center gap-2 rounded-lg bg-[#4b41e1] px-5 text-sm font-semibold text-white hover:bg-[#645efb] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="sparkles" className="h-4 w-4"/>{extracting ? "Analyzing…" : preparing ? "Optimizing…" : "Analyze with AI"}</button>
        </div>
      </div>
    </div>
  </div>;
}
