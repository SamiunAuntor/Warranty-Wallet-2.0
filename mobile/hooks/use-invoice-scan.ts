import { useMutation } from "@tanstack/react-query";
import { extractInvoice } from "../lib/ai-api";
import type { Brand, Category, ExtractedAssetData, NativeFile } from "../lib/types";

const normalize = (value: string) => value.trim().toLowerCase();

/** Finds the catalog entry whose name best matches text from an invoice. */
function matchByName<T extends { id: string; name: string }>(items: T[], text?: string | null) {
  if (!text?.trim()) return undefined;
  const target = normalize(text);
  return (
    items.find((item) => normalize(item.name) === target) ??
    items.find((item) => target.includes(normalize(item.name)) || normalize(item.name).includes(target))
  );
}

export type InvoiceScanResult = {
  data: ExtractedAssetData;
  file: NativeFile;
  categoryId?: string;
  brandId?: string | null;
};

/** Sends an invoice to the AI extraction endpoint and matches the catalog. */
export function useInvoiceScan(categories: Category[], brands: Brand[]) {
  return useMutation({
    mutationFn: async (file: NativeFile): Promise<InvoiceScanResult> => {
      const data = await extractInvoice(file);
      const brand = matchByName(brands, data.brand);
      return {
        data,
        file,
        categoryId: matchByName(categories, data.category)?.id,
        brandId: brand ? brand.id : data.brand ? null : undefined,
      };
    },
  });
}
