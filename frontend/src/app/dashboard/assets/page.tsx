"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { AssetDetailsModal } from "@/components/assets/asset-details-modal";
import { AssetFormModal } from "@/components/assets/asset-form-modal";
import { AssetOnboardingModal } from "@/components/assets/asset-onboarding-modal";
import { Icon } from "@/components/icons";
import { Loading } from "@/components/ui/loading";
import { plans } from "@/constants/plans";
import { useAuth } from "@/contexts/auth-context";
import {
  createAsset,
  deleteAsset,
  getAsset,
  getAssets,
  getAssetUsage,
  getBrands,
  getCategories,
  updateAsset,
  type Asset,
  type AssetInput,
  type AssetList,
  type Brand,
  type Category,
  type WarrantyStatus,
} from "@/lib/assets-api";
import { dialog, toast } from "@/lib/notifications";
import { uploadDocuments, type PendingAssetDocument } from "@/lib/documents-api";
import { positivePage, useUrlQuerySync } from "@/hooks/use-url-query-sync";
import { usePreferences } from "@/contexts/preferences-context";

const PAGE_SIZE = 8;
const date = new Intl.DateTimeFormat("en-US", { dateStyle: "medium" });
const statusLabels: Record<WarrantyStatus, string> = {
  NO_WARRANTY: "No warranty",
  ACTIVE: "Active",
  EXPIRING_SOON: "Expiring soon",
  EXPIRED: "Expired",
};
const statusStyles: Record<WarrantyStatus, { border: string; badge: string }> = {
  NO_WARRANTY: { border: "border-t-[#8b91a1]", badge: "bg-[#eef0f4] text-[#596170]" },
  ACTIVE: { border: "border-t-[#66bf8a]", badge: "bg-[#e5f7ed] text-[#2c8657]" },
  EXPIRING_SOON: { border: "border-t-[#eca82e]", badge: "bg-[#fff3df] text-[#a75a0a]" },
  EXPIRED: { border: "border-t-[#d97982]", badge: "bg-[#fdecef] text-[#b74d5d]" },
};

function AssetThumbnail({ asset, className = "h-16 w-16" }: { asset: Asset; className?: string }) {
  const photo = asset.documents?.find((document) => document.fileType === "PRODUCT_IMAGE")?.fileUrl || asset.productImageUrl;
  return <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#dce1eb] bg-gradient-to-br from-white to-[#dfe5e8] text-[#27364b] ${className}`}>{photo ? <img src={photo} alt={`${asset.name} condition`} className="h-full w-full object-cover"/> : <Icon name="products" className="h-8 w-8"/>}</div>;
}

export default function AssetsPage() {
  return <Suspense fallback={<Loading label="Loading asset filters"/>}><AssetsPageContent/></Suspense>;
}

function AssetsPageContent() {
  const router = useRouter();
  const { formatMoney } = usePreferences();
  const { firebaseUser, appUser } = useAuth();
  const query = useSearchParams();
  const statusQuery = query.get("status");
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  const [result, setResult] = useState<AssetList | null>(null);
  const [usage, setUsage] = useState(0);
  const [searchInput, setSearchInput] = useState(query.get("search") ?? "");
  const [search, setSearch] = useState(query.get("search") ?? "");
  const [status, setStatus] = useState<WarrantyStatus | "">(statusQuery && statusQuery in statusLabels ? statusQuery as WarrantyStatus : "");
  const [categoryId, setCategoryId] = useState(query.get("category") ?? "");
  const [page, setPage] = useState(() => positivePage(query.get("page")));
  const [view, setView] = useState<"grid" | "list">("grid");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [reloadKey, setReloadKey] = useState(0);
  const [formAsset, setFormAsset] = useState<Asset | "new" | null>(null);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [saving, setSaving] = useState(false);

  const plan = appUser ? plans[appUser.plan] : plans.BASIC;
  const atLimit = usage >= plan.assetLimit;
  const usagePercent = Math.min(100, (usage / plan.assetLimit) * 100);

  useUrlQuerySync({ search, status, category: categoryId, page });

  useEffect(() => {
    getCategories()
      .then(setCategories)
      .catch((categoryError) => toast.error(categoryError instanceof Error ? categoryError.message : "Could not load categories."));
    getBrands()
      .then(setBrands)
      .catch((brandError) => toast.error(brandError instanceof Error ? brandError.message : "Could not load brands."));
  }, []);

  useEffect(() => {
    if (!firebaseUser) return;
    let cancelled = false;

    firebaseUser.getIdToken()
      .then((token) => Promise.all([
        getAssets(token, {
          page,
          limit: PAGE_SIZE,
          search: search || undefined,
          warrantyStatus: status || undefined,
          categoryId: categoryId || undefined,
        }),
        getAssetUsage(token),
      ]))
      .then(([assets, currentUsage]) => {
        if (cancelled) return;
        setResult(assets);
        setUsage(currentUsage);
      })
      .catch((loadError) => {
        if (!cancelled) setError(loadError instanceof Error ? loadError.message : "Could not load your assets.");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [categoryId, firebaseUser, page, reloadKey, search, status]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      setLoading(true);
      setError("");
      setPage(1);
      setSearch(searchInput.trim());
    }, 350);
    return () => window.clearTimeout(timeout);
  }, [searchInput]);

  const assets = result?.data ?? [];
  const hasFilters = Boolean(search || status || categoryId);
  const pageSummary = useMemo(() => {
    if (!result || result.meta.total === 0) return "No assets";
    const start = (result.meta.page - 1) * result.meta.limit + 1;
    const end = Math.min(result.meta.total, start + result.data.length - 1);
    return `${start}–${end} of ${result.meta.total}`;
  }, [result]);

  const refresh = () => {
    setLoading(true);
    setError("");
    setReloadKey((value) => value + 1);
  };

  const openDetails = async (asset: Asset) => {
    if (!firebaseUser) return;
    try {
      const token = await firebaseUser.getIdToken();
      setSelectedAsset(await getAsset(token, asset.id));
    } catch (detailsError) {
      toast.error(detailsError instanceof Error ? detailsError.message : "Could not load asset details.");
    }
  };

  const saveAsset = async (input: AssetInput, documents: PendingAssetDocument[] = []) => {
    if (!firebaseUser || !formAsset) return;
    setSaving(true);
    try {
      const token = await firebaseUser.getIdToken();
      if (formAsset === "new") {
        const created = await createAsset(token, input);
        let uploadedCount = 0;
        const failedUploads: string[] = [];
        for (const document of documents) {
          let lastError: unknown;
          for (let attempt = 0; attempt < 2; attempt += 1) {
            try {
              const uploaded = await uploadDocuments(token, created.id, document.type, [document.file], document.extractedData);
              if (uploaded.length !== 1 || uploaded[0].productId !== created.id) throw new Error("The server did not confirm the asset link.");
              uploadedCount += 1;
              lastError = undefined;
              break;
            } catch (uploadError) {
              lastError = uploadError;
            }
          }
          if (lastError) {
            failedUploads.push(`${document.file.name}: ${lastError instanceof Error ? lastError.message : "upload failed"}`);
          }
        }
        if (failedUploads.length > 0) {
          await dialog.warning("Asset saved, but some files need attention", `${uploadedCount} of ${documents.length} files were linked. ${failedUploads.join(" ")}`);
        } else {
          toast.success(documents.length > 0 ? `Asset added with all ${uploadedCount} related file${uploadedCount === 1 ? "" : "s"}.` : "Asset added successfully.");
        }
      } else {
        await updateAsset(token, formAsset.id, input);
        toast.success("Asset updated successfully.");
      }
      setFormAsset(null);
      setSelectedAsset(null);
      refresh();
    } catch (saveError) {
      toast.error(saveError instanceof Error ? saveError.message : "Could not save the asset.");
    } finally {
      setSaving(false);
    }
  };

  const removeAsset = async (asset: Asset) => {
    if (!firebaseUser) return;
    const confirmation = await dialog.confirm("Delete this asset?", `${asset.name} and its linked documents will no longer appear in your portfolio.`);
    if (!confirmation.isConfirmed) return;
    try {
      const token = await firebaseUser.getIdToken();
      await deleteAsset(token, asset.id);
      toast.success("Asset deleted.");
      setSelectedAsset(null);
      if (assets.length === 1 && page > 1) setPage((value) => value - 1);
      else refresh();
    } catch (deleteError) {
      toast.error(deleteError instanceof Error ? deleteError.message : "Could not delete the asset.");
    }
  };

  const clearFilters = () => {
    setSearchInput("");
    setSearch("");
    setStatus("");
    setCategoryId("");
    setLoading(true);
    setError("");
    setPage(1);
  };

  return <div className="mx-auto w-full max-w-[1440px] pb-10">
    <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
      <header><h1 className="text-3xl font-semibold tracking-[-.035em] text-[#111d32]">Asset Portfolio</h1><p className="mt-1 max-w-md text-base leading-6 text-[#45464d]">Manage purchases, warranty coverage, and supporting information in one portfolio.</p></header>
      <div className="w-full max-w-md rounded-xl border border-[#d9dcf0] bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between text-sm"><span className="font-semibold text-[#17243a]">{plan.name} plan usage</span><span className={atLimit ? "font-semibold text-[#ba1a1a]" : "text-[#596170]"}>{usage} / {plan.assetLimit} assets</span></div>
        <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e8e9f2]"><div className={`h-full rounded-full transition-all ${atLimit ? "bg-[#ba1a1a]" : "bg-[#4b41e1]"}`} style={{ width: `${usagePercent}%` }}/></div>
        {atLimit && <p className="mt-3 text-xs text-[#ba1a1a]">You have reached this plan&apos;s asset limit. <Link href="/#pricing" className="font-semibold text-[#4b41e1] underline">Upgrade your plan</Link> to add more.</p>}
      </div>
    </div>

    <section className="mt-7 rounded-xl border border-[#dfe2ea] bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="relative min-w-56 flex-1"><Icon name="search" className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6c7280]"/><input value={searchInput} onChange={(event) => setSearchInput(event.target.value)} aria-label="Search assets" placeholder="Search by asset name or brand…" className="h-11 w-full rounded-lg border border-transparent bg-[#eaf0ff] pl-11 pr-4 text-sm outline-none transition focus:border-[#4b41e1] focus:bg-white"/></div>
        <select aria-label="Filter by status" value={status} onChange={(event) => { setLoading(true); setError(""); setStatus(event.target.value as WarrantyStatus | ""); setPage(1); }} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#4b41e1]"><option value="">All statuses</option><option value="ACTIVE">Active</option><option value="EXPIRING_SOON">Expiring soon</option><option value="EXPIRED">Expired</option></select>
        <select aria-label="Filter by category" value={categoryId} onChange={(event) => { setLoading(true); setError(""); setCategoryId(event.target.value); setPage(1); }} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none focus:border-[#4b41e1]"><option value="">All categories</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select>
        {hasFilters && <button onClick={clearFilters} className="h-11 px-3 text-sm font-semibold text-[#4b41e1]">Clear filters</button>}
        <div className="flex h-11 overflow-hidden rounded-lg border border-[#c9ccd5] bg-white"><button aria-label="Grid view" onClick={() => setView("grid")} className={`px-3 ${view === "grid" ? "bg-[#eaf0ff] text-[#4b41e1]" : "text-[#4e5562]"}`}><Icon name="dashboard" className="h-5 w-5"/></button><button aria-label="List view" onClick={() => setView("list")} className={`border-l border-[#c9ccd5] px-3 ${view === "list" ? "bg-[#eaf0ff] text-[#4b41e1]" : "text-[#4e5562]"}`}><Icon name="list" className="h-5 w-5"/></button></div>
        <button onClick={() => setFormAsset("new")} disabled={atLimit || categories.length === 0} title={atLimit ? "Upgrade your plan to add another asset" : undefined} className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#4b41e1] px-5 text-sm font-semibold text-white shadow-sm hover:bg-[#645efb] disabled:cursor-not-allowed disabled:bg-[#a7a8b4]"><Icon name="plus" className="h-4 w-4"/>Add Asset</button>
      </div>
    </section>

    {loading ? <Loading fullScreen={false} className="mt-6 min-h-80 rounded-xl" label="Loading assets"/> : error ? <section className="mt-6 rounded-xl border border-[#f1c4c4] bg-white p-10 text-center"><Icon name="warning" className="mx-auto h-8 w-8 text-[#ba1a1a]"/><h2 className="mt-3 font-semibold text-[#17243a]">Assets could not be loaded</h2><p className="mt-1 text-sm text-[#686d77]">{error}</p><button onClick={refresh} className="mt-4 rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white">Try again</button></section> : assets.length === 0 ? <section className="mt-6 rounded-xl border border-dashed border-[#c9ccd5] bg-white p-12 text-center"><div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-[#eaf0ff] text-[#4b41e1]"><Icon name="products" className="h-7 w-7"/></div><h2 className="mt-4 text-lg font-semibold text-[#17243a]">{hasFilters ? "No matching assets" : "Your portfolio is empty"}</h2><p className="mx-auto mt-2 max-w-md text-sm text-[#686d77]">{hasFilters ? "Try a different search or clear the current filters." : "Add your first purchase to start tracking its warranty."}</p>{hasFilters ? <button onClick={clearFilters} className="mt-5 rounded-lg border border-[#c9ccd5] px-4 py-2 text-sm font-semibold">Clear filters</button> : <button onClick={() => setFormAsset("new")} disabled={atLimit} className="mt-5 rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Add your first asset</button>}</section> :
      view === "grid" ? <section className="mt-6 grid items-start gap-5 md:grid-cols-2 xl:grid-cols-3">
        {assets.map((asset) => {
          const style = statusStyles[asset.warrantyStatus];
          return <article key={asset.id} className={`group overflow-hidden rounded-xl border border-[#dfe2ea] border-t-4 bg-white shadow-[0_2px_7px_rgba(24,32,56,.06)] transition hover:-translate-y-0.5 hover:shadow-md ${style.border}`}>
            <button onClick={() => void openDetails(asset)} className="flex w-full min-w-0 gap-3.5 bg-[#f8f9fd] p-4 text-left">
              <AssetThumbnail asset={asset}/>
              <div className="min-w-0 flex-1"><h2 className="truncate text-lg font-semibold text-[#172033]">{asset.name}</h2><p className="truncate text-sm text-[#686d77]">{asset.brand} · {asset.category.name}</p><span className={`mt-2 inline-flex rounded-full px-2.5 py-1 text-[10px] font-semibold ${style.badge}`}>{statusLabels[asset.warrantyStatus]}</span>{Boolean(asset._count?.claims) && <span className="ml-2 mt-2 inline-flex rounded-full bg-[#eee9ff] px-2.5 py-1 text-[10px] font-semibold text-[#5942d6]">{asset._count?.claims} active claim{asset._count?.claims === 1 ? "" : "s"}</span>}</div>
            </button>
            <div className="border-t border-[#e5e7ee] p-4">
              <button onClick={() => void openDetails(asset)} className="grid w-full grid-cols-2 gap-4 text-left"><div><p className="text-[11px] font-medium uppercase tracking-wide text-[#747b88]">{asset.hasWarranty ? asset.warrantyStatus === "EXPIRED" ? "Expired" : "Warranty ends" : "Warranty"}</p><p className={`mt-1 text-sm font-semibold ${asset.warrantyStatus === "ACTIVE" ? "text-[#17243a]" : "text-[#b55245]"}`}>{asset.expiryDate ? date.format(new Date(asset.expiryDate)) : asset.hasWarranty ? "Not provided" : "Not included"}</p></div><div><p className="text-[11px] font-medium uppercase tracking-wide text-[#747b88]">Purchase value</p><p className="mt-1 truncate text-sm font-semibold text-[#17243a]">{formatMoney(Number(asset.purchasePrice))}</p></div></button>
              <div className="mt-4 grid grid-cols-3 gap-2 border-t border-[#eceef3] pt-3"><button onClick={() => void openDetails(asset)} className="rounded-lg border border-[#d4d7df] bg-white px-3 py-2 text-xs font-semibold text-[#27364b] hover:bg-[#f4f5fb]">View</button><button onClick={() => setFormAsset(asset)} className="rounded-lg bg-[#eef0ff] px-3 py-2 text-xs font-semibold text-[#4b41e1] hover:bg-[#e2dfff]">Edit</button><button onClick={() => void removeAsset(asset)} className="rounded-lg bg-[#fff5f5] px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#ffe8e8]" aria-label={`Delete ${asset.name}`}>Delete</button></div>
            </div>
          </article>;
        })}
      </section> : <section className="mt-6 overflow-hidden rounded-xl border border-[#dfe2ea] bg-white shadow-sm"><div className="overflow-x-auto"><table className="w-full min-w-[1050px] text-left"><thead className="border-b border-[#dfe2ea] bg-[#f5f6fb] text-xs font-semibold uppercase tracking-wide text-[#626b7a]"><tr><th className="px-5 py-4">Asset</th><th className="px-4 py-4">Status</th><th className="px-4 py-4">Category</th><th className="px-4 py-4">Purchased</th><th className="px-4 py-4">Warranty</th><th className="px-4 py-4 text-right">Value</th><th className="px-4 py-4 text-center">Claims</th><th className="px-5 py-4 text-right">Actions</th></tr></thead><tbody className="divide-y divide-[#e8eaf0]">{assets.map((asset) => { const style = statusStyles[asset.warrantyStatus]; return <tr key={asset.id} className="transition hover:bg-[#fafaff]"><td className="px-5 py-4"><button onClick={() => void openDetails(asset)} className="flex max-w-64 items-center gap-3 text-left"><AssetThumbnail asset={asset} className="h-12 w-12"/><span className="min-w-0"><span className="block truncate text-sm font-semibold text-[#172033]">{asset.name}</span><span className="mt-0.5 block truncate text-xs text-[#686d77]">{asset.brand}{asset.model ? ` · ${asset.model}` : ""}</span></span></button></td><td className="px-4 py-4"><span className={`inline-flex whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${style.badge}`}>{statusLabels[asset.warrantyStatus]}</span></td><td className="px-4 py-4 text-sm text-[#394254]">{asset.category.name}</td><td className="px-4 py-4 text-sm text-[#394254]">{date.format(new Date(asset.purchaseDate))}</td><td className="px-4 py-4 text-sm text-[#394254]">{asset.hasWarranty ? asset.expiryDate ? date.format(new Date(asset.expiryDate)) : "No date" : "No warranty"}</td><td className="px-4 py-4 text-right text-sm font-medium text-[#172033]">{formatMoney(Number(asset.purchasePrice))}</td><td className="px-4 py-4 text-center text-sm text-[#394254]">{asset._count?.claims ?? 0}</td><td className="px-5 py-4"><div className="flex justify-end gap-1"><button onClick={() => void openDetails(asset)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#27364b] hover:bg-[#eef0f5]">View</button><button onClick={() => setFormAsset(asset)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#4b41e1] hover:bg-[#eeecff]">Edit</button><button onClick={() => void removeAsset(asset)} className="rounded-lg px-3 py-2 text-xs font-semibold text-[#ba1a1a] hover:bg-[#fff0f0]">Delete</button></div></td></tr>; })}</tbody></table></div></section>
    }

    {result && result.meta.totalPages > 1 && <div className="mt-7 flex items-center justify-between rounded-xl border border-[#e0e3eb] bg-white px-4 py-3"><p className="text-sm text-[#686d77]">{pageSummary}</p><div className="flex items-center gap-2"><button onClick={() => { setLoading(true); setPage((value) => Math.max(1, value - 1)); }} disabled={page === 1} className="rounded-lg border border-[#c9ccd5] px-3 py-2 text-sm font-semibold disabled:opacity-40">Previous</button><span className="px-2 text-sm font-medium">Page {page} of {result.meta.totalPages}</span><button onClick={() => { setLoading(true); setPage((value) => Math.min(result.meta.totalPages, value + 1)); }} disabled={page === result.meta.totalPages} className="rounded-lg border border-[#c9ccd5] px-3 py-2 text-sm font-semibold disabled:opacity-40">Next</button></div></div>}

    {formAsset === "new" && <AssetOnboardingModal categories={categories} brands={brands} pending={saving} onClose={() => setFormAsset(null)} onSubmit={saveAsset}/>}
    {formAsset && formAsset !== "new" && <AssetFormModal asset={formAsset} categories={categories} brands={brands} pending={saving} onClose={() => setFormAsset(null)} onSubmit={saveAsset}/>}
    {selectedAsset && <AssetDetailsModal asset={selectedAsset} onClose={() => setSelectedAsset(null)} onEdit={() => { setFormAsset(selectedAsset); setSelectedAsset(null); }} onDelete={() => void removeAsset(selectedAsset)} onRaiseClaim={() => router.push(`/dashboard/claims?assetId=${selectedAsset.id}`)} onFilesChanged={async () => { if (!firebaseUser) return; setSelectedAsset(await getAsset(await firebaseUser.getIdToken(), selectedAsset.id)); refresh(); }}/>} 
  </div>;
}
