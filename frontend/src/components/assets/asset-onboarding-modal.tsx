"use client";

import { useMemo, useState } from "react";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { Icon } from "@/components/icons";
import { useAuth } from "@/contexts/auth-context";
import type { AssetInput, Brand, Category } from "@/lib/assets-api";
import { extractAssetDocument, type DocumentType, type ExtractedAssetData, type PendingAssetDocument } from "@/lib/documents-api";
import { toast } from "@/lib/notifications";
import { MAX_PDF_SIZE_MB, MAX_SOURCE_IMAGE_SIZE_MB, prepareUploadFiles } from "@/lib/upload-files";

type Props = {
  categories: Category[];
  brands: Brand[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: AssetInput, documents: PendingAssetDocument[]) => Promise<void>;
};

type PurchaseDocumentType = Extract<DocumentType, "INVOICE" | "RECEIPT" | "WARRANTY_CARD" | "OTHER">;
type SelectedDocument = { file: File; type: PurchaseDocumentType };
const MAX_DOCUMENTS = 3;
const MAX_PHOTOS = 3;

const normalized = (value: string) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

function mergeExtraction(current: ExtractedAssetData, next: ExtractedAssetData) {
  const merged = { ...current };
  for (const [key, value] of Object.entries(next)) {
    const currentValue = merged[key as keyof ExtractedAssetData];
    if ((currentValue === null || currentValue === undefined || currentValue === "") && value !== null && value !== undefined && value !== "") {
      Object.assign(merged, { [key]: value });
    }
  }
  return merged;
}

function toAssetDraft(extracted: ExtractedAssetData, categories: Category[], brands: Brand[]): Partial<AssetInput> {
  const category = extracted.category ? categories.find((item) => {
    const candidate = normalized(item.name);
    const suggestion = normalized(extracted.category ?? "");
    return candidate === suggestion || candidate.includes(suggestion) || suggestion.includes(candidate);
  }) : undefined;
  const brand = extracted.brand ? brands.find((item) => normalized(item.name) === normalized(extracted.brand ?? "")) : undefined;

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
  const [documents, setDocuments] = useState<SelectedDocument[]>([]);
  const [photos, setPhotos] = useState<File[]>([]);
  const [extracting, setExtracting] = useState(false);
  const [preparing, setPreparing] = useState(false);
  const [processedCount, setProcessedCount] = useState(0);
  const [extracted, setExtracted] = useState<ExtractedAssetData | null>(null);
  const [fileExtractions, setFileExtractions] = useState<ExtractedAssetData[]>([]);
  const [showForm, setShowForm] = useState(false);
  const draft = useMemo(() => toAssetDraft(extracted ?? {}, categories, brands), [brands, categories, extracted]);

  const prepareSelection = async (selected: FileList | null, kind: "document" | "photo") => {
    if (!selected) return;
    const selectedFiles = Array.from(selected);
    const limit = kind === "document" ? MAX_DOCUMENTS : MAX_PHOTOS;
    if (selectedFiles.length > limit) return void toast.warning(`Choose up to ${limit} ${kind === "document" ? "purchase documents" : "condition photos"}.`);
    if (kind === "photo" && selectedFiles.some((file) => !file.type.startsWith("image/"))) return void toast.warning("Condition evidence must be JPG, PNG, or WebP images.");

    setPreparing(true);
    try {
      const prepared = await prepareUploadFiles(selectedFiles);
      if (kind === "document") {
        setDocuments(prepared.map((file) => ({ file, type: "RECEIPT" })));
        setExtracted(null);
        setFileExtractions([]);
      } else {
        setPhotos(prepared);
      }
    } catch (error) {
      toast.warning(error instanceof Error ? error.message : "The selected files are invalid.");
    } finally {
      setPreparing(false);
    }
  };

  const changeDocumentType = (index: number, type: PurchaseDocumentType) => {
    if ((type === "INVOICE" || type === "WARRANTY_CARD") && documents.some((item, itemIndex) => itemIndex !== index && item.type === type)) {
      return void toast.warning(`Only one ${type === "INVOICE" ? "invoice" : "warranty card"} can belong to an asset.`);
    }
    setDocuments((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, type } : item));
  };

  const analyze = async () => {
    if (!firebaseUser || documents.length === 0) return;
    setExtracting(true);
    setProcessedCount(0);
    try {
      const token = await firebaseUser.getIdToken();
      let combined: ExtractedAssetData = {};
      const results: ExtractedAssetData[] = [];
      for (const document of documents) {
        const result = await extractAssetDocument(token, document.file);
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
    const pendingDocuments: PendingAssetDocument[] = [
      ...documents.map((document, index) => ({ ...document, extractedData: fileExtractions[index] })),
      ...photos.map((file) => ({ file, type: "PRODUCT_IMAGE" as const })),
    ];
    return <AssetFormModal initialValues={draft} categories={categories} brands={brands} pending={pending} onClose={onClose} onBack={() => setShowForm(false)} onSubmit={(input) => onSubmit(input, pendingDocuments)}/>;
  }

  const busy = extracting || preparing;
  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="asset-upload-title">
    <div className="max-h-[94vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4">
        <div><p className="text-xs font-semibold uppercase tracking-[.14em] text-[#4b41e1]">Step 1 of 2</p><h2 id="asset-upload-title" className="mt-1 text-xl font-semibold text-[#111d32]">Document the purchase and condition</h2><p className="mt-1 text-sm text-[#686d77]">AI reads purchase records while condition photos preserve how the product arrived.</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-[#eef1f8]" aria-label="Close asset workflow">×</button>
      </div>

      <div className="space-y-5 p-6">
        <UploadBox title="Purchase documents" description="Add up to 3: invoice, warranty card, receipt, or another supporting record." multiple accept="application/pdf,image/jpeg,image/png,image/webp" onChange={(files) => void prepareSelection(files, "document")}/>
        {documents.length > 0 && <div className="space-y-2 rounded-xl border border-[#dfe2ea] bg-white p-4">{documents.map((document, index) => <div key={`${document.file.name}-${document.file.lastModified}`} className="grid items-center gap-2 sm:grid-cols-[1fr_170px]"><div className="min-w-0"><p className="truncate text-sm font-medium text-[#394254]">{document.file.name}</p><p className="text-xs text-[#737986]">{(document.file.size / 1024 / 1024).toFixed(2)} MB</p></div><select value={document.type} onChange={(event) => changeDocumentType(index, event.target.value as PurchaseDocumentType)} className="h-10 rounded-lg border border-[#c9ccd5] bg-white px-2 text-sm"><option value="RECEIPT">Receipt</option><option value="INVOICE">Invoice</option><option value="WARRANTY_CARD">Warranty card</option><option value="OTHER">Other</option></select></div>)}</div>}

        <div className="rounded-xl border border-[#d7d2ff] bg-[#f3f1ff] p-4"><div className="flex gap-3"><Icon name="image" className="mt-0.5 h-5 w-5 shrink-0 text-[#4b41e1]"/><div><h3 className="font-semibold text-[#27214f]">Add arrival-condition photos</h3><p className="mt-1 text-sm leading-5 text-[#5e5a73]">Photograph the front, back, packaging, and any visible damage as soon as the product arrives. The upload time is recorded and may help resolve later damage disputes.</p></div></div></div>
        <UploadBox title="Product condition photos" description="Add up to 3 clear JPG, PNG, or WebP photos." multiple accept="image/jpeg,image/png,image/webp" onChange={(files) => void prepareSelection(files, "photo")}/>
        {photos.length > 0 && <div className="grid gap-2 rounded-xl border border-[#dfe2ea] bg-white p-4 sm:grid-cols-3">{photos.map((photo) => <div key={`${photo.name}-${photo.lastModified}`} className="min-w-0 rounded-lg bg-[#f5f6fb] p-3"><p className="truncate text-sm font-medium text-[#394254]">{photo.name}</p><p className="mt-1 text-xs text-[#737986]">{(photo.size / 1024 / 1024).toFixed(2)} MB</p></div>)}</div>}

        <p className="text-xs text-[#737986]">Images up to {MAX_SOURCE_IMAGE_SIZE_MB} MB are optimized automatically. PDFs can be up to {MAX_PDF_SIZE_MB} MB.</p>
        {preparing && <div className="rounded-lg bg-[#eeecff] px-4 py-3 text-sm text-[#4b41e1]">Optimizing selected images…</div>}
        {extracting && <div className="rounded-lg bg-[#eeecff] px-4 py-3 text-sm text-[#4b41e1]">Analyzing document {Math.min(processedCount + 1, documents.length)} of {documents.length}…</div>}

        <div className="flex items-center justify-between border-t border-[#e1e4ec] pt-5"><button type="button" onClick={() => { setExtracted({}); setShowForm(true); }} disabled={busy} className="text-sm font-semibold text-[#596170] hover:text-[#4b41e1]">Enter details manually</button><button type="button" onClick={() => void analyze()} disabled={busy || documents.length === 0} className="flex h-11 items-center gap-2 rounded-lg bg-[#4b41e1] px-5 text-sm font-semibold text-white hover:bg-[#645efb] disabled:cursor-not-allowed disabled:opacity-50"><Icon name="sparkles" className="h-4 w-4"/>{extracting ? "Analyzing…" : preparing ? "Optimizing…" : "Analyze with AI"}</button></div>
      </div>
    </div>
  </div>;
}

function UploadBox({ title, description, multiple, accept, onChange }: { title: string; description: string; multiple: boolean; accept: string; onChange: (files: FileList | null) => void }) {
  return <label className="flex min-h-36 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-[#bfc4d3] bg-white px-6 text-center transition hover:border-[#4b41e1] hover:bg-[#f5f4ff]"><span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#e9e7ff] text-[#4b41e1]"><Icon name="upload" className="h-5 w-5"/></span><span className="mt-3 font-semibold text-[#17243a]">{title}</span><span className="mt-1 text-sm text-[#686d77]">{description}</span><input type="file" multiple={multiple} accept={accept} onChange={(event) => onChange(event.target.files)} className="sr-only"/></label>;
}
