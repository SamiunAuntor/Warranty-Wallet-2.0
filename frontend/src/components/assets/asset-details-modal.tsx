"use client";

import { Icon } from "@/components/icons";
import type { Asset } from "@/lib/assets-api";
import { claimStatusLabels } from "@/lib/claim-display";

type Props = {
  asset: Asset;
  onClose: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onRaiseClaim: () => void;
};

const formatter = new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" });
const date = (value: string | null) => value ? new Intl.DateTimeFormat("en-US", { dateStyle: "medium" }).format(new Date(value)) : "Not provided";

export function AssetDetailsModal({ asset, onClose, onEdit, onDelete, onRaiseClaim }: Props) {
  const rows = [
    ["Brand", asset.brand],
    ["Model", asset.model || "Not provided"],
    ["Category", asset.category.name],
    ["Serial number", asset.serialNumber || "Not provided"],
    ["Purchase price", formatter.format(Number(asset.purchasePrice))],
    ["Purchase date", date(asset.purchaseDate)],
    ["Warranty expires", date(asset.expiryDate)],
    ["Warranty type", !asset.hasWarranty ? "No warranty" : asset.warrantyType === "EXTENDED" ? "Extended" : "Manufacturer"],
    ["Asset state", asset.lifecycleStatus === "ARCHIVED" ? "Archived" : "Added"],
    ["Seller", asset.sellerName || "Not provided"],
    ["Documents", String(asset.documents?.length ?? 0)],
  ];

  return <div className="fixed inset-0 z-[70] flex items-center justify-center bg-[#111827]/45 p-4" role="dialog" aria-modal="true" aria-labelledby="asset-details-title">
    <div className="max-h-[92vh] w-full max-w-3xl overflow-y-auto rounded-2xl bg-white shadow-2xl">
      <div className="flex items-start justify-between bg-[#f5f6ff] p-6"><div className="flex gap-4"><div className="flex h-16 w-16 items-center justify-center rounded-xl bg-[#e4e8ff] text-[#4b41e1]"><Icon name="products" className="h-8 w-8"/></div><div><span className="rounded-full bg-[#e5f7ed] px-2.5 py-1 text-[11px] font-semibold text-[#2c8657]">{asset.warrantyStatus.replaceAll("_", " ")}</span><h2 id="asset-details-title" className="mt-2 text-2xl font-semibold text-[#111d32]">{asset.name}</h2></div></div><button onClick={onClose} className="rounded-lg p-2 text-[#596170] hover:bg-white" aria-label="Close asset details">×</button></div>
      <div className="grid gap-x-6 gap-y-4 p-6 sm:grid-cols-2">{rows.map(([label, value]) => <div key={label} className="border-b border-[#eceef4] pb-3"><p className="text-xs font-medium uppercase tracking-wide text-[#787e8a]">{label}</p><p className="mt-1 text-sm font-medium text-[#17243a]">{value}</p></div>)}{asset.notes && <div className="sm:col-span-2"><p className="text-xs font-medium uppercase tracking-wide text-[#787e8a]">Notes</p><p className="mt-2 rounded-lg bg-[#f7f8fc] p-3 text-sm leading-6 text-[#45464d]">{asset.notes}</p></div>}</div>
      {asset.claims && asset.claims.length > 0 && <section className="border-t border-[#e1e4ec] px-6 py-5"><h3 className="font-semibold text-[#17243a]">Claim history</h3><div className="mt-3 space-y-2">{asset.claims.map((claim) => <div key={claim.id} className="flex items-center justify-between rounded-lg bg-[#f7f8fc] p-3"><div><p className="text-sm font-semibold text-[#17243a]">{claim.title}</p><p className="text-xs text-[#707684]">{claim.claimNumber} · {date(claim.updatedAt)}</p></div><span className="rounded-full bg-[#eee9ff] px-2.5 py-1 text-xs font-semibold text-[#5942d6]">{claimStatusLabels[claim.status]}</span></div>)}</div></section>}
      <div className="flex justify-between border-t border-[#e1e4ec] bg-[#fafbfe] p-4"><button onClick={onDelete} className="rounded-lg px-4 py-2 text-sm font-semibold text-[#ba1a1a] hover:bg-[#fff0f0]">Delete asset</button><div className="flex gap-2"><button onClick={onRaiseClaim} className="rounded-lg border border-[#5b47ee] bg-white px-4 py-2 text-sm font-semibold text-[#5b47ee]">Raise a claim</button><button onClick={onClose} className="rounded-lg border border-[#c9ccd5] bg-white px-4 py-2 text-sm font-semibold">Close</button><button onClick={onEdit} className="rounded-lg bg-[#4b41e1] px-4 py-2 text-sm font-semibold text-white hover:bg-[#645efb]">Edit asset</button></div></div>
    </div>
  </div>;
}
