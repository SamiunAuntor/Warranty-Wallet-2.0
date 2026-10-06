import { useMutation, useQuery } from "@tanstack/react-query";
import {
  createBrand,
  createCategory,
  deleteBrand,
  deleteCategory,
  getAdminBrands,
  getAdminCategories,
  updateBrand,
  updateCategory,
} from "../lib/admin-api";
import type { Brand, Category, Paginated } from "../lib/types";
import { useAuth } from "../providers/auth-provider";
import { keys, useInvalidate } from "./query-keys";

export type CatalogKind = "category" | "brand";
export type CatalogItem = Category | Brand;

export type CatalogInput = {
  name: string;
  description: string | null;
  websiteUrl?: string | null;
};

export function useAdminCatalog(kind: CatalogKind, search: string) {
  const { status, isAdmin } = useAuth();
  return useQuery({
    queryKey: keys.admin("catalog", kind, search),
    queryFn: (): Promise<Paginated<CatalogItem>> =>
      kind === "category" ? getAdminCategories({ search }) : getAdminBrands({ search }),
    enabled: status === "signedIn" && isAdmin,
    select: (result) => result.data,
  });
}

export function useCatalogActions(kind: CatalogKind) {
  const invalidate = useInvalidate();
  const refresh = () => invalidate.catalog();

  const save = useMutation({
    mutationFn: ({ id, input }: { id?: string; input: CatalogInput }): Promise<CatalogItem> => {
      if (kind === "category") {
        const body = { name: input.name, description: input.description };
        return id ? updateCategory(id, body) : createCategory(body);
      }
      return id ? updateBrand(id, input) : createBrand(input);
    },
    onSuccess: refresh,
  });

  const setActive = useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }): Promise<CatalogItem> =>
      kind === "category" ? updateCategory(id, { isActive }) : updateBrand(id, { isActive }),
    onSuccess: refresh,
  });

  const remove = useMutation({
    mutationFn: (id: string) => (kind === "category" ? deleteCategory(id) : deleteBrand(id)),
    onSuccess: refresh,
  });

  return { save, setActive, remove };
}
