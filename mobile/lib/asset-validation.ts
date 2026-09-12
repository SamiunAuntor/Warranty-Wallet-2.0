import type { AssetInput } from "./assets-api";

export type AssetDraft = {
  name: string;
  brand: string;
  categoryId: string;
  purchasePrice: string;
  purchaseDate: string;
};

export type ValidationResult<T> =
  | { valid: true; value: T }
  | { valid: false; message: string };

export function createEmptyAssetDraft(): AssetDraft {
  return {
    name: "",
    brand: "",
    categoryId: "",
    purchasePrice: "",
    purchaseDate: new Date().toISOString().slice(0, 10),
  };
}

export function normalizeAssetDraft(draft: AssetDraft): AssetDraft {
  return {
    name: draft.name.trim(),
    brand: draft.brand.trim(),
    categoryId: draft.categoryId.trim(),
    purchasePrice: draft.purchasePrice.trim(),
    purchaseDate: draft.purchaseDate.trim(),
  };
}

export function validateAssetDraft(draft: AssetDraft): ValidationResult<AssetInput> {
  const normalized = normalizeAssetDraft(draft);

  if (!normalized.name || !normalized.brand || !normalized.categoryId) {
    return {
      valid: false,
      message: "Name, brand, and category are required.",
    };
  }

  const purchasePrice = Number(normalized.purchasePrice);

  if (!normalized.purchasePrice || !Number.isFinite(purchasePrice) || purchasePrice < 0) {
    return {
      valid: false,
      message: "Enter a valid purchase price.",
    };
  }

  if (!isIsoDate(normalized.purchaseDate)) {
    return {
      valid: false,
      message: "Enter the purchase date as YYYY-MM-DD.",
    };
  }

  return {
    valid: true,
    value: {
      name: normalized.name,
      brand: normalized.brand,
      categoryId: normalized.categoryId,
      purchasePrice,
      purchaseDate: normalized.purchaseDate,
      hasWarranty: false,
    },
  };
}

function isIsoDate(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;

  const date = new Date(`${value}T00:00:00Z`);

  return (
    date.getUTCFullYear() === Number(value.slice(0, 4)) &&
    date.getUTCMonth() + 1 === Number(value.slice(5, 7)) &&
    date.getUTCDate() === Number(value.slice(8, 10))
  );
}
