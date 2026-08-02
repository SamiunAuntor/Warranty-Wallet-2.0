"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import type { Asset, AssetInput, AssetLifecycleStatus, Brand, Category, WarrantyType } from "@/lib/assets-api";

type Props = {
  asset?: Asset | null;
  initialValues?: Partial<AssetInput>;
  categories: Category[];
  brands: Brand[];
  pending: boolean;
  onClose: () => void;
  onBack?: () => void;
  onSubmit: (input: AssetInput) => Promise<void>;
};

const inputClass = "h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none transition focus:border-[#4b41e1] focus:ring-2 focus:ring-[#e2dfff]";
const labelClass = "space-y-1.5 text-sm font-medium text-[#17243a]";

export function AssetFormModal({ asset, initialValues, categories, brands, pending, onClose, onBack, onSubmit }: Props) {
  const [warrantyType, setWarrantyType] = useState<WarrantyType>(asset?.warrantyType ?? initialValues?.warrantyType ?? "MANUFACTURER");
  const [hasWarranty, setHasWarranty] = useState(asset?.hasWarranty ?? initialValues?.hasWarranty ?? true);
  const [lifecycleStatus, setLifecycleStatus] = useState<AssetLifecycleStatus>(asset?.lifecycleStatus ?? "ADDED");
  const suggestedBrand = asset?.brand ?? initialValues?.brand ?? "";
  const initialBrandId = asset?.brandId ?? initialValues?.brandId ?? brands.find((item) => item.name.toLowerCase() === suggestedBrand.toLowerCase())?.id ?? "";
  const [brandId, setBrandId] = useState(initialBrandId);
  const [customBrand, setCustomBrand] = useState(Boolean(suggestedBrand) && !initialBrandId);

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || undefined;

    await onSubmit({
      name: String(form.get("name")).trim(),
      brand: customBrand ? String(form.get("brand")).trim() : brands.find((item) => item.id === brandId)?.name ?? "",
      brandId: customBrand ? null : brandId,
      model: optional("model"),
      serialNumber: optional("serialNumber"),
      categoryId: String(form.get("categoryId")),
      purchasePrice: Number(form.get("purchasePrice")),
      purchaseDate: String(form.get("purchaseDate")),
      hasWarranty,
      warrantyDuration: hasWarranty ? Number(form.get("warrantyDuration")) : null,
      warrantyType: hasWarranty ? warrantyType : null,
      lifecycleStatus,
      sellerName: optional("sellerName"),
      sellerPhone: optional("sellerPhone"),
      sellerAddress: optional("sellerAddress"),
      productImageUrl: optional("productImageUrl"),
      notes: optional("notes"),
    });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4 sm:p-6" role="dialog" aria-modal="true" aria-labelledby="asset-form-title">
    <div className="max-h-[94vh] w-full max-w-3xl overflow-hidden rounded-l-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="max-h-[94vh] overflow-y-auto">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4">
        <div><h2 id="asset-form-title" className="text-xl font-semibold text-[#111d32]">{asset ? "Edit asset" : "Add a new asset"}</h2><p className="mt-1 text-sm text-[#686d77]">{asset ? "Update warranty and purchase information." : "Store the purchase and warranty details in your portfolio."}</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-[#eef1f8]" aria-label="Close asset form">×</button>
      </div>
      <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
        <label className={labelClass}>Asset name <span className="text-[#ba1a1a]">*</span><input name="name" required minLength={2} maxLength={150} defaultValue={asset?.name ?? initialValues?.name} className={inputClass}/></label>
        <label className={labelClass}>Brand <span className="text-[#ba1a1a]">*</span><select value={customBrand ? "__custom" : brandId} onChange={(event) => { const value = event.target.value; setCustomBrand(value === "__custom"); setBrandId(value === "__custom" ? "" : value); }} required className={inputClass}><option value="" disabled>Select a brand</option>{brands.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}<option value="__custom">Other — type a brand</option></select></label>
        {customBrand && <label className={labelClass}>Custom brand <span className="text-[#ba1a1a]">*</span><input name="brand" required minLength={2} maxLength={80} defaultValue={suggestedBrand} className={inputClass}/></label>}
        <label className={labelClass}>Model<input name="model" defaultValue={asset?.model ?? initialValues?.model ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Serial number<input name="serialNumber" defaultValue={asset?.serialNumber ?? initialValues?.serialNumber ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Category <span className="text-[#ba1a1a]">*</span><select name="categoryId" required defaultValue={asset?.categoryId ?? initialValues?.categoryId ?? ""} className={inputClass}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className={labelClass}>Purchase price <span className="text-[#ba1a1a]">*</span><input name="purchasePrice" type="number" min="0.01" step="0.01" required defaultValue={asset?.purchasePrice ?? initialValues?.purchasePrice} className={inputClass}/></label>
        <label className={labelClass}>Purchase date <span className="text-[#ba1a1a]">*</span><input name="purchaseDate" type="date" required defaultValue={asset?.purchaseDate.slice(0, 10) ?? initialValues?.purchaseDate} className={inputClass}/></label>
        <label className="flex items-center gap-3 text-sm font-medium text-[#17243a] sm:col-span-2"><input type="checkbox" checked={hasWarranty} onChange={(event) => setHasWarranty(event.target.checked)} className="h-4 w-4 accent-[#4b41e1]"/>This asset has a warranty</label>
        {hasWarranty && <><label className={labelClass}>Warranty duration (months) <span className="text-[#ba1a1a]">*</span><input name="warrantyDuration" type="number" min="1" step="1" required defaultValue={asset?.warrantyDuration ?? initialValues?.warrantyDuration ?? 12} className={inputClass}/></label>
        <label className={labelClass}>Warranty type <span className="text-[#ba1a1a]">*</span><select value={warrantyType} onChange={(event) => setWarrantyType(event.target.value as WarrantyType)} className={inputClass}><option value="MANUFACTURER">Manufacturer</option><option value="EXTENDED">Extended</option></select></label></>}
        {asset && <label className={labelClass}>Asset state<select value={lifecycleStatus} onChange={(event) => setLifecycleStatus(event.target.value as AssetLifecycleStatus)} className={inputClass}><option value="ADDED">Added</option><option value="ARCHIVED">Archived</option></select></label>}
        <label className={labelClass}>Seller name<input name="sellerName" defaultValue={asset?.sellerName ?? initialValues?.sellerName ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Seller phone<input name="sellerPhone" defaultValue={asset?.sellerPhone ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Image URL<input name="productImageUrl" type="url" defaultValue={asset?.productImageUrl ?? ""} className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Seller address<input name="sellerAddress" defaultValue={asset?.sellerAddress ?? ""} className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Notes<textarea name="notes" rows={3} defaultValue={asset?.notes ?? ""} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#4b41e1] focus:ring-2 focus:ring-[#e2dfff]"/></label>
        <div className="flex justify-end gap-3 border-t border-[#e1e4ec] pt-5 sm:col-span-2">
          {onBack && <button type="button" onClick={onBack} disabled={pending} className="mr-auto h-11 rounded-lg px-2 text-sm font-semibold text-[#4b41e1]">Back to documents</button>}
          <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-5 text-sm font-semibold text-[#17243a]">Cancel</button>
          <button disabled={pending || categories.length === 0} className="flex h-11 items-center gap-2 rounded-lg bg-[#4b41e1] px-5 text-sm font-semibold text-white hover:bg-[#645efb] disabled:cursor-not-allowed disabled:opacity-60"><Icon name={asset ? "check" : "plus"} className="h-4 w-4"/>{pending ? "Saving…" : asset ? "Save changes" : "Add asset"}</button>
        </div>
      </form>
      </div>
    </div>
  </div>;
}
