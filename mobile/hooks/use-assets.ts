import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createAsset,
  getAsset,
  getAssets,
  getBrands,
  getCategories,
  updateAsset,
  type AssetQuery,
} from "../lib/assets-api";
import type { AssetInput } from "../lib/types";
import { keys, useInvalidate, useSignedIn } from "./query-keys";
import { usePagedQuery } from "./use-paged-query";

export function useAssetList(query: AssetQuery) {
  return usePagedQuery(keys.assets(query), (page) => getAssets({ ...query, page }), {
    enabled: useSignedIn(),
  });
}

export const useAsset = (id: string | undefined) =>
  useQuery({
    queryKey: keys.asset(id ?? ""),
    queryFn: () => getAsset(id as string),
    enabled: useSignedIn() && Boolean(id),
  });

export const useCategories = () =>
  useQuery({ queryKey: keys.categories, queryFn: getCategories, staleTime: 5 * 60_000 });

export const useBrands = () =>
  useQuery({ queryKey: keys.brands, queryFn: getBrands, staleTime: 5 * 60_000 });

/** Creates a new asset, or updates one when an id is given. */
export function useSaveAsset(id?: string) {
  const invalidate = useInvalidate();
  return useMutation({
    mutationFn: (input: Partial<AssetInput>) =>
      id ? updateAsset(id, input) : createAsset(input as AssetInput),
    onSuccess: () => invalidate.assets(),
  });
}
