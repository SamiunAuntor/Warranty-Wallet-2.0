"use client";

import { useEffect, useMemo, useRef, useState, type DragEvent } from "react";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { useAuth } from "@/contexts/auth-context";
import { getAssets, type Asset } from "@/lib/assets-api";
import {
  deleteDocument,
  getDocuments,
  replaceDocument,
  uploadDocuments,
  type DocumentList,
  type DocumentRecord,
  type DocumentType,
} from "@/lib/documents-api";
import { dialog, toast } from "@/lib/notifications";
import { MAX_PDF_SIZE_MB, MAX_SOURCE_IMAGE_SIZE_MB, prepareUploadFile, prepareUploadFiles } from "@/lib/upload-files";

const PAGE_SIZE = 12;
const MAX_FILES = 5;
const documentTypes: DocumentType[] = ["INVOICE", "WARRANTY_CARD", "PRODUCT_IMAGE", "RECEIPT", "OTHER"];
const typeLabel = (type: DocumentType) => type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) => letter.toUpperCase());
const fileSize = (bytes: number | null) => {
  if (!bytes) return "Size unavailable";
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
};
const addedDate = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });

export default function DocumentsPage() {
  const { firebaseUser } = useAuth();
  const inputRef = useRef<HTMLInputElement>(null);
  const [result, setResult] = useState<DocumentList | null>(null);
  const [assets, setAssets] = useState<Asset[]>([]);
  const [uploadAssetId, setUploadAssetId] = useState("");
  const [uploadType, setUploadType] = useState<DocumentType>("RECEIPT");
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [type, setType] = useState<DocumentType | "">("");
  const [productId, setProductId] = useState("");
  const [page, setPage] = useState(1);
  const [reloadKey, setReloadKey] = useState(0);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState("");
  const [preview, setPreview] = useState<DocumentRecord | null>(null);

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    firebaseUser.getIdToken()
      .then((token) => Promise.all([
        getDocuments(token, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          type: type || undefined,
          productId: productId || undefined,
        }),
        getAssets(token, { page: 1, limit: 500 }),
      ]))
      .then(([documents, assetResult]) => {
        if (cancelled) return;
        setResult(documents);
        setAssets(assetResult.data);
        setUploadAssetId((current) => current || assetResult.data[0]?.id || "");
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load documents.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [firebaseUser, page, productId, reloadKey, search, type]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const documents = result?.data ?? [];
  const hasFilters = Boolean(search || type || productId);
  const uploadAsset = assets.find((asset) => asset.id === uploadAssetId);
  const summary = useMemo(() => {
    if (!result || result.meta.total === 0) return "No documents";
    const start = (result.meta.page - 1) * result.meta.limit + 1;
    const end = Math.min(result.meta.total, start + result.data.length - 1);
    return `${start}–${end} of ${result.meta.total}`;
  }, [result]);

  const refresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const validateFiles = (files: File[]) => {
    if (!uploadAssetId) throw new Error("Select an asset before uploading documents.");
    if (files.length === 0) throw new Error("Choose at least one file.");
    if (files.length > MAX_FILES) throw new Error(`You can upload up to ${MAX_FILES} files at once.`);
  };

  const submitFiles = async (files: File[]) => {
    if (!firebaseUser) return;
    try {
      validateFiles(files);
      setUploading(true);
      const preparedFiles = await prepareUploadFiles(files);
      const token = await firebaseUser.getIdToken();

      for (const file of preparedFiles) {
        await uploadDocuments(token, uploadAssetId, uploadType, [file]);
      }
      toast.success(`${preparedFiles.length} document${preparedFiles.length === 1 ? "" : "s"} uploaded.`);
      if (inputRef.current) inputRef.current.value = "";
      refresh();
    } catch (uploadError) {
      toast.error(uploadError instanceof Error ? uploadError.message : "Could not upload documents.");
    } finally {
      setUploading(false);
    }
  };

  const drop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);
    void submitFiles(Array.from(event.dataTransfer.files));
  };

  const replace = async (document: DocumentRecord, file: File) => {
    if (!firebaseUser) return;
    try {
      const preparedFile = await prepareUploadFile(file);
      await replaceDocument(await firebaseUser.getIdToken(), document.id, preparedFile);
      toast.success("Document replaced successfully.");
      refresh();
    } catch (replaceError) {
      toast.error(replaceError instanceof Error ? replaceError.message : "Could not replace the document.");
    }
  };

  const remove = async (document: DocumentRecord) => {
    if (!firebaseUser) return;
    const confirmation = await dialog.confirm("Delete this document?", `${document.fileName} will be removed from ${document.product.name} and any attached claims.`);
    if (!confirmation.isConfirmed) return;
    try {
      await deleteDocument(await firebaseUser.getIdToken(), document.id);
      toast.success("Document deleted.");
      if (documents.length === 1 && page > 1) {
        setLoading(true);
        setPage((value) => value - 1);
      } else {
        refresh();
      }
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the document.");
    }
  };

  const download = (document: DocumentRecord) => {
    const anchor = window.document.createElement("a");
    anchor.href = document.fileUrl;
    anchor.download = document.fileName;
    anchor.target = "_blank";
    anchor.rel = "noreferrer";
    anchor.click();
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setType("");
    setProductId("");
    setPage(1);
    setLoading(true);
    setError("");
  };

  return <div className="mx-auto w-full max-w-[1440px] pb-10">
    <header><h1 className="flex items-center gap-2 text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Documents <Icon name="documents" className="h-6 w-6 text-[#5141df]"/></h1><p className="mt-2 text-base text-[#4f5562]">Store receipts, invoices, warranty cards, and product images against their assets.</p></header>

    <section className="mt-7 grid gap-4 rounded-xl border border-[#d6d9e2] bg-white p-4 shadow-sm md:grid-cols-[1fr_220px]">
      <div onDragEnter={(event) => { event.preventDefault(); setDragging(true); }} onDragOver={(event) => event.preventDefault()} onDragLeave={() => setDragging(false)} onDrop={drop} className={`flex min-h-48 flex-col items-center justify-center rounded-xl border-2 border-dashed px-5 text-center transition ${dragging ? "border-[#5141df] bg-[#f0eeff]" : "border-[#c7cad3] bg-[#fafbff]"}`}>
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-[#e8edff] text-[#5141df]"><Icon name="upload" className="h-7 w-7"/></div><h2 className="mt-4 text-lg font-semibold text-[#172033]">Drop files here</h2><p className="mt-1 text-sm text-[#686d77]">Images up to {MAX_SOURCE_IMAGE_SIZE_MB} MB · PDFs up to {MAX_PDF_SIZE_MB} MB · up to {MAX_FILES} files</p><p className="mt-1 text-xs text-[#858a95]">Large phone photos are optimized automatically.</p><input ref={inputRef} type="file" multiple accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => void submitFiles(Array.from(event.target.files ?? []))}/><button onClick={() => inputRef.current?.click()} disabled={uploading || assets.length === 0} className="mt-4 rounded-lg bg-[#4b41e1] px-6 py-2.5 text-sm font-semibold text-white hover:bg-[#645efb] disabled:cursor-not-allowed disabled:bg-[#aaa6c7]">{uploading ? "Optimizing & uploading…" : "Browse files"}</button>
      </div>
      <div className="space-y-4 rounded-xl bg-[#f6f7fc] p-4"><h3 className="font-semibold text-[#172033]">Upload settings</h3><label className="block space-y-1.5 text-sm font-medium">Asset <span className="text-[#ba1a1a]">*</span><select value={uploadAssetId} onChange={(event) => setUploadAssetId(event.target.value)} className="h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm"><option value="" disabled>{assets.length ? "Select asset" : "Add an asset first"}</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select></label><label className="block space-y-1.5 text-sm font-medium">Document type <span className="text-[#ba1a1a]">*</span><select value={uploadType} onChange={(event) => setUploadType(event.target.value as DocumentType)} className="h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm">{documentTypes.map((value) => <option key={value} value={value}>{typeLabel(value)}</option>)}</select></label>{uploadAsset && <p className="rounded-lg bg-[#e9edff] p-3 text-xs leading-5 text-[#424a63]">Every uploaded file will belong to <strong>{uploadAsset.name}</strong>.</p>}</div>
    </section>

    <section className="mt-7 flex flex-col gap-3 rounded-xl border border-[#d6d9e2] bg-white p-4 sm:flex-row"><div className="relative flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#737985]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} placeholder="Search documents or assets…" className="h-11 w-full rounded-lg bg-[#eef2ff] pl-11 pr-4 text-sm outline-none focus:ring-2 focus:ring-[#d9d2ff]"/></div><select value={type} onChange={(event) => { setLoading(true); setType(event.target.value as DocumentType | ""); setPage(1); }} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm"><option value="">All types</option>{documentTypes.map((value) => <option key={value} value={value}>{typeLabel(value)}</option>)}</select><select value={productId} onChange={(event) => { setLoading(true); setProductId(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm"><option value="">All assets</option>{assets.map((asset) => <option key={asset.id} value={asset.id}>{asset.name}</option>)}</select>{hasFilters && <button onClick={clearFilters} className="px-3 text-sm font-semibold text-[#5141df]">Clear filters</button>}</section>

    {loading ? <Loading fullScreen={false} className="mt-6 min-h-80 rounded-xl" label="Loading documents"/> : error ? <section className="mt-6 rounded-xl border border-[#f0c6c9] bg-white p-10 text-center"><Icon name="warning" className="mx-auto h-8 w-8 text-[#a83e4c]"/><p className="mt-3 text-sm text-[#555b67]">{error}</p><button onClick={refresh} className="mt-4 rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white">Try again</button></section> : documents.length === 0 ? <section className="mt-6 rounded-xl border border-dashed border-[#c9ccd5] bg-white p-12 text-center"><Icon name="documents" className="mx-auto h-10 w-10 text-[#8b84d8]"/><h2 className="mt-4 text-lg font-semibold text-[#172033]">{hasFilters ? "No matching documents" : "No documents uploaded"}</h2><p className="mt-2 text-sm text-[#626773]">{hasFilters ? "Try changing your filters." : assets.length ? "Choose an asset above and upload its first document." : "Add an asset before uploading documents."}</p>{hasFilters && <button onClick={clearFilters} className="mt-4 rounded-lg border px-4 py-2 text-sm font-semibold">Clear filters</button>}</section> :
      <section className="mt-7 grid gap-5 sm:grid-cols-2 xl:grid-cols-4">{documents.map((document) => <article key={document.id} className="overflow-hidden rounded-xl border border-[#d6d9e2] bg-white shadow-[0_2px_6px_rgba(24,32,56,.05)]"><button onClick={() => setPreview(document)} className="relative flex h-32 w-full items-center justify-center bg-[#e8edff] text-[#8b91a0]"><span className="absolute right-3 top-3 rounded-full bg-white px-3 py-1 text-[10px] font-bold text-[#6045df]">{document.ocrProcessed ? "AI Extracted" : typeLabel(document.fileType)}</span><Icon name={document.fileType === "INVOICE" || document.fileType === "RECEIPT" ? "receipt" : document.fileType === "PRODUCT_IMAGE" ? "image" : "documents"} className="h-12 w-12"/></button><div className="p-4"><h2 className="truncate text-base font-semibold text-[#172033]" title={document.fileName}>{document.fileName}</h2><p className="mt-2 text-xs text-[#626773]">{fileSize(document.fileSize)} · {addedDate.format(new Date(document.createdAt))}</p><p className="mt-3 flex items-center gap-2 truncate border-t border-[#e2e5eb] pt-3 text-xs font-medium text-[#273247]"><Icon name="link" className="h-4 w-4 shrink-0"/>{document.product.name}</p>{Boolean(document._count?.claims) && <p className="mt-2 text-[10px] font-semibold text-[#6045df]">Attached to {document._count?.claims} claim{document._count?.claims === 1 ? "" : "s"}</p>}<div className="mt-4 grid grid-cols-2 gap-2"><button onClick={() => setPreview(document)} className="rounded-lg border border-[#c9ccd5] py-2 text-xs font-semibold">View</button><button onClick={() => download(document)} className="rounded-lg border border-[#c9ccd5] py-2 text-xs font-semibold">Download</button><label className="cursor-pointer rounded-lg bg-[#eef0ff] py-2 text-center text-xs font-semibold text-[#5141df]">Replace<input type="file" accept=".pdf,.jpg,.jpeg,.png,.webp,application/pdf,image/jpeg,image/png,image/webp" className="hidden" onChange={(event) => { const file = event.target.files?.[0]; if (file) void replace(document, file); event.target.value = ""; }}/></label><button onClick={() => void remove(document)} className="rounded-lg py-2 text-xs font-semibold text-[#a83e4c] hover:bg-[#fff0f1]">Delete</button></div></div></article>)}</section>
    }

    {result && result.meta.totalPages > 1 && <div className="mt-7 flex items-center justify-between rounded-xl border border-[#d8dbe4] bg-white p-3"><span className="text-sm text-[#626773]">{summary}</span><div className="flex gap-2"><button disabled={page === 1} onClick={() => { setLoading(true); setPage((value) => value - 1); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Previous</button><span className="px-2 py-2 text-sm">Page {page} of {result.meta.totalPages}</span><button disabled={page === result.meta.totalPages} onClick={() => { setLoading(true); setPage((value) => value + 1); }} className="rounded-lg border px-3 py-2 text-sm disabled:opacity-40">Next</button></div></div>}

    {preview && <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/60 p-4" role="dialog" aria-modal="true" aria-labelledby="document-preview-title"><div className="flex h-[90vh] w-full max-w-5xl flex-col overflow-hidden rounded-2xl bg-white shadow-2xl"><div className="flex items-center justify-between border-b p-4"><div className="min-w-0"><h2 id="document-preview-title" className="truncate font-semibold text-[#172033]">{preview.fileName}</h2><p className="mt-1 text-xs text-[#626773]">{preview.product.name} · {typeLabel(preview.fileType)}</p></div><div className="flex gap-2"><button onClick={() => download(preview)} className="rounded-lg bg-[#eef0ff] px-3 py-2 text-xs font-semibold text-[#5141df]">Download</button><button onClick={() => setPreview(null)} className="rounded-lg px-3 py-2 text-xl" aria-label="Close preview">×</button></div></div><iframe src={preview.fileUrl} title={preview.fileName} className="min-h-0 flex-1 bg-[#f2f3f7]"/></div></div>}
  </div>;
}
