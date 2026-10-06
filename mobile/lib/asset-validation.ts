import { fromIsoDate, toIsoDate } from "./format";
import type { Asset, AssetInput, ExtractedAssetData, WarrantyType } from "./types";

/** Form state. Every text input is kept as a string until submit. */
export type AssetDraft = {
  name: string;
  brand: string;
  brandId: string | null;
  model: string;
  serialNumber: string;
  categoryId: string;
  purchasePrice: string;
  purchaseDate: string;
  hasWarranty: boolean;
  warrantyDuration: string;
  warrantyType: WarrantyType;
  sellerName: string;
  sellerPhone: string;
  sellerAddress: string;
  notes: string;
};

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; message: string; field?: keyof AssetDraft };

export function createEmptyAssetDraft(): AssetDraft {
  return {
    name: "",
    brand: "",
    brandId: null,
    model: "",
    serialNumber: "",
    categoryId: "",
    purchasePrice: "",
    purchaseDate: toIsoDate(new Date()),
    hasWarranty: true,
    warrantyDuration: "12",
    warrantyType: "MANUFACTURER",
    sellerName: "",
    sellerPhone: "",
    sellerAddress: "",
    notes: "",
  };
}

export function assetToDraft(asset: Asset): AssetDraft {
  return {
    name: asset.name,
    brand: asset.brand,
    brandId: asset.brandId,
    model: asset.model ?? "",
    serialNumber: asset.serialNumber ?? "",
    categoryId: asset.categoryId,
    purchasePrice: String(Number(asset.purchasePrice)),
    purchaseDate: asset.purchaseDate.slice(0, 10),
    hasWarranty: asset.hasWarranty,
    warrantyDuration: asset.warrantyDuration ? String(asset.warrantyDuration) : "12",
    warrantyType: asset.warrantyType ?? "MANUFACTURER",
    sellerName: asset.sellerName ?? "",
    sellerPhone: asset.sellerPhone ?? "",
    sellerAddress: asset.sellerAddress ?? "",
    notes: asset.notes ?? "",
  };
}

/** Merges AI-extracted invoice data into a draft without clearing fields. */
export function applyExtraction(
  draft: AssetDraft,
  data: ExtractedAssetData,
  match: { categoryId?: string; brandId?: string | null },
): AssetDraft {
  const text = (value: string | null | undefined, fallback: string) =>
    value?.trim() ? value.trim() : fallback;
  const next: AssetDraft = {
    ...draft,
    name: text(data.productName, draft.name),
    brand: text(data.brand, draft.brand),
    brandId: match.brandId !== undefined ? match.brandId : draft.brandId,
    model: text(data.model, draft.model),
    serialNumber: text(data.serialNumber, draft.serialNumber),
    categoryId: match.categoryId ?? draft.categoryId,
    sellerName: text(data.sellerName, draft.sellerName),
  };
  if (data.purchasePrice && data.purchasePrice > 0) next.purchasePrice = String(data.purchasePrice);
  if (data.purchaseDate && fromIsoDate(data.purchaseDate)) next.purchaseDate = data.purchaseDate;
  if (data.warrantyDuration && data.warrantyDuration > 0) {
    next.hasWarranty = true;
    next.warrantyDuration = String(data.warrantyDuration);
  }
  if (data.warrantyType) next.warrantyType = data.warrantyType;
  return next;
}

const optional = (value: string) => (value.trim() ? value.trim() : undefined);

export function validateAssetDraft(draft: AssetDraft): ValidationResult<AssetInput> {
  const name = draft.name.trim();
  const brand = draft.brand.trim();
  if (name.length < 2) {
    return { valid: false, field: "name", message: "Enter a product name of at least 2 characters." };
  }
  if (brand.length < 2) {
    return { valid: false, field: "brand", message: "Enter a brand of at least 2 characters." };
  }
  if (!draft.categoryId) {
    return { valid: false, field: "categoryId", message: "Choose a category." };
  }

  const purchasePrice = Number(draft.purchasePrice.replace(/,/g, "").trim());
  if (!Number.isFinite(purchasePrice) || purchasePrice <= 0) {
    return { valid: false, field: "purchasePrice", message: "Enter a purchase price above zero." };
  }

  const purchaseDate = fromIsoDate(draft.purchaseDate);
  if (!purchaseDate) {
    return { valid: false, field: "purchaseDate", message: "Choose the purchase date." };
  }
  if (purchaseDate.getTime() > Date.now()) {
    return { valid: false, field: "purchaseDate", message: "The purchase date cannot be in the future." };
  }

  let warrantyDuration: number | null = null;
  if (draft.hasWarranty) {
    warrantyDuration = Number(draft.warrantyDuration.trim());
    if (!Number.isInteger(warrantyDuration) || warrantyDuration <= 0 || warrantyDuration > 240) {
      return {
        valid: false,
        field: "warrantyDuration",
        message: "Enter the warranty length in whole months (1–240).",
      };
    }
  }

  return {
    valid: true,
    value: {
      name,
      brand,
      brandId: draft.brandId,
      categoryId: draft.categoryId,
      purchasePrice,
      purchaseDate: toIsoDate(purchaseDate),
      hasWarranty: draft.hasWarranty,
      warrantyDuration,
      warrantyType: draft.hasWarranty ? draft.warrantyType : null,
      model: optional(draft.model),
      serialNumber: optional(draft.serialNumber),
      sellerName: optional(draft.sellerName),
      sellerPhone: optional(draft.sellerPhone),
      sellerAddress: optional(draft.sellerAddress),
      notes: optional(draft.notes),
    },
  };
}

/**
 * The update endpoint accepts null to clear an optional field, while create
 * expects the field to be left out. Converts a create payload for updates.
 */
export function toAssetUpdate(input: AssetInput): Partial<AssetInput> {
  return {
    ...input,
    model: input.model ?? null,
    serialNumber: input.serialNumber ?? null,
    sellerName: input.sellerName ?? null,
    sellerPhone: input.sellerPhone ?? null,
    sellerAddress: input.sellerAddress ?? null,
    notes: input.notes ?? null,
  };
}
