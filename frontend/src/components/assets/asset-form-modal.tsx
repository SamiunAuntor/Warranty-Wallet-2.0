"use client";

import { useState, type FormEvent } from "react";
import { Icon } from "@/components/icons";
import type { Asset, AssetInput, Category, WarrantyType } from "@/lib/assets-api";

type Props = {
  asset?: Asset | null;
  categories: Category[];
  pending: boolean;
  onClose: () => void;
  onSubmit: (input: AssetInput) => Promise<void>;
};

const inputClass = "h-11 w-full rounded-lg border border-[#c9ccd5] bg-white px-3 text-sm outline-none transition focus:border-[#4b41e1] focus:ring-2 focus:ring-[#e2dfff]";
const labelClass = "space-y-1.5 text-sm font-medium text-[#17243a]";

export function AssetFormModal({ asset, categories, pending, onClose, onSubmit }: Props) {
  const [warrantyType, setWarrantyType] = useState<WarrantyType>(asset?.warrantyType ?? "MANUFACTURER");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const optional = (name: string) => String(form.get(name) ?? "").trim() || undefined;

    await onSubmit({
      name: String(form.get("name")).trim(),
      brand: String(form.get("brand")).trim(),
      model: optional("model"),
      serialNumber: optional("serialNumber"),
      categoryId: String(form.get("categoryId")),
      purchasePrice: Number(form.get("purchasePrice")),
      purchaseDate: String(form.get("purchaseDate")),
      warrantyDuration: Number(form.get("warrantyDuration")),
      warrantyType,
      sellerName: optional("sellerName"),
      sellerPhone: optional("sellerPhone"),
      sellerAddress: optional("sellerAddress"),
      productImageUrl: optional("productImageUrl"),
      notes: optional("notes"),
    });
  };

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="asset-form-title">
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-[#f8f9ff] shadow-2xl">
      <div className="sticky top-0 z-10 flex items-center justify-between border-b border-[#e1e4ec] bg-white px-6 py-4">
        <div><h2 id="asset-form-title" className="text-xl font-semibold text-[#111d32]">{asset ? "Edit asset" : "Add a new asset"}</h2><p className="mt-1 text-sm text-[#686d77]">{asset ? "Update warranty and purchase information." : "Store the purchase and warranty details in your portfolio."}</p></div>
        <button type="button" onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-[#eef1f8]" aria-label="Close asset form">×</button>
      </div>
      <form onSubmit={submit} className="grid gap-5 p-6 sm:grid-cols-2">
        <label className={labelClass}>Asset name <span className="text-[#ba1a1a]">*</span><input name="name" required minLength={2} maxLength={150} defaultValue={asset?.name} className={inputClass}/></label>
        <label className={labelClass}>Brand <span className="text-[#ba1a1a]">*</span><input name="brand" required minLength={2} maxLength={80} defaultValue={asset?.brand} className={inputClass}/></label>
        <label className={labelClass}>Model<input name="model" defaultValue={asset?.model ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Serial number<input name="serialNumber" defaultValue={asset?.serialNumber ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Category <span className="text-[#ba1a1a]">*</span><select name="categoryId" required defaultValue={asset?.categoryId ?? ""} className={inputClass}><option value="" disabled>Select a category</option>{categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}</select></label>
        <label className={labelClass}>Purchase price <span className="text-[#ba1a1a]">*</span><input name="purchasePrice" type="number" min="0.01" step="0.01" required defaultValue={asset?.purchasePrice} className={inputClass}/></label>
        <label className={labelClass}>Purchase date <span className="text-[#ba1a1a]">*</span><input name="purchaseDate" type="date" required defaultValue={asset?.purchaseDate.slice(0, 10)} className={inputClass}/></label>
        <label className={labelClass}>Warranty duration (months) <span className="text-[#ba1a1a]">*</span><input name="warrantyDuration" type="number" min="1" step="1" required defaultValue={asset?.warrantyDuration ?? 12} className={inputClass}/></label>
        <label className={labelClass}>Warranty type <span className="text-[#ba1a1a]">*</span><select value={warrantyType} onChange={(event) => setWarrantyType(event.target.value as WarrantyType)} className={inputClass}><option value="MANUFACTURER">Manufacturer</option><option value="EXTENDED">Extended</option></select></label>
        <label className={labelClass}>Seller name<input name="sellerName" defaultValue={asset?.sellerName ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Seller phone<input name="sellerPhone" defaultValue={asset?.sellerPhone ?? ""} className={inputClass}/></label>
        <label className={labelClass}>Image URL<input name="productImageUrl" type="url" defaultValue={asset?.productImageUrl ?? ""} className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Seller address<input name="sellerAddress" defaultValue={asset?.sellerAddress ?? ""} className={inputClass}/></label>
        <label className={`${labelClass} sm:col-span-2`}>Notes<textarea name="notes" rows={3} defaultValue={asset?.notes ?? ""} className="w-full rounded-lg border border-[#c9ccd5] bg-white px-3 py-2 text-sm outline-none transition focus:border-[#4b41e1] focus:ring-2 focus:ring-[#e2dfff]"/></label>
        <div className="flex justify-end gap-3 border-t border-[#e1e4ec] pt-5 sm:col-span-2">
          <button type="button" onClick={onClose} disabled={pending} className="h-11 rounded-lg border border-[#c9ccd5] bg-white px-5 text-sm font-semibold text-[#17243a]">Cancel</button>
          <button disabled={pending || categories.length === 0} className="flex h-11 items-center gap-2 rounded-lg bg-[#4b41e1] px-5 text-sm font-semibold text-white hover:bg-[#645efb] disabled:cursor-not-allowed disabled:opacity-60"><Icon name={asset ? "check" : "plus"} className="h-4 w-4"/>{pending ? "Saving…" : asset ? "Save changes" : "Add asset"}</button>
        </div>
      </form>
    </div>
  </div>;
}
